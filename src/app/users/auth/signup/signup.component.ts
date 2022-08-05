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
    // IF USER IS AN OWNER, SET DEPARTMENT TO ADMIN
    if (this.signupForm.get('role').value === 3) {
      this.signupForm.get('department').setValue('admin');
    }

    console.log(this.signupForm.value);
    this.signupForm.updateValueAndValidity();
    console.log(this.signupForm.value);

    // if (!this.passMatch) {
    //   this.store.dispatch(
    //     UserActions.userError({ message: 'Passwords do not match.' })
    //   );
    // }

    let themePref = !this.signupForm.value.themePref
      ? undefined
      : this.signupForm.get('themePref').value;

    this.store.dispatch(
      UserActions.signupStart({
        newUser: {
          id: null,
          createdAt: null,
          updatedAt: null,
          email: this.signupForm.value.email,
          password: this.signupForm.value.password,
          resetToken: null,
          resetTokenExpiration: null,
          firstName: this.signupForm.value.firstName,
          lastName: this.signupForm.value.lastName,
          role: this.signupForm.value.role,
          department: this.signupForm.value.department,
          phoneNumber: this.signupForm.value.phoneNumber,
          themePref: themePref,
          photo: null,
          managerAt: [],
          staffAt: []
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
        department: new FormControl(null),
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
