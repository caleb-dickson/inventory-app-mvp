import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as UserActions from '../user-store/user.actions';

import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../auth/login/login.component';
import { SignupComponent } from '../auth/signup/signup.component';
import { NgForm } from '@angular/forms';

export interface AuthResponseData {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private tokenExpirationTimer: any;

  constructor(
    private dialog: MatDialog,
    private store: Store<fromAppStore.AppState>
  ) {}

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
        minHeight: 500
      });
    }
    if (mode == 'signup') {
      this.dialog.open(SignupComponent, {
        width: '55vw',
        height: 'min-content',
        minWidth: 350,
        minHeight: 700
      });
    }
    this.store.dispatch(UserActions.clearError());
  }

}
