import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../app-store/app.reducer';
import * as LocationActions from './location.actions';
import * as BusinessActions from '../../business-store/business.actions';

import {
  switchMap,
  map,
  of,
  concatMap,
  catchError,
  withLatestFrom,
  exhaustMap,
  // withLatestFrom,
} from 'rxjs';

import { environment } from 'src/environments/environment';
import { Location } from '../../business-control/location.model';
import { Inventory } from '../../business-control/inventory.model';

const BACKEND_URL = environment.apiUrl + '/location';

const handleError = (errorRes: HttpErrorResponse) => {
  console.warn(errorRes);
  let errorMessage = errorRes.error.message;

  if (!errorRes.error.message) {
    console.warn(errorRes);
    errorMessage =
      'Error: ' +
      errorRes.status +
      ' - ' +
      errorRes.statusText +
      'An unknown error has occurred.';
    return of(LocationActions.LocationError({ errorMessage }));
  }

  console.warn(errorMessage);
  return of(LocationActions.LocationError({ errorMessage }));
};

@Injectable()
export class LocationEffects {
  fetchUserLocations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.GETUserLocationsStart),
      switchMap((action) => {
        console.warn('||| fetchUserLocations$ effect called |||===');
        console.log(action);
        return this.http
          .get<{ fetchedLocations: Location[] }>(
            BACKEND_URL +
              '/fetch-user-locations/' +
              action.userId +
              '/' +
              action.userRole
          )
          .pipe(
            map((resData) => {
              console.log(resData);
              if (
                resData &&
                resData.fetchedLocations &&
                resData.fetchedLocations.length > 0
              ) {
                const userLocations = resData.fetchedLocations;
                localStorage.setItem(
                  'userLocations',
                  JSON.stringify(userLocations)
                );

                return LocationActions.GETUserLocationsSuccess({
                  locations: userLocations,
                });
              } else {
                return LocationActions.LocationError({
                  errorMessage:
                    'No authorized locations found. Ask the account owner for access.',
                });
              }
            })
          );
      }),
      catchError((errorRes) => {
        console.log(errorRes);
        return handleError(errorRes);
      })
    )
  );

  addProductsToLocation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.POSTCreateProductForLocationStart),
      withLatestFrom(this.store.select('auth')),
      concatMap(([action, authState]) => {
        console.warn('||| addProductToLocation$ effect called |||===');
        console.log(action);
        console.log(authState.userAuth.userId);
        return this.http
          .post<{ message: string; updatedActiveLocation: Location }>(
            BACKEND_URL + '/new-product',
            {
              product: action.product,
              locationId: action.locationId,
            }
          )
          .pipe(
            map((resData) => {
              console.log(resData);
              console.log(resData.message);

              if (resData && resData.updatedActiveLocation) {
                localStorage.setItem(
                  'activatedLocation',
                  JSON.stringify(resData.updatedActiveLocation)
                );

                this.store.dispatch(
                  LocationActions.ActivateLocation({
                    location: resData.updatedActiveLocation,
                  })
                );
                this.store.dispatch(
                  LocationActions.POSTCreateProductForLocationSuccess()
                );
              }

              return LocationActions.GETUserLocationsStart({
                userId: authState.userAuth.userId,
                userRole: authState.userAuth.userProfile.role,
              });
            })
          );
      }),
      catchError((errorRes) => {
        console.log(errorRes);
        return handleError(errorRes);
      })
    )
  );

  addNewInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.POSTCreateInventoryForLocationStart),
      withLatestFrom(this.store.select('auth')),
      concatMap(([action, authState]) => {
        console.warn('||| addProductToLocation$ effect called |||===');
        console.log(action);
        console.log('||| ^^^ action ^^^ |||');

        return this.http
          .post<{
            message: string;
            newInventory: {
              inventory: Inventory;
              inventoryId: string;
            };
            updatedLocation: Location;
          }>(BACKEND_URL + '/new-inventory', {
            location: action.location,
            inventory: action.inventory,
          })
          .pipe(
            map((resData) => {
              console.log(resData);
              console.log('||| ^^^ resData ^^^ |||');

              if (resData && resData.updatedLocation) {
                localStorage.setItem(
                  'activatedLocation',
                  JSON.stringify(resData.updatedLocation)
                );

                this.store.dispatch(
                  LocationActions.ActivateLocation({
                    location: resData.updatedLocation,
                  })
                );
                this.store.dispatch(
                  LocationActions.POSTCreateProductForLocationSuccess()
                );
              }

              return LocationActions.GETUserLocationsStart({
                userId: authState.userAuth.userId,
                userRole: authState.userAuth.userProfile.role,
              });
            })
          );
      }),
      catchError((errorRes) => {
        console.warn(errorRes);
        return handleError(errorRes);
      })
    )
  );

  updateLocationInventory$ = createEffect(() =>
  this.actions$.pipe(
    ofType(LocationActions.PUTUpdateInventoryForLocationStart),
    withLatestFrom(this.store.select('auth')),
    exhaustMap(([action, authState]) => {
      console.warn('||| updateLocationInventory$ effect called |||===');
      console.log(action);

      return this.http
        .put<{ updatedInventory: Inventory }>(
          BACKEND_URL + '/update-inventory',
          {
            inventory: action.inventory,
          }
        )
        .pipe(
          map((resData) => {
            console.log(resData);
            console.log('||| ^^^ resData ^^^ |||');

            if (resData.updatedInventory) {
              return LocationActions.PUTUpdateInventoryForLocationSuccess({
                updatedInventory: resData.updatedInventory,
              });
            }
            return LocationActions.GETUserLocationsStart({
              userId: authState.userAuth.userId,
              userRole: authState.userAuth.userProfile.role,
            });
          })
        );
    }),
    catchError((errorRes) => {
      console.warn(errorRes);
      return handleError(errorRes);
    })
  )
);

  fetchLocationInventories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.GETLocationInventoriesStart),
      switchMap((action) => {
        console.warn('||| fetchLocationInventories$ effect called |||===');
        console.log(action);

        return this.http
          .get<{ fetchedInventories: Inventory[]; message: string }>(
            BACKEND_URL + '/fetch-location-inventories/' + action.locationId
          )
          .pipe(
            map((resData) => {
              console.log(resData);
              console.log('||| ^^^ resData ^^^ |||');
              if (
                resData &&
                resData.fetchedInventories &&
                resData.fetchedInventories.length > 0
              ) {
                let draft: Inventory = null;
                const inventoryData = resData.fetchedInventories;
                localStorage.setItem(
                  'inventoryData',
                  JSON.stringify(inventoryData)
                );

                for (const inv of resData.fetchedInventories) {
                  if (!inv.isFinal) {
                    draft = inv;
                  }
                }
                console.log(draft);

                return LocationActions.GETLocationInventoriesSuccess({
                  inventoryData: [...resData.fetchedInventories],
                  draft: draft,
                });
              } else {
                return LocationActions.LocationError({
                  errorMessage: 'No inventories found for this location.',
                });
              }
            })
          );
      }),
      catchError((errorRes) => {
        console.warn(errorRes);
        return handleError(errorRes);
      })
    )
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<fromAppStore.AppState>
  ) {}
}
