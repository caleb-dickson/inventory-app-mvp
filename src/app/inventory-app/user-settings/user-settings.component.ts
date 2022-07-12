import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngrx/store';
import { map, Subscription } from 'rxjs';
import * as fromAppStore from '../../app-store/app.reducer';
import * as UserActions from '../../users/user-store/user.actions';

import { User } from 'src/app/users/user.model';

import { environment } from 'src/environments/environment';
import { ThemeService } from 'src/app/theme/theme.service';
import { UserService } from 'src/app/users/user-control/user.service';
import { BaseComponent } from '../core/base-component';

const BACKEND_URL = environment.apiUrl + '/user';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent extends BaseComponent implements OnInit {

  constructor(
    private _http: HttpClient,
    private _router: Router,
    private _userService: UserService,
    store: Store<fromAppStore.AppState>,
    themeService: ThemeService
  ) {
    super(store, themeService)
  }


  userProfileForm: FormGroup;
  userPhoto: string;
  userPhotoUpload: Blob | null;
  imagePreview: string;
  mimeType: string;
  mimeTypeValid = true;
  fileSizeOk = true;



  ngOnInit() {
    this.userPhoto = this.user.userProfile.userPhoto;
    this._initUserProfileForm();
  }

  onUserProfileSubmit(userProfileForm: FormGroup) {
    this.userProfileForm.updateValueAndValidity();
    if (userProfileForm.invalid) {
      return;
    }

    this._userService.updateUserProfile(
      userProfileForm,
      this.userPhotoUpload,
      this.userRole,
      this.userDept
    );
    this.onResetForm();
    this._initUserProfileForm();
  }

  onResetForm() {
    this.mimeTypeValid = true;
    this.fileSizeOk = true;
    this.imagePreview = null;
    this.themePref = this.user.userProfile.themePref;
    this._initUserProfileForm();
  }

  onDepartmentSelect(dept: Event) {
    console.log(dept);
    this.userProfileForm.get('department').setValue(dept);
    this.userProfileForm.updateValueAndValidity();
  }

  onThemeToggle(checked: boolean) {
    this.themePref = checked ? 'theme-dark' : 'theme-light';
    this.userProfileForm.get('themePref').setValue(this.themePref);
    this.userProfileForm.updateValueAndValidity();
    let theme = checked ? 'theme-dark' : 'theme-light';
    // this.themeService.switchThemeMode(theme);
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
    console.log(this.userProfileForm.value);
  }

  private _initUserProfileForm() {
    this.userProfileForm = new FormGroup({
      email: new FormControl(
        { value: this.user.email, disabled: true },
        {
          validators: [Validators.required],
        }
      ),
      department: new FormControl(
        { value: this.user.userProfile.department, disabled: true },
        {
          validators: [Validators.required],
        }
      ),
      firstName: new FormControl(this.user.userProfile.firstName, {
        validators: [Validators.required],
      }),
      lastName: new FormControl(this.user.userProfile.lastName, {
        validators: [Validators.required],
      }),
      phoneNumber: new FormControl(this.user.userProfile.phoneNumber, {
        validators: [Validators.required],
      }),
      themePref: new FormControl(this.themePref, {
        validators: [Validators.required],
      }),
      userPhoto: new FormControl(null),
    });
    console.log(this.userProfileForm.value);
  }
}
