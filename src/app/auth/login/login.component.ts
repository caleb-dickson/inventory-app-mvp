import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as AuthActions from '../../auth/auth-store/auth.actions';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  error: string = null;

  private storeSub: Subscription;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit() {
    this.storeSub = this.store.select('auth').subscribe((authState) => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
      console.log(authState);
    });
  }

  onLogin(form: NgForm) {
    if (!form.valid) {
      return;
    }

    this.isLoading = true;

    this.store.dispatch(
      AuthActions.loginStart({
        email: form.value.email,
        password: form.value.password,
      })
    );
    form.reset();
  }

  ngOnDestroy() {
    this.storeSub.unsubscribe();
  }
}
