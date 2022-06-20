import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngrx/store';
import { map, Subscription } from 'rxjs';
import * as fromAppStore from '../../app-store/app.reducer';

import { User } from 'src/app/users/user-control/user.model';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
  userProfileForm: FormGroup;
  imagePreview: string;

  user: User;
  userRole: string;

  private userAuthSub: Subscription;

  constructor(
    private store: Store<fromAppStore.AppState>,
    private router: Router
  ) {}

  ngOnInit() {
    this.userAuthSub = this.store
      .select('user')
      .pipe(map((authState) => authState.userAuth))
      .subscribe((user) => {
        this.user = user;
      });

    this.initUserProfileForm();

    switch (this.user.userProfile.role) {
      case (3):
      this.userRole = 'Owner';
        break;
      case (2):
      this.userRole = 'Manager';
        break;
      case (1):
      this.userRole = 'Staff';
        break;
    }
  }

  onUserProfileSubmit() {
    if (this.userProfileForm.invalid) {
      return;
    }
    this.userProfileForm.reset();
  }


  onCancelForm() {
    this.initUserProfileForm();
    this.imagePreview = null;
  }

  onAvatarPicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.userProfileForm.patchValue({ image: file });
    this.userProfileForm.get('avatar').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private initUserProfileForm() {
    this.userProfileForm = new FormGroup({
      firstName: new FormControl(this.user.userProfile.firstName, {
        validators: [Validators.required],
      }),
      lastName: new FormControl(this.user.userProfile.lastName, {
        validators: [Validators.required],
      }),
      phoneNumber: new FormControl(this.user.userProfile.phoneNumber, {
        validators: [Validators.required],
      }),
      avatar: new FormControl(null),
    });
  }

  // private initBusinessProfileForm() {
  //   this.businessProfileForm = new FormGroup({
  //     businessName: new FormControl(this.userData.businessName, Validators.required)
  //   })
  // }
}
