import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as fromAppStore from '../../app-store/app.reducer';
import * as AuthActions from './auth.actions';
import { clearBusinessState } from '../../core/business/business-store/business.actions';

import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { AuthService } from '../auth-control/auth.service';

import { User } from '../auth-control/user.model';

import { MatDialog } from '@angular/material/dialog';
import { ThemeService } from 'src/app/theme.service';

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
    return of(AuthActions.authFail({ errorMessage }));
  }

  return of(AuthActions.authFail({ errorMessage }));
};

@Injectable()
export class AuthEffects {
  signupStart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signupStart),
      switchMap((action) => {
        return this.http
          .post<{ email: string; password: string }>(BACKEND_URL + '/signup', {
            userId: action.newUser.userId,
            email: action.newUser.email,
            password: action.newUser.password,
            userProfile: {
              role: action.newUser.userProfile.role,
              firstName: action.newUser.userProfile.firstName,
              lastName: action.newUser.userProfile.lastName,
              phoneNumber: action.newUser.userProfile.phoneNumber,
              themePref: action.newUser.userProfile.themePref,
              businessId: action.newUser.userProfile.businessId,
              userLocationId: action.newUser.userProfile.userLocationId,
            },
          })
          .pipe(
            map(() => {
              return AuthActions.loginStart({
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

  loginStart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap((action) => {
        return this.http
          .post<{
            token: string;
            expiresIn: number;
            user: User;
            userId: string;
          }>(BACKEND_URL + '/login', {
            email: action.email,
            password: action.password,
          })
          .pipe(
            tap((resData) => console.log(resData)),
            map((resData) => {
              if (resData.token) {
                console.log(resData.expiresIn);
                this.authService.setLogoutTimer(resData.expiresIn * 1000);

                const now = new Date();
                const expirationDate = new Date(
                  now.getTime() + resData.expiresIn * 1000
                );

                const userAuthData = {
                  token: resData.token,
                  expiration: expirationDate.toISOString(),
                  userId: resData.userId,
                };

                const userProfileData = {
                  userId: resData.userId,
                  email: resData.user.email,
                  userProfile: resData.user.userProfile,
                };

                localStorage.removeItem('guestUserData');
                localStorage.setItem(
                  'userAuthData',
                  JSON.stringify(userAuthData)
                );
                localStorage.setItem(
                  'userProfileData',
                  JSON.stringify(userProfileData)
                );
                this.dialog.closeAll();
                this.router.navigate(['/app/dashboard']);
              }
              return AuthActions.authSuccess({
                user: {
                  userId: resData.userId,
                  email: resData.user.email,
                  password: resData.token,
                  userProfile: resData.user.userProfile,
                },
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

  autoLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.autoLogin),
      map(() => {
        // PULL AUTHDATA FROM LOCAL STORAGE
        const userAuthData: {
          token: string;
          expiration: string;
          userId: string;
        } = JSON.parse(localStorage.getItem('userAuthData'));
        if (!userAuthData) {
          console.log('Log in to continue');
          return { type: 'No user logged in.' };
        }

        // PULL PROFILE DATA FROM LOCAL STORAGE
        const userProfileData: {
          userId: string;
          email: string;
          userProfile: {
            role: number;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            themePref: string | null;
            businessId: string | null;
            userLocationId: string | null;
          };
        } = JSON.parse(localStorage.getItem('userProfileData'));

        const authorizedUser = {
          token: userAuthData.token,
          expiration: new Date(userAuthData.expiration),
          userId: userAuthData.userId,
        };

        const userProfile = {
          userId: userProfileData.userId,
          email: userProfileData.email,
          userProfile: userProfileData.userProfile,
        };

        if (authorizedUser.userId) {
          const now = new Date().getTime();
          const expirationDuration = authorizedUser.expiration.getTime() - now;
          this.authService.setLogoutTimer(expirationDuration);
          return AuthActions.authSuccess({
            user: {
              userId: userAuthData.userId,
              email: userProfile.email,
              password: userAuthData.token,
              userProfile: userProfile.userProfile,
            },
          });
        } else {
          console.log('User ID is: ' + authorizedUser.userId);
          return AuthActions.authFail({
            errorMessage: 'Not authenticated! Log in.',
          });
        }
      })
    )
  );

  authLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.clearLogoutTimer();
          localStorage.clear();
          this.store.dispatch(clearBusinessState());
          const guestUserData = { themePref: 'theme-dark' };
          localStorage.setItem('guestUserData', JSON.stringify(guestUserData));
          this.router.navigate(['/']);
          console.log('||| USER WAS LOGGED OUT |||');
        })
      ),
    { dispatch: false }
  );

  constructor(
    private dialog: MatDialog,
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private store: Store<fromAppStore.AppState>
  ) {}
}
