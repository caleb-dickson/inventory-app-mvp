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
import { ThemeService } from 'src/app/app-control/theme.service';

const BACKEND_URL = environment.apiUrl + '/user';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
  userLoading: boolean;
  userProfileForm: FormGroup;
  userPhoto: string;
  userPhotoUpload: Blob | null;
  imagePreview: string;
  mimeType: string;
  mimeTypeValid = true;
  fileSizeOk = true;

  user: User;
  userRole: string;
  userDept: string;

  themeMode: string;
  themePref: string;

  private _userSub: Subscription;
  private _themeSub: Subscription;

  constructor(
    private store: Store<fromAppStore.AppState>,
    private http: HttpClient,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this._userSub = this.store
      .select('user')
      .pipe(map((userState) => userState))
      .subscribe((userState) => {
        if (userState.user) {
          this.user = userState.user;
          this.userDept = userState.user.userProfile.department;
          this.themePref = userState.user.userProfile.themePref;
          this.userLoading = userState.loading;
          this.userPhoto = userState.user.userProfile.userPhoto;
          console.log(this.user);
        }
      });

    this._initUserProfileForm();

    switch (this.user.userProfile.role) {
      case 3:
        this.userRole = 'Owner';
        break;
      case 2:
        this.userRole = 'Manager';
        break;
      case 1:
        this.userRole = 'Staff';
        break;
    }

    this._themeSub = this.themeService.themeStatus.subscribe(
      (themeModeData) => {
        this.themeMode = themeModeData;
      }
    );
    this.themeService.getThemeMode();
  }

  onUserProfileSubmit(userProfileForm: FormGroup) {
    if (this.userProfileForm.invalid) {
      return;
    }
    userProfileForm.updateValueAndValidity();
    console.log(userProfileForm.value);
    console.log(this.userProfileForm.get('userPhoto').value);

    const formData = new FormData();
    formData.append('userId', this.user._id ? this.user._id : this.user.userId);
    // formData.append('email', userProfileForm.value.email);
    // formData.append('role', this.user.userProfile.role.toString());
    // formData.append('department', userProfileForm.value.department);
    formData.append('firstName', userProfileForm.value.firstName);
    formData.append('lastName', userProfileForm.value.lastName);
    formData.append('phoneNumber', userProfileForm.value.phoneNumber);
    formData.append('themePref', userProfileForm.value.themePref);
    if (this.userPhotoUpload) {
      console.log('file');
      formData.append(
        'userPhoto',
        this.userProfileForm.value.userPhoto,
        this.userProfileForm.value.firstName +
          '_' +
          this.userProfileForm.value.lastName +
          '_' +
          this.userDept +
          '_' +
          this.userRole
      );
    }

    console.log(formData);
    console.log('||| ^^^ appended form data ^^^ |||');

    this.store.dispatch(UserActions.PUTUpdateUserStart());

    this.http
      .put<{ updatedUser: User }>(BACKEND_URL + '/update-user', formData)
      .subscribe((resData) => {
        console.log(resData);
        this.store.dispatch(
          UserActions.PUTUpdateUserSuccess({ user: resData.updatedUser })
        );
      });

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
    this.themeService.switchThemeMode(theme);
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
