import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as UserActions from '../user-store/user.actions';
import * as NotificationsActions from '../../notifications/notifications-store/notifications.actions';

import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../auth/login/login.component';
import { SignupComponent } from '../auth/signup/signup.component';
import { FormGroup, NgForm } from '@angular/forms';
import { PreviewComponent } from '../auth/preview/preview.component';
import { BehaviorSubject, catchError, map, Subscription } from 'rxjs';
import { User } from '../user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ResetPassComponent } from '../auth/reset/reset-pass/reset-pass.component';
import { ResetEmailComponent } from '../auth/reset/reset-email/reset-email.component';
import { Router } from '@angular/router';

const BACKEND_URL = environment.apiUrl + '/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _userSub: Subscription;
  private tokenExpirationTimer: any;

  passResetUserId$ = new BehaviorSubject<string>(null);

  isAuthenticated: boolean;
  user: User;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private store: Store<fromAppStore.AppState>
  ) {
    this._userSub = this.store
      .select('user')
      .pipe(map((userState) => userState))
      .subscribe((userState) => {
        this.isAuthenticated = !!userState.user;
        this.user = userState.user;
      });
  }

  setLogoutTimer(expirationDuration: number) {
    console.log(
      'LOGOUT TIMER IS SET; You have ' +
        (expirationDuration / 1000 / 60).toFixed(1) +
        ' minutes remaining until auto-logout.'
    );
    this.tokenExpirationTimer = setTimeout(() => {
      this.store.dispatch(UserActions.logout());
    }, expirationDuration);
  }

  clearLogoutTimer() {
    console.log('CLEARED THE LOGOUT TIMER');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  openAuthForm(mode: string) {
    if (mode == 'login') {
      this.dialog.open(LoginComponent, {
        width: '40vh',
        height: 'min-content',
        minWidth: 350,
        minHeight: 500,
        id: 'login'
      });
    }
    if (mode == 'signup') {
      this.dialog.open(SignupComponent, {
        width: '55vw',
        height: 'min-content',
        maxHeight: '100vh',
        minWidth: 350,
        minHeight: 700,
        id: 'signup'
      });
    }
    this.store.dispatch(UserActions.clearError());
  }

  resetUser(mode: string) {
    if (mode === 'password') {
      this.dialog.open(ResetPassComponent, {
        width: '30vw',
        height: '60vh',
        minWidth: 350,
        id: 'reset-pass-init'
      });
    } else if (mode === 'email') {
      this.dialog.open(ResetEmailComponent, {
        width: '30vw',
        height: 'min-content',
        minWidth: 350,
        minHeight: 500,
        id: 'reset-email-init'
      });
    }
  }

  passReset(token: string) {
    // this.router.navigate(['/']);
    this.dialog.open(ResetPassComponent, {
      width: '30vw',
      height: 'max-content',
      minWidth: 350,
      // minHeight: 500,
      id: 'reset-pass',
      data: token
    })
  }

  setPassResetUserId(userId: string) {
    this.passResetUserId$.next(userId);
  }

  openPreviewSelect() {
    this.dialog.open(PreviewComponent, {
      width: '70vw',
      maxWidth: '25rem',
      height: 'max-content',
    });
  }

  onPreviewLogin(accType: string) {
    switch (accType) {
      case 'an Owner':
        this.store.dispatch(
          UserActions.loginStart({
            email: 'owner@ownerUser.com',
            password: 'testPass',
          })
        );
        break;
      case 'a Manager':
        this.store.dispatch(
          UserActions.loginStart({
            email: 'manager@managerUser.com',
            password: 'testPass',
          })
        );
        break;
      case 'a Junior Staff Member':
        this.store.dispatch(
          UserActions.loginStart({
            email: 'staff@staffUser.com',
            password: 'testPass',
          })
        );
        break;
    }
    this.dialog.closeAll();
    this.store.dispatch(
      NotificationsActions.showMessage({
        message: 'You are previewing the App as ' + accType,
        notificationAction: 'Close',
        duration: Infinity,
      })
    );
  }

  updateUserProfile(
    userProfileForm: FormGroup,
    userPhotoUpload: Blob | null,
    userRole: string,
    userDept: string
  ) {
    const formData = new FormData();
    formData.append('id', this.user.id ? this.user.id : this.user.id);
    formData.append('firstName', userProfileForm.value.firstName);
    formData.append('lastName', userProfileForm.value.lastName);
    formData.append('phoneNumber', userProfileForm.value.phoneNumber);
    formData.append('themePref', userProfileForm.value.themePref);
    if (userPhotoUpload) {
      console.log('file');
      formData.append(
        'userPhoto',
        userProfileForm.value.userPhoto,
        userProfileForm.value.firstName +
          '_' +
          userProfileForm.value.lastName +
          '_' +
          userDept +
          '_' +
          userRole
      );
    }

    // SET userLoading TO true
    this.store.dispatch(UserActions.PUTUpdateUserStart());

    // SEND THE PUT REQUEST TO UPDATE THE USER DOC ON BACKEND
    this.http
      .put<{ updatedUser: User }>(BACKEND_URL + '/user', formData)
      .subscribe((resData) => {
        console.log(resData);
        // SET THE UPDATED USER DATA IN LOCALSTORAGE AND AUTOLOGIN
        this.store.dispatch(
          UserActions.PUTUpdateUserSuccess({ user: resData.updatedUser })
        );
      });
  }
}
