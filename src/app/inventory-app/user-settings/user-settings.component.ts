import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as UserActions from "../../users/user-store/user.actions";

import { User } from 'src/app/users/user.model';

import { environment } from 'src/environments/environment';
import { ThemeService } from 'src/app/theme/theme.service';
import { UserService } from 'src/app/users/user-control/user.service';

import { UserSettingsAdvancedComponent } from './user-settings-advanced/user-settings-advanced.component';

const BACKEND_URL = environment.apiUrl + '/user';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
  // STATE
  // subs
  private _userStoreSub: Subscription;
  private _businessStoreSub: Subscription;
  private _locationStoreSub: Subscription;
  // loading state
  appLoading: boolean;
  userLoading: boolean;
  businessLoading: boolean;
  locationLoading: boolean;
  // THEME
  private _themeSub: Subscription;
  themeMode: string;
  themePref: string;

  // USER
  user: User;
  userRole: string;
  userDept: string;
  userLocations: Location[];

  // FORM
  userProfileForm: FormGroup;
  userPhoto: string;
  userPhotoUpload: Blob | null;
  imagePreview: string;
  mimeType: string;
  mimeTypeValid = true;
  fileSizeOk = true;

  constructor(
    private _dialog: MatDialog,
    private _userService: UserService,
    private _themeService: ThemeService,
    private _store: Store<fromAppStore.AppState>,
  ) {}

  ngOnInit() {
    this._userStoreSub = this._store.select('user').subscribe((userState) => {
      this.appLoading = userState.loading;
      this.userLoading = userState.loading;
      this.user = userState.user;
      this.userDept = userState.user?.department;
      this.userPhoto = this.user?.photo;
      this.setUserRoleString(userState.user?.role);
      this._initUserProfileForm();
      console.log(userState);
    });

    this._themeService.getThemeMode();
    this._themeSub = this._themeService.themeStatus.subscribe(
      (themeModeData) => {
        this.themeMode = themeModeData;
        this.themePref = themeModeData;
      }
      );
      this._initUserProfileForm();
  }

  setUserRoleString(intRole: number): void {
    switch (intRole) {
      case 3:
        this.userRole = 'owner';
        break;
      case 2:
        this.userRole = 'manager';
        break;
      case 1:
        this.userRole = 'staff';
        break;
    }
  }

  onOpenAdvancedSettings() {
    this._dialog.open(UserSettingsAdvancedComponent, {
      id: 'settings-advanced',
      height: 'max-content',
      width: 'max-content',
      data: this.user.id
    })
  }

  onUserProfileSubmit() {
    this.userProfileForm.updateValueAndValidity();
    if (this.userProfileForm.invalid) {
      return;
    }

    if (this.mimeTypeValid && this.fileSizeOk) {
      this._userService.updateUserProfile(
        this.userProfileForm,
        this.userPhotoUpload,
        this.userRole,
        this.userDept
      );
      this.userProfileForm.reset();
      this.userProfileForm.updateValueAndValidity();
    } else {
      this._store.dispatch(UserActions.userError({ message: "Form invalid"}))
    }
  }

  onResetForm() {
    this.mimeTypeValid = true;
    this.fileSizeOk = true;
    this.imagePreview = null;
    this.themePref = this.user.themePref;
    this._initUserProfileForm();
  }

  onDepartmentSelect(dept: Event) {
    this.userProfileForm.get('department').setValue(dept);
    this.userProfileForm.updateValueAndValidity();
  }

  onThemeToggle($event: MatSlideToggleChange) {
    this.themePref = $event.checked ? 'theme-dark' : 'theme-light';
    this.userProfileForm.get('themePref').setValue(this.themePref);
    this.userProfileForm.updateValueAndValidity();
    this._themeService.switchThemeMode(this.themePref);
  }

  onAvatarPicked(event: Event) /* CHECK FILE TYPE AND SIZE */ {
    // EXTRACT THE FILE FROM THE FILE PICKER INPUT
    this.userPhotoUpload = (event.target as HTMLInputElement).files[0];

    // SET FORM VALUE AS INPUT FILE
    this.userProfileForm.patchValue({ userPhoto: this.userPhotoUpload });
    this.userProfileForm.get('userPhoto').updateValueAndValidity();

    // READ AND VALIDATE THE FILE
    const reader = new FileReader();
    reader.onloadend = () => {
      this.imagePreview = reader.result as string;
      this.mimeType = this.userPhotoUpload.type;

      // CHECK FILE SIZE AND ASSIGN VALIDITY VALUE
      this.fileSizeOk = this.userPhotoUpload.size < 5000000 ? true : false;

      // CHECK MIME TYPE AND ASSIGN VALIDITY VALUE
      switch (this.mimeType) {
        case 'image/png':
        case 'image/jpg':
        case 'image/jpeg':
          this.mimeTypeValid = true;
          break;
        default:
          this.mimeTypeValid = false;
          break;
      }

      // IF MIME TYPE IS INVALID, SET FORM ERROR
      if (!this.mimeTypeValid) {
        this.userProfileForm
          .get('userPhoto')
          .setErrors({ invalidMimeType: true });

        // IF FILE IS TOO LARGE, SET FORM ERROR
      } else if (!this.fileSizeOk) {
        this.userProfileForm.get('userPhoto').setErrors({ fileTooLarge: true });
      }
    };

    this.userProfileForm.get('userPhoto').updateValueAndValidity();
    reader.readAsDataURL(this.userPhotoUpload);
  }

  private _initUserProfileForm() {
    this.userProfileForm = new FormGroup({
      email: new FormControl(
        { value: this.user?.email, disabled: true },
        {
          validators: [Validators.required],
        }
      ),
      department: new FormControl(
        { value: this.user?.department, disabled: true },
        {
          validators: [Validators.required],
        }
      ),
      firstName: new FormControl(this.user?.firstName, {
        validators: [Validators.required],
      }),
      lastName: new FormControl(this.user?.lastName, {
        validators: [Validators.required],
      }),
      phoneNumber: new FormControl(this.user?.phoneNumber, {
        validators: [Validators.required],
      }),
      themePref: new FormControl(this.themePref, {
        validators: [Validators.required],
      }),
      userPhoto: new FormControl(null),
    });
  }
}
