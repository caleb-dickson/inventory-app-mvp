import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subscription } from 'rxjs';


import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as AuthActions from '../../auth/auth-store/auth.actions';

import { AuthService } from '../auth-control/auth.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading: boolean;
  error: string;
  private storeSub: Subscription;

  constructor(
    public authService: AuthService,
    private store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit() {
    this.storeSub = this.store.select('auth').subscribe((authState) => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
    });
  }

  onSignup(signupForm: NgForm) {
    if (!signupForm.valid) {
      return;
    }
    console.log(signupForm);

    let department = 'admin';

    if (signupForm.value.department) {
      department = signupForm.value.department;
    }

    let themePref = !signupForm.value.themePref
      ? undefined
      : signupForm.value.themePref;

    this.store.dispatch(
      AuthActions.signupStart({
        newUser: {
          userId: null,
          email: signupForm.value.email,
          password: signupForm.value.password,
          userProfile: {
            role: signupForm.value.role,
            department: department,
            firstName: signupForm.value.firstName,
            lastName: signupForm.value.lastName,
            phoneNumber: signupForm.value.phoneNumber,
            themePref: themePref
          },
        },
      })
    );
    // form.reset();
  }

  ngOnDestroy(): void {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }
}
