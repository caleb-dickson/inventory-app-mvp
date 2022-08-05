import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as fromAppStore from '../../app-store/app.reducer';
import * as UserActions from './user.actions';
import * as NotificationsActions from '../../notifications/notifications-store/notifications.actions';
import { clearBusinessState } from '../../inventory-app/navigation/business/business-store/business.actions';
import { clearLocationState } from 'src/app/inventory-app/navigation/business/location/location-store/location.actions';

import { of } from 'rxjs';
import {
  catchError,
  concatMap,
  exhaustMap,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { UserService } from '../user-control/user.service';

import { User } from '../user.model';
import { Location } from '../../inventory-app/models/location.model';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

const BACKEND_URL = environment.apiUrl + '/user';

const handleError = (errorRes: HttpErrorResponse) => {
  let errorMessage = errorRes.error.message;

  if (!errorRes.error.message) {
    console.log(errorRes);
    errorMessage =
      'Error: ' +
      errorRes.status +
      ' ' +
      errorRes.statusText +
      'An unknown error has occurred.';
    return of(UserActions.authFail({ errorMessage }));
  }

  return of(UserActions.authFail({ errorMessage }));
};

@Injectable()
export class UserEffects {
  signupStart$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.signupStart),
      exhaustMap((action) => {
        console.warn('||| signupStart$ effect called |||');
        return this._http
          .post<{ email: string; password: string }>(BACKEND_URL + '/signup', {
            email: action.newUser.email,
            password: action.newUser.password,
            firstName: action.newUser.firstName,
            lastName: action.newUser.lastName,
            phoneNumber: action.newUser.phoneNumber,
            role: action.newUser.role,
            department: action.newUser.department,
            themePref: action.newUser.themePref,
          })
          .pipe(
            map(() => {
              return UserActions.loginStart({
                email: action.newUser.email,
                password: action.newUser.password,
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

  deleteUserStart$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.DELETEUserStart),
      exhaustMap((action) => {
        console.warn('||| deleteUserStart$ effect called |||');
        return this._http.delete(BACKEND_URL + '/user/' + action.userId).pipe(
          map((res) => {
            console.log(res);
            console.warn('||| ^^^ deleteUserStart$ resData ^^^ |||');

            this._store.dispatch(UserActions.logout());
            this._dialog.closeAll();

            return UserActions.DELETEUserSuccess();
          }),
          catchError((errorRes) => {
            console.log(errorRes);
            return handleError(errorRes);
          })
        );
      })
    )
  );

  loginStart$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.loginStart),
      switchMap((action) => {
        console.warn('||| loginStart$ effect called |||');
        return this._http
          .post<{
            token: string;
            expiresIn: number;
            user: User;
          }>(BACKEND_URL + '/login', {
            email: action.email,
            password: action.password,
          })
          .pipe(
            map((resData) => {
              if (resData.token) {
                console.log(resData);
                console.warn('||| ^^^ loginStart$ resData ^^^ |||');
                this._userService.setLogoutTimer(resData.expiresIn * 1000);

                const now = new Date();
                const expirationDate = new Date(
                  now.getTime() + resData.expiresIn * 1000
                );

                const userAuthData = {
                  token: resData.token,
                  expiration: expirationDate.toISOString(),
                };

                const userData = resData.user;

                localStorage.removeItem('guestUserData');
                localStorage.setItem(
                  'userAuthData',
                  JSON.stringify(userAuthData)
                );
                localStorage.setItem('userData', JSON.stringify(userData));
                this._dialog.closeAll();
                this._router.navigate(['/app/dashboard']);
              }
              return UserActions.authSuccess({ user: resData.user, token: resData.token });
            }),
            catchError((errorRes) => {
              console.log(errorRes);
              return handleError(errorRes);
            })
          );
      })
    )
  );

  resetPassInit$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.passwordResetInit),
      take(1),
      exhaustMap((action) => {
        console.warn('||| resetPassInit$ effect called |||');
        return this._http
          .post<{ message: string }>(BACKEND_URL + '/reset', {
            email: action.email,
          })
          .pipe(
            map((resData) => {
              console.log(resData);
              console.warn('||| resetPassInit$ resData |||');

              this._store.dispatch(
                UserActions.setUserMessage({ message: resData.message })
              );

              this._store.dispatch(
                NotificationsActions.showMessage({
                  message: resData.message,
                  notificationAction: 'dismiss',
                  duration: 10000,
                })
              );

              return UserActions.passwordResetInitSuccess({
                message: resData.message,
              });
            }),
            catchError((errorRes) => {
              console.log(errorRes);
              return of(
                UserActions.userError({ message: errorRes.error.message })
              );
            })
          );
      })
    )
  );

  checkTokenValidity$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.checkTokenValidity),
      take(1),
      exhaustMap((action) => {
        console.warn('||| checkTokenValidity$ effect called |||');
        return this._http
          .get<{ userId?: string; message?: string }>(
            BACKEND_URL + '/reset/' + action.token
          )
          .pipe(
            map((resData) => {
              console.log(resData);
              console.warn('||| ^^^ checkTokenValidity$ resData ^^^ |||');

              if (resData.userId) {
                this._userService.setPassResetUserId(resData.userId);
              } else if (resData.message) {
                return UserActions.setUserMessage({ message: resData.message });
              }

              return { type: 'Action Dispatched' };
            }),
            catchError((errorRes) => {
              console.log(errorRes);
              return of(
                UserActions.userError({ message: errorRes.error.message })
              );
            })
          );
      })
    )
  );

  saveNewPassword$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.saveNewPassword),
      exhaustMap((action) => {
        console.warn('||| saveNewPassword$ effect called |||');
        return this._http
          .put<{ message: string }>(BACKEND_URL + '/reset', {
            newPass: action.newPass,
            userId: action.userId,
            token: action.token,
          })
          .pipe(
            map((resData) => {
              console.log(resData);
              console.warn('||| ^^^ saveNewPassword$ resData ^^^ |||');

              // this._snackbar.dismiss();

              this._store.dispatch(
                NotificationsActions.showMessage({
                  message: resData.message,
                  notificationAction: 'dismiss',
                  duration: 10000,
                })
              );

              return UserActions.setUserMessage({ message: resData.message });
            })
          );
      })
    )
  );

  updateUser$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.PUTUpdateUserSuccess),
      map((action) => {
        console.warn('||| updateUser$ effect called |||');

        const user = action.user;

        localStorage.setItem('userData', JSON.stringify(user));
        return UserActions.autoLogin();
      })
    )
  );

  fetchUserLocations$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.GETUserLocationsStart),
      concatMap((action) => {
        return this._http
          .get<{ fetchedLocations: Location[] }>(
            BACKEND_URL +
              '/user-locations/' +
              action.userId +
              '/' +
              action.userRole
          )
          .pipe(
            map((resData) => {
              console.log(resData);
              let returnedLocations: Location[] = resData.fetchedLocations;
              if (resData && resData.fetchedLocations) {
                const locations = resData.fetchedLocations;
                localStorage.setItem('locations', JSON.stringify(locations));

                return UserActions.GETUserLocationsSuccess({
                  locations: returnedLocations,
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

  autoLogin$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.autoLogin),
      map(() => {
        // PULL AUTHDATA FROM LOCAL STORAGE
        const userAuthData = JSON.parse(localStorage.getItem('userAuthData'));
        if (!userAuthData) {
          console.log('||| Log in to continue |||');
          return { type: 'No user logged in.' };
        }

        // PULL PROFILE DATA FROM LOCAL STORAGE
        const authDataParsed = {
          token: userAuthData.token,
          expiration: new Date(userAuthData.expiration)
        }
        const userData: User = JSON.parse(localStorage.getItem('userData'));

        if (authDataParsed.token) {
          const now = new Date().getTime();
          const expirationDuration = authDataParsed.expiration.getTime() - now;
          this._userService.setLogoutTimer(expirationDuration);
          return UserActions.authSuccess({ user: userData, token: userAuthData.token });
        } else {
          console.log('User ID is: ' + userData.id);
          return UserActions.authFail({
            errorMessage: 'Not authenticated! Log in.',
          });
        }
      })
    )
  );

  authLogout$ = createEffect(
    () =>
      this._actions$.pipe(
        ofType(UserActions.logout),
        tap(() => {
          this._userService.clearLogoutTimer();
          localStorage.clear();
          this._store.dispatch(clearBusinessState());
          this._store.dispatch(clearLocationState());
          const guestUserData = { themePref: 'theme-dark' };
          localStorage.setItem('guestUserData', JSON.stringify(guestUserData));
          this._router.navigate(['/']);
          console.clear();
          console.log('||| USER WAS LOGGED OUT |||');
        })
      ),
    { dispatch: false }
  );

  constructor(
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _actions$: Actions,
    private _http: HttpClient,
    private _router: Router,
    private _userService: UserService,
    private _store: Store<fromAppStore.AppState>
  ) {}
}
