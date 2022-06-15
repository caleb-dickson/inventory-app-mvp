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
  // withLatestFrom,
} from 'rxjs';

import { environment } from 'src/environments/environment';
import { Location } from '../../business-control/location.model';
import { Inventory } from '../../business-control/inventory.model';

const BACKEND_URL = environment.apiUrl + '/location';

const handleError = (errorRes: HttpErrorResponse) => {
  console.log(errorRes);
  let errorMessage = errorRes.error.message;

  if (!errorRes.error.message) {
    console.log(errorRes);
    errorMessage =
      'Error: ' +
      errorRes.status +
      ' - ' +
      errorRes.statusText +
      'An unknown error has occurred.';
    return of(LocationActions.LocationError({ errorMessage }));
  }

  console.log(errorMessage);
  return of(LocationActions.LocationError({ errorMessage }));
};

@Injectable()
export class LocationEffects {
  fetchLocationInventories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.GETLocationInventoriesStart),
      switchMap((action) => {
        console.log('||| fetchLocationInventories$ effect called |||===');
        console.log(action);

        return this.http.get<{ fetchedInventories: Inventory[], message: string }>(
          BACKEND_URL + '/fetch-location-inventories/' + action.locationId
        ).pipe(
          map((resData) => {
            console.log(resData);
            console.log("||| ^^^ resData ^^^ |||");
            if (
              resData &&
              resData.fetchedInventories &&
              resData.fetchedInventories.length > 0
            ) {
              const inventoryData = resData.fetchedInventories;
              localStorage.setItem(
                'inventoryData',
                JSON.stringify(inventoryData)
              );
              return LocationActions.GETLocationInventoriesSuccess();
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

  fetchUserLocations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.GETUserLocationsStart),
      switchMap((action) => {
        console.log('||| fetchUserLocations$ effect called |||===');
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

  addNewInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.POSTCreateInventoryForLocationStart),
      withLatestFrom(this.store.select('auth')),
      concatMap(([action, authState]) => {
        console.log('||| addProductToLocation$ effect called |||===');
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
        console.log('||| addProductToLocation$ effect called |||===');
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

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<fromAppStore.AppState>
  ) {}
}
