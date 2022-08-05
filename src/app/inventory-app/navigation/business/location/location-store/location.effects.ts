import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../app-store/app.reducer';
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
import { Location } from '../../../../models/location.model';
import { Inventory } from '../../../../models/inventory.model';
import { LocationService } from 'src/app/inventory-app/inventory-app-control/location.service';
import { Product } from 'src/app/inventory-app/models/product.model';

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
      'An unknown location error has occurred.';
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
        console.warn('|||[Location] fetchUserLocations$ effect called |||');
        return this.http
          .get<Location[]>(
            environment.apiUrl +
              '/user/locations/' +
              action.userId +
              '/' +
              action.userRole
          )
          .pipe(
            map((locations) => {
              if (
                locations &&
                locations.length > 0
              ) {
                const userLocations = locations;
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
            }),
            catchError((errorRes) => {
              console.log(errorRes.error.message);
              return handleError(errorRes);
            })
          );
      })
    )
  );

  addProductsToLocation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.POSTCreateProductForLocationStart),
      withLatestFrom(this.store.select('user'), this.store.select('business')),
      concatMap(([action, authState, businessState]) => {
        console.warn('|||[Location] addProductToLocation$ effect called |||');
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

              if (authState.user.role === 3) {
                return BusinessActions.GETBusinessLocationsStart({
                  businessId: businessState.business.id,
                });
              } else {
                return LocationActions.GETUserLocationsStart({
                  userId: authState.user.id,
                  userRole: authState.user.role,
                });
              }
            }),
            catchError((errorRes) => {
              console.log(errorRes);
              return handleError(errorRes);
            })
          );
      })
    )
  );

  addNewInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.POSTCreateInventoryForLocationStart),
      withLatestFrom(this.store.select('user'), this.store.select('business')),
      concatMap(([action, authState, businessState]) => {
        console.warn('|||[Location] addNewInventory$ effect called |||');
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

              localStorage.removeItem('inventoryData');

              this.store.dispatch(
                LocationActions.GETLocationInventoriesStart({
                  locationId: action.location.id,
                })
              );
              if (authState.user.department !== 'admin') {
                console.log(
                  "|||[Location] Fetching Non-Owner USER's Locations |||"
                );
                return LocationActions.GETUserLocationsStart({
                  userId: authState.user.id,
                  userRole: authState.user.role,
                });
              } else {
                console.log(
                  "|||[Location] Fetching OWNER's BUSINESS Locations |||"
                );
                return BusinessActions.GETBusinessLocationsStart({
                  businessId: businessState.business.id,
                });
              }
            }),
            catchError((errorRes) => {
              console.warn(errorRes);
              return handleError(errorRes);
            })
          );
      })
    )
  );

  updateLocationProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.PUTUpdateProductForLocationStart),
      withLatestFrom(this.store.select('user'), this.store.select('business')),
      exhaustMap(([action, authState, businessState]) => {
        console.warn('|||[Location] updateLocationProduct$ effect called |||');

        return this.http
          .put<{ updatedProduct: Product; updatedLocation: Location }>(
            BACKEND_URL + '/update-product',
            {
              product: action.product,
            }
          )
          .pipe(
            map((resData) => {
              console.log(resData);
              console.warn('|||updateLocationProduct$ resData |||');
              if (resData.updatedProduct) {
                // UPDATE THE LOCATION LOCALLY AND ACTIVATE IT
                localStorage.setItem(
                  'activatedLocation',
                  JSON.stringify(resData.updatedLocation)
                );
                this.store.dispatch(
                  LocationActions.ActivateLocation({
                    location: resData.updatedLocation,
                  })
                );
                // STOP LOADING AND CLEAR ERRORS
                this.store.dispatch(
                  LocationActions.PUTUpdateProductForLocationSuccess({
                    updatedProduct: resData.updatedProduct,
                  })
                );
                this.store.dispatch(
                  LocationActions.GETLocationInventoriesStart({
                    locationId: resData.updatedProduct.location,
                  })
                );
              }
              if (authState.user.role === 3) {
                return BusinessActions.GETBusinessLocationsStart({
                  businessId: businessState.business.id,
                });
              } else {
                return LocationActions.GETUserLocationsStart({
                  userId: authState.user.id,
                  userRole: authState.user.role,
                });
              }
            }),
            catchError((errorRes) => {
              console.warn(errorRes);
              return handleError(errorRes);
            })
          );
      })
    )
  );

  updateLocationInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.PUTUpdateInventoryForLocationStart),
      withLatestFrom(this.store.select('user'), this.store.select('business')),
      exhaustMap(([action, authState, businessState]) => {
        console.warn(
          '|||[Location] updateLocationInventory$ effect called |||'
        );

        return this.http
          .put<{ updatedInventory: Inventory }>(
            BACKEND_URL + '/update-inventory',
            {
              inventory: action.inventory,
            }
          )
          .pipe(
            map((resData) => {
              if (resData.updatedInventory) {
                this.store.dispatch(
                  LocationActions.PUTUpdateInventoryForLocationSuccess({
                    updatedInventory: resData.updatedInventory,
                  })
                );
                this.store.dispatch(
                  LocationActions.GETLocationInventoriesStart({
                    locationId: resData.updatedInventory.location,
                  })
                );
              }
              if (authState.user.role === 3) {
                return BusinessActions.GETBusinessLocationsStart({
                  businessId: businessState.business.id,
                });
              } else {
                return LocationActions.GETUserLocationsStart({
                  userId: authState.user.id,
                  userRole: authState.user.role,
                });
              }
            }),
            catchError((errorRes) => {
              console.warn(errorRes);
              return handleError(errorRes);
            })
          );
      })
    )
  );

  deleteProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationActions.POSTDeleteProductsFromLocationStart),
      withLatestFrom(this.store.select('user'), this.store.select('business')),
      exhaustMap(([action, userState, businessState]) => {
        console.warn('||| [Location] deleteProducts$ effect called |||');

        return this.http
          .post<{ message: string }>(
            environment.apiUrl + '/product/product-delete',
            {
              productIds: action.productIds,
              locationId: action.locationId,
            }
          )
          .pipe(
            map((resData) => {
              console.log(resData);
              console.warn('||| ^^^ deleteProducts$ resData ^^^ |||');

              if (+userState.user.role === 3) {
                this.store.dispatch(
                  BusinessActions.GETBusinessLocationsStart({
                    businessId: businessState.business.id,
                  })
                );
              } else {
                this.store.dispatch(
                  LocationActions.GETUserLocationsStart({
                    userId: userState.user.id,
                    userRole: userState.user.role,
                  })
                );
              }

              return LocationActions.POSTDeleteProductsFromLocationSuccess();
            }),
            catchError((errorRes) => {
              console.error(errorRes);
              this.store.dispatch(LocationActions.LoadStop());
              return handleError(errorRes);
            })
          );
      })
    )
  );

  // fetchLocationInventories$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(LocationActions.GETLocationInventoriesStart),
  //     switchMap((action) => {
  //       console.warn(
  //         '||| [Location] fetchLocationInventories$ effect called |||'
  //       );

  //       return this.http
  //         .get<{ fetchedInventories: Inventory[]; message: string }>(
  //           BACKEND_URL + '/fetch-location-inventories/' + action.locationId
  //         )
  //         .pipe(
  //           map((resData) => {
  //             const inventoryData = resData.fetchedInventories;
  //             if (
  //               resData &&
  //               resData.fetchedInventories &&
  //               resData.fetchedInventories.length > 0
  //             ) {
  //               let draft: Inventory = null;
  //               localStorage.setItem(
  //                 'inventoryData',
  //                 JSON.stringify(inventoryData)
  //               );

  //               for (const inv of resData.fetchedInventories) {
  //                 if (!inv.isFinal) {
  //                   draft = inv;
  //                 }
  //               }
  //               if (draft) {
  //                 console.log(draft);
  //               }

  //               return LocationActions.GETLocationInventoriesSuccess({
  //                 inventoryData: [...resData.fetchedInventories],
  //                 draft: draft,
  //               });
  //             }
  //           }),
  //           catchError((errorRes) => {
  //             console.error(errorRes);
  //             return handleError(errorRes);
  //           })
  //         );
  //     })
  //   )
  // );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<fromAppStore.AppState>,
    private locationService: LocationService
  ) {}
}
