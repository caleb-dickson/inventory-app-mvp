import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../app-store/app.reducer';
import * as BusinessActions from './business.actions';
import { authSuccess } from '../../../users/user-store/user.actions';

import {
  switchMap,
  map,
  of,
  concatMap,
  catchError,
  tap,
  Subscription
} from 'rxjs';

import { environment } from 'src/environments/environment';

import { Business } from '../../models/business.model';
import { Location } from '../../models/location.model';
import { User } from 'src/app/users/user.model';

const BACKEND_URL = environment.apiUrl + '/business';

const handleError = (errorRes: HttpErrorResponse) => {
  let errorMessage = errorRes.error.message;

  if (!errorRes.error.message) {
    console.log(errorRes);
    errorMessage =
      'Error: ' +
      errorRes.status +
      ' - ' +
      errorRes.statusText +
      'An unknown error has occurred.';
    return of(BusinessActions.BusinessError({ errorMessage }));
  }

  console.log(errorMessage);
  return of(BusinessActions.BusinessError({ errorMessage }));
};

@Injectable()
export class BusinessEffects {
  user: User;
  userAuthSub: Subscription = this.store
    .select('user')
    .pipe(map((authState) => authState.user))
    .subscribe((userAuth) => (this.user = userAuth));

  //  MOVED TO business.service.ts
  // addBusinessStart$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(BusinessActions.POSTBusinessStart),
  //     concatMap((action) => {
  //       console.warn('||| addBusinessStart$ effect called |||');
  //       return this.http
  //         .post<{
  //           message: string;
  //           business: Business;
  //           businessId: string;
  //           updatedUser: User;
  //           updatedUserId: string;
  //         }>(BACKEND_URL + '/create-business', {
  //           businessName: action.business.businessName,
  //           ownerId: action.business.ownerId,
  //           locations: [],
  //         })
  //         .pipe(
  //           map((resData) => {
  //             console.log(resData)
  //             if (resData.business) {
  //               const storedBusiness = {
  //                 business: {
  //                   _id: resData.businessId,
  //                   businessName: resData.business.businessName,
  //                   ownerId: resData.business.ownerId,
  //                   locations: resData.business.locations,
  //                 },
  //               };

  //               localStorage.setItem(
  //                 'storedBusiness',
  //                 JSON.stringify(storedBusiness)
  //               );
  //             }

  //             const userProfileData = {
  //               userId: resData.updatedUserId,
  //               email: resData.updatedUser.email,
  //               userProfile: resData.updatedUser.userProfile,
  //             };
  //             localStorage.setItem(
  //               'userProfileData',
  //               JSON.stringify(userProfileData)
  //             );

  //             this.store.dispatch(
  //               authSuccess({
  //                 user: {
  //                   _id: resData.updatedUserId,
  //                   userId: resData.updatedUserId,
  //                   email: resData.updatedUser.email,
  //                   password: resData.updatedUser.password,
  //                   userProfile: resData.updatedUser.userProfile,
  //                 },
  //               })
  //             );

  //             return BusinessActions.POSTBusinessSuccess({
  //               business: {
  //                 _id: resData.businessId,
  //                 businessName: resData.business.businessName,
  //                 ownerId: resData.business.ownerId,
  //                 businessPhoto: resData.business.businessPhoto,
  //                 locations: [],
  //               },
  //             });
  //           }),
  //           catchError((errorRes) => {
  //             console.log(errorRes);
  //             return handleError(errorRes);
  //           })
  //         );
  //     })
  //   )
  // );

  // updateBusinessStart$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(BusinessActions.PUTBusinessStart),
  //     concatMap((action) => {
  //       console.warn('||| updateBusinessStart$ effect called |||');
  //       return this.http
  //         .put<{
  //           message: string;
  //           updatedBusiness: Business;
  //           updatedBusinessId: string;
  //         }>(BACKEND_URL + '/update-business/', {
  //           businessId: action.business._id,
  //           updatedBusinessName: action.business.businessName,
  //         })
  //         .pipe(
  //           map((resData) => {
  //             console.log(resData)
  //             const storedBusiness = {
  //               business: resData.updatedBusiness,
  //             };

  //             localStorage.setItem(
  //               'storedBusiness',
  //               JSON.stringify(storedBusiness)
  //             );

  //             return BusinessActions.PUTBusinessSuccess({
  //               business: resData.updatedBusiness,
  //             });
  //           }),
  //           catchError((errorRes) => {
  //             console.log(errorRes);
  //             return handleError(errorRes);
  //           })
  //         );
  //     })
  //   )
  // );

  fetchBusiness$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BusinessActions.GETBusinessStart),
      switchMap((action) => {
        console.warn('||| fetchBusiness$ effect called |||');
        return this.http
          .get<{ business: Business; businessId: string; message: string }>(
            BACKEND_URL + '/fetch-business/' + action.ownerId
          )
          .pipe(
            map((resData) => {
              console.log(resData)
              const storedBusiness = {
                business: resData.business,
              };

              if (!resData && !resData.business) {
                return BusinessActions.GETEntityFail({
                  errorMessage: 'No business found.',
                });
              } else {
                localStorage.setItem(
                  'storedBusiness',
                  JSON.stringify(storedBusiness)
                );
                console.warn('||| fetching locations |||');
                this.store.dispatch(
                  BusinessActions.GETBusinessLocationsStart({
                    businessId: resData.businessId,
                  })
                );
                return BusinessActions.GETBusinessSuccess({
                  business: resData.business,
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

  addLocationStart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BusinessActions.POSTLocationStart),
      concatMap((action) => {
        console.warn('||| addLocationStart$ effect called |||');
        return this.http
          .post<{
            message: string;
            location: { createdLoc: Location; id: string };
            updatedBusiness: { business: Business; id: string };
          }>(BACKEND_URL + '/create-location', {
            locationName: action.location.locationName,
            parentBusiness: action.location.parentBusiness,
            inventoryData: [],
          })
          .pipe(
            map((resData) => {
              console.log(resData)

              const storedBusiness = {
                business: {
                  _id: resData.updatedBusiness.id,
                  businessName: resData.updatedBusiness.business.businessName,
                  locations: resData.updatedBusiness.business.locations,
                  ownerId: resData.updatedBusiness.business.ownerId,
                },
              };

              localStorage.setItem(
                'storedBusiness',
                JSON.stringify(storedBusiness)
              );

              console.log(storedBusiness);
              this.store.dispatch(
                BusinessActions.GETBusinessLocationsStart({
                  businessId: resData.updatedBusiness.id,
                })
              );
              return BusinessActions.GETBusinessSuccess({
                business: resData.updatedBusiness.business,
              });
            }),
            catchError((errorRes) => {
              console.log(errorRes);
              return handleError(errorRes);
            })
          );
      })
    )
  );

  fetchBusinessLocations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BusinessActions.GETBusinessLocationsStart),
      concatMap((action) => {
        console.warn('||| fetchBusinessLocations$ effect called |||');
        return this.http
          .get<{ fetchedLocations: Location[] }>(
            BACKEND_URL + '/fetch-business-locations/' + action.businessId
          )
          .pipe(
            map((resData) => {
              console.log(resData);
              if (resData && resData.fetchedLocations) {
                const businessLocations = resData.fetchedLocations;
                localStorage.setItem('businessLocations', JSON.stringify(businessLocations));

                return BusinessActions.GETBusinessLocationsSuccess({
                  locations: resData.fetchedLocations,
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

  updateLocationStart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BusinessActions.PUTLocationStart),
      concatMap((action) => {
        console.warn('||| updateLocationStart$ effect called |||');
        console.log(action.location);
        return this.http
          .put<{
            message: string;
          }>(BACKEND_URL + '/update-location/', {
            locationUpdateData: action.location,
          })
          .pipe(
            map((resData) => {
              console.log(resData)

              return BusinessActions.GETBusinessStart({
                ownerId: this.user.userId,
              });
            }),
            catchError((errorRes) => {
              console.log(errorRes);
              return handleError(errorRes);
            })
          );
      })
    )
  );

  addLocationUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BusinessActions.PUTUserToLocationStart),
      concatMap((action) => {
        console.warn('||| addLocationUsers$ effect called |||');
        console.log(action);
        return this.http
          .put<{ message: string; businessId: string }>(
            BACKEND_URL + '/add-location-users',
            {
              emails: action.emails,
              role: action.role,
              location: action.location._id,
            }
          )
          .pipe(
            map((resData) => {
              console.log(resData);
              if (
                resData &&
                resData.message ===
                  'Users were found and added to the location.'
              ) {
                return BusinessActions.PUTUserToLocationSuccess({
                  location: action.location,
                });
              }

              return BusinessActions.GETBusinessLocationsStart({
                businessId: resData.businessId,
              })
            }),
            catchError((errorRes) => {
              console.log(errorRes);
              return handleError(errorRes);
            })
          );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<fromAppStore.AppState>
  ) {}
}
