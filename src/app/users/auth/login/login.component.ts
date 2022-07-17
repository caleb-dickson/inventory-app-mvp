import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../app-store/app.reducer';
import * as UserActions from '../../user-store/user.actions';
import { UserService } from '../../user-control/user.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loading = false;
  error: string = null;

  private storeSub: Subscription;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private _userService: UserService,
    private store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit() {
    console.clear();

    this.storeSub = this.store.select('user').subscribe((authState) => {
      this.loading = authState.loading;
      this.error = authState.authError;
    });
  }

  onLogin(form: NgForm) {
    if (!form.valid) {
      return;
    }

    this.store.dispatch(
      UserActions.loginStart({
        email: form.value.email,
        password: form.value.password,
      })
    );
    form.reset();
  }

  onReset(mode: string) {
    this.dialog.getDialogById('login').close();
    this._userService.resetUser(mode);
  }

  ngOnDestroy() {
    this.storeSub.unsubscribe();
  }
}
