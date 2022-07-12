import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../app-store/app.reducer';
import * as UserActions from '../../user-store/user.actions';

import { UserService } from '../../user-control/user.service';
import { CustomValidators } from '../../../form.validators';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy {
  private _userStoreSub: Subscription;

  isLoading: boolean;
  error: string;

  signupForm: FormGroup;
  passLength: number;
  showPass = false;
  showConfirmPass = false;
  passMatch = true;

  constructor(
    public userService: UserService,
    private store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit(): void {
    this._userStoreSub = this.store.select('user').subscribe((authState) => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
    });

    this._initSignupForm();
  }

  onSignup(): void {
    console.log(this.signupForm.value);
    this.signupForm.updateValueAndValidity();
    console.log(this.signupForm.value);
    if (!this.signupForm.valid) {
      this.store.dispatch(
        UserActions.userError({ message: 'Signup form invalid.' })
      );
    } else if (!this.passMatch) {
      this.store.dispatch(
        UserActions.userError({ message: 'Passwords do not match.' })
      );
    }

    let department = 'admin';

    if (this.signupForm.get('department').value) {
      department = this.signupForm.get('department').value;
    }

    let themePref = !this.signupForm.value.themePref
      ? undefined
      : this.signupForm.get('themePref').value;

    this.store.dispatch(
      UserActions.signupStart({
        newUser: {
          _id: null,
          userId: null,
          email: this.signupForm.value.email,
          password: this.signupForm.value.password,
          userProfile: {
            role: this.signupForm.value.role,
            department: department,
            firstName: this.signupForm.value.firstName,
            lastName: this.signupForm.value.lastName,
            phoneNumber: this.signupForm.value.phoneNumber,
            themePref: themePref,
            userPhoto: null,
          },
        },
      })
    );
    this._initSignupForm();
  }

  onShowPass(input: string) {
    if (input === 'password') {
      this.showPass = !this.showPass;
    } else {
      this.showConfirmPass = !this.showConfirmPass;
    }
  }

  private _initSignupForm(): void {
    this.signupForm = new FormGroup(
      {
        firstName: new FormControl(null, Validators.required),
        lastName: new FormControl(null, Validators.required),
        role: new FormControl(null, Validators.required),
        department: new FormControl(null, Validators.required),
        phoneNumber: new FormControl(null, Validators.required),
        email: new FormControl(null, [Validators.email, Validators.required]),
        password: new FormControl(null, Validators.required),
        confirmPassword: new FormControl(null, Validators.required),
      },
      CustomValidators.mustMatch('password', 'confirmPassword')
    );
  }

  ngOnDestroy(): void {
    if (this._userStoreSub) {
      this._userStoreSub.unsubscribe();
    }
  }
}
