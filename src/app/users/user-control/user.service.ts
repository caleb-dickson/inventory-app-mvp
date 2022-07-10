import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as UserActions from '../user-store/user.actions';
import * as NotificationsActions from '../../notifications/notifications-store/notifications.actions';

import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../auth/login/login.component';
import { SignupComponent } from '../auth/signup/signup.component';
import { NgForm } from '@angular/forms';
import { PreviewComponent } from '../auth/preview/preview.component';
import { map, Subscription } from 'rxjs';

export interface AuthResponseData {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private _userSub: Subscription;

  private tokenExpirationTimer: any;

  isAuthenticated: boolean;

  constructor(
    private dialog: MatDialog,
    private store: Store<fromAppStore.AppState>
  ) {
    this._userSub = this.store
      .select('user')
      .pipe(map((userState) => userState))
      .subscribe((userState) => {
        this.isAuthenticated = !!userState.user;
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
      });
    }
    if (mode == 'signup') {
      this.dialog.open(SignupComponent, {
        width: '55vw',
        height: 'min-content',
        maxHeight: '100vh',
        minWidth: 350,
        minHeight: 700,
      });
    }
    this.store.dispatch(UserActions.clearError());
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
      NotificationsActions.showConfirmMessage({
        message: 'You are previewing the App as ' + accType,
        notificationAction: 'Close',
        duration: Infinity,
      })
    );
  }
}
