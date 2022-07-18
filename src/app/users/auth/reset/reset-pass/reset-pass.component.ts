import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../app-store/app.reducer';
import * as UserActions from '../../../user-store/user.actions';
import * as NotificationsActions from '../../../../notifications/notifications-store/notifications.actions';

import { CustomValidators } from 'src/app/form.validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from 'src/app/users/user-control/user.service';

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.scss'],
})
export class ResetPassComponent implements OnInit, OnDestroy {
  private _userStoreSub: Subscription;
  private _passResetUserIdSub: Subscription;
  private _dialogSub: Subscription;

  token: string;
  userId: string;
  error: string;
  resMessage: string;
  loading: boolean;

  resetForm: FormGroup;
  disableForm: boolean;
  inputType: string;
  showPass = false;
  showConfirmPass = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    private _router: Router,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _userService: UserService,
    private _store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit(): void {
    this.token = this.data;
    console.log(this.token);

    this._userStoreSub = this._store.select('user').subscribe((userState) => {
      this.error = userState.userError;
      this.loading = userState.loading;
      this.resMessage = userState.userMessage;
      console.log(this.resMessage);
    });

    this._passResetUserIdSub = this._userService.passResetUserId$.subscribe(
      (userId) => {
        this.userId = userId;
        console.log(userId);

        if (!userId && this.inputType === 'password') {
          this.disableForm = true;
        } else {
          this.disableForm = false;
        }
      }
    );

    if (this.token) {
      this._dialogSub = this._dialog
        .getDialogById('reset-pass')
        .afterClosed()
        .subscribe((res) => {
          this._router.navigate(['/']);
        });
    }

    if (this.token) {
      this._store.dispatch(
        UserActions.checkTokenValidity({ token: this.token })
      );
    }

    this._initResetForm();
    console.log(this.inputType);
  }

  ngOnDestroy(): void {
    this._userStoreSub.unsubscribe();
    this._passResetUserIdSub.unsubscribe();
  }

  onShowPass(input: string) {
    if (input === 'password') {
      this.showPass = !this.showPass;
    } else {
      this.showConfirmPass = !this.showConfirmPass;
    }
  }

  onSubmit() {
    console.log(this.resetForm);

    if (this.inputType === 'email') {
      console.log(this.resetForm.value);

      this._store.dispatch(
        UserActions.passwordResetInit({ email: this.resetForm.value.email })
      );

      this.disableForm = true;
      this._dialog.closeAll();
    } else if (this.inputType === 'newPassword') {
      console.log(this.resetForm.value);

      this.disableForm = true;
      this._dialog.closeAll();
      
      this._store.dispatch(
        UserActions.saveNewPassword({
          newPass: this.resetForm.value.newPassword,
          userId: this.userId,
          token: this.token,
        })
      );

    }
  }

  private _initResetForm() {
    console.log(this.inputType);
    if (!this.token) {
      this.inputType = 'email';

      this.resetForm = new FormGroup({
        email: new FormControl(null, [Validators.required, Validators.email]),
      });
    } else {
      this.inputType = 'newPassword';

      this.resetForm = new FormGroup(
        {
          newPassword: new FormControl(null, [
            Validators.required,
            Validators.minLength(6),
          ]),
          confirmNewPassword: new FormControl(null, Validators.required),
        },
        CustomValidators.mustMatch('newPassword', 'confirmNewPassword')
      );
    }
  }
}
