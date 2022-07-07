import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { catchError, map, Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as BusinessActions from '../business/business-store/business.actions';
import { authSuccess } from '../../users/user-store/user.actions';

import { User } from 'src/app/users/user.model';
import { Location } from '../models/location.model';
import { UserState } from 'src/app/users/user-store/user.reducer';
import { BusinessState } from './business-store/business.reducer';
import { HttpClient } from '@angular/common/http';
import { Business } from '../models/business.model';

const BACKEND_URL = environment.apiUrl + '/business';

@Component({
  selector: 'app-manage',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss'],
})
export class BusinessComponent implements OnInit, OnDestroy {
  constructor(
    private store: Store<fromAppStore.AppState>,
    private http: HttpClient
  ) {}

  // SUBSCRIPTIONS
  private userAuthSub: Subscription;
  private businessStoreSub: Subscription;

  // STATE RELATED VARIABLES
  // Auth State
  authState: UserState;
  user: User;
  userId: string;
  userRole: string;
  userDept: string;
  authError: string;

  // Business State
  businessState: BusinessState;
  loading: boolean;
  businessError: string;

  businessName: string;
  businessId: string;
  businessPhoto: string;
  businessSubmitMode: string;

  locations: Location[];
  locationName: string;

  locationSubmitMode = false;
  locationEditMode = false;
  locationEditSelector: Location;
  locationAddUserSelector: Location;
  addUserToLocationMode: string;

  // FORMS
  businessForm: FormGroup;
  newLocationForm: FormGroup;
  updateLocationForm: FormGroup;
  addUserToLocationForm: FormGroup;

  imagePreview: string;
  bizPhotoUpload: Blob | null;
  mimeType: string;
  mimeTypeValid = true;
  fileSizeOk = true;

  ngOnInit() {
    console.clear();

    // USER STORE
    this.userAuthSub = this.store
      .select('user')
      .pipe(map((authState) => authState))
      .subscribe((authState) => {
        this.authState = authState;
        if (authState && authState.user) {
          this.user = authState.user;
          this.userId = authState.user.userId;
          this.userDept = authState.user.userProfile.department;
        }
      });

    // BUSINESS STORE
    this.businessStoreSub = this.store
      .select('business')
      .subscribe((bizState) => {
        this.businessState = bizState;
        this.loading = bizState.loading;
        this.businessError = bizState.businessError;
        this._initBusinessForm();
        if (bizState.business && bizState.business._id) {
          this.businessName = bizState.business.businessName;
          this.businessId = bizState.business._id;
          this.locations = bizState.businessLocations;
          this.locationAddUserSelector = bizState.locationSelected;
          this.locationEditSelector = bizState.locationSelected;
          this.businessPhoto = bizState.business.businessPhoto;

          if (bizState.business) {
            this._initNewLocationForm();
          }
          if (bizState.business.locations.length > 0) {
            this._initUpdateLocationForm();
          }

          if (
            this.locationAddUserSelector &&
            this.locationAddUserSelector.locationName
          ) {
            this._initAddUserToLocationForm();
          }
        }
      });

    // SWITCH USER ROLE TO READABLE STRING
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
    if (this.userRole === 'Owner' || this.userDept === 'admin') {
      console.group(
        '%cBusiness State',
        `font-size: 1rem;
          color: yellow;`,
        this.businessState
      );
      console.groupEnd();
    }
  }

  onEditBusiness(mode: string) {
    this.businessSubmitMode = mode;
    this._initBusinessForm();
  }

  onEditLocation(mode: boolean | null, location?: Location) {
    this.locationEditMode = mode;
    this.store.dispatch(BusinessActions.SelectLocation({ location: location }));
    console.log(this.locationEditSelector);
    this._initUpdateLocationForm();
  }

  onCreateLocation(mode: boolean) {
    this.locationSubmitMode = mode;
    this._initNewLocationForm();
  }

  // RESETS THE FORMS AND UI TO ABORT EDITING
  onCancelForm(formToCancel: string) {
    if (formToCancel === 'business') {
      this.businessSubmitMode = null;
      this._initBusinessForm();
    } else if (formToCancel === 'location') {
      this.locationSubmitMode = false;
      this._initNewLocationForm();
    } else if (formToCancel === 'location-update') {
      this.locationEditMode = false;
      this._initUpdateLocationForm();
    } else if (formToCancel === 'add-location-user') {
      this.addUserToLocationMode = null;
      this.locationAddUserSelector = null;
    }
    this.mimeTypeValid = true;
    this.fileSizeOk = true;
    this.imagePreview = null;
    this.store.dispatch(BusinessActions.clearError());
  }

  onBusinessPhotoPicked(event: Event) {
    this.bizPhotoUpload = (event.target as HTMLInputElement).files[0];

    // SET FORM VALUE AS INPUT FILE
    this.businessForm.patchValue({ businessPhoto: this.bizPhotoUpload });
    this.businessForm.get('businessPhoto').updateValueAndValidity();

    // READ AND VALIDATE THE FILE
    const reader = new FileReader();
    reader.onloadend = () => {
      this.imagePreview = reader.result as string;
      this.mimeType = this.bizPhotoUpload.type;

      // CHECK FILE SIZE AND ASSIGN VALIDITY VALUE
      this.fileSizeOk = this.bizPhotoUpload.size < 5000000 ? true : false;

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
        this.businessForm
          .get('businessPhoto')
          .setErrors({ invalidMimeType: true });

        // IF FILE IS TOO LARGE, SET FORM ERROR
      } else if (!this.fileSizeOk) {
        this.businessForm
          .get('businessPhoto')
          .setErrors({ fileTooLarge: true });
      }
    };

    this.businessForm.get('businessPhoto').updateValueAndValidity();
    reader.readAsDataURL(this.bizPhotoUpload);
    console.log(this.businessForm.value);
  }

  // BUSINESS FORM SUBMIT (JUST TO CHANGE BUSINESS NAME FOR NOW)
  onBusinessSubmit() {
    if (this.businessForm.invalid) {
      return;
    }
    if (this.businessSubmitMode === 'new') {
      this.businessForm.updateValueAndValidity();
      console.log(this.businessForm.value);
      console.log(this.businessForm);

      const formData = new FormData();
      formData.append('_id', null);
      formData.append('businessName', this.businessForm.value.businessName);
      formData.append('ownerId', this.userId);
      if (this.bizPhotoUpload) {
        formData.append(
          'businessPhoto',
          this.businessForm.value.businessPhoto,
          this.businessForm.value.businessName
        );
      }
      formData.append('locations', null);

      console.log(formData);
      console.log('||| ^^^ appended form data ^^^ |||');

      this.store.dispatch(BusinessActions.POSTBusinessStart());

      this.http
        .post<{
          message: string;
          business: Business;
          businessId: string;
          updatedUser: User;
          updatedUserId: string;
        }>(BACKEND_URL + '/create-business', formData)
        .pipe(
          map((resData) => {
            console.log(resData);
            if (resData.business) {
              const storedBusiness = {
                business: {
                  _id: resData.businessId,
                  businessName: resData.business.businessName,
                  ownerId: resData.business.ownerId,
                  locations: resData.business.locations,
                },
              };

              localStorage.setItem(
                'storedBusiness',
                JSON.stringify(storedBusiness)
              );
            }

            const userProfileData = {
              userId: resData.updatedUserId,
              email: resData.updatedUser.email,
              userProfile: resData.updatedUser.userProfile,
            };
            localStorage.setItem(
              'userProfileData',
              JSON.stringify(userProfileData)
            );

            this.store.dispatch(
              authSuccess({
                user: {
                  _id: resData.updatedUserId,
                  userId: resData.updatedUserId,
                  email: resData.updatedUser.email,
                  password: resData.updatedUser.password,
                  userProfile: resData.updatedUser.userProfile,
                },
              })
            );

            this.store.dispatch(BusinessActions.POSTBusinessSuccess({
              business: {
                _id: resData.businessId,
                businessName: resData.business.businessName,
                ownerId: resData.business.ownerId,
                businessPhoto: resData.business.businessPhoto,
                locations: [],
              },
            }));
          }),
          catchError((errorRes) => {
            return errorRes;
          })
        )
        .subscribe((resData) => {
          console.log(resData);
          console.log('||| ^^^ sub data ^^^ |||');
        });
      this.businessSubmitMode = null;
    } else {
      this.businessSubmitMode === 'update';
      this.businessForm.updateValueAndValidity();
      console.log(this.businessForm.value);
      console.log(this.businessForm);

      const formData = new FormData();
      formData.append('businessId', this.businessId);
      formData.append('businessName', this.businessForm.value.businessName);
      formData.append('ownerId', this.userId);
      if (this.bizPhotoUpload) {
        formData.append(
          'businessPhoto',
          this.businessForm.value.businessPhoto,
          this.businessForm.value.businessName + '_photo'
        );
      }
      formData.append('locations', null);

      console.log(formData);
      console.log('||| ^^^ appended form data ^^^ |||');

      this.store.dispatch(BusinessActions.PUTBusinessStart());

      this.http
        .put<{
          message: string;
          updatedBusiness: Business;
          updatedBusinessId: string;
        }>(BACKEND_URL + '/update-business/', formData)
        .pipe(
          map((resData) => {
            console.log(resData);
            const storedBusiness = {
              business: resData.updatedBusiness,
            };

            localStorage.setItem(
              'storedBusiness',
              JSON.stringify(storedBusiness)
            );

            this.store.dispatch(
              BusinessActions.PUTBusinessSuccess({
                business: resData.updatedBusiness,
              })
            );
          }),
          catchError((errorRes) => {
            this.store.dispatch(
              BusinessActions.BusinessError({ errorMessage: errorRes })
            );
            return null;
          })
        )
        .subscribe((resData) => {
          console.log(resData);
          console.log('||| ^^^ sub data ^^^ |||');
        });

      // this.store.dispatch(
      //   BusinessActions.PUTBusinessStart({
      //     business: {
      //       _id: this.businessId,
      //       businessName: this.businessForm.value.businessName,
      //       ownerId: this.userId,
      //       businessPhoto: this.businessPhoto,
      //       locations: this.locations,
      //     },
      //   })
      // );
      this.businessSubmitMode = null;
    }
  }

  // CREATE NEW LOCATION FOR BUSINESS SUBMIT
  onNewLocationSubmit() {
    if (this.newLocationForm.invalid) {
      return;
    }
    console.log(this.newLocationForm.value);
    this.store.dispatch(
      BusinessActions.POSTLocationStart({
        location: {
          _id: null,
          locationName: this.newLocationForm.value.locationName,
          parentBusiness: this.businessId,
          managers: [],
          staff: [],
          productList: [],
          inventoryData: [],
        },
      })
    );
    this.locationSubmitMode = null;
    this._initNewLocationForm();
  }

  // LOCATION FORM SUBMIT (JUST TO CHANGE LOCATION NAME FOR NOW)
  onUpdateLocationSubmit() {
    console.log(this.updateLocationForm.value);
    this.store.dispatch(
      BusinessActions.PUTLocationStart({
        location: {
          _id: this.locationEditSelector._id,
          locationName: this.updateLocationForm.value.locationName,
          parentBusiness: this.locationEditSelector.parentBusiness,
          managers: this.locationEditSelector.managers,
          staff: this.locationEditSelector.staff,
          productList: this.locationEditSelector.productList,
          inventoryData: this.locationEditSelector.inventoryData,
        },
      })
    );
  }

  // ADD ANY NON-OWNER TO A LOCATION'S AUTHORIZED USERS LIST
  // CONDITIONAL FOR MANAGERS/JUNIOR STAFF
  onAddUserToLocationSubmit() {
    if (this.addUserToLocationForm.invalid) {
      return;
    }

    let emailStringArr = [];
    for (const emails of this.addUserToLocationForm.value.email) {
      emailStringArr.push(emails.email);
    }
    console.log(emailStringArr);

    console.log(this.addUserToLocationForm.value);
    console.log(this.locationAddUserSelector._id);

    const authRole = this.addUserToLocationMode;
    console.log(authRole);

    this.store.dispatch(
      BusinessActions.PUTUserToLocationStart({
        emails: emailStringArr,
        role: authRole,
        location: this.locationAddUserSelector,
      })
    );
    this.addUserToLocationMode = null;
  }

  private _initBusinessForm() {
    this.businessForm = new FormGroup({
      businessName: new FormControl(this.businessName, {
        validators: [Validators.required],
      }),
      businessPhoto: new FormControl(null),
    });
  }

  private _initNewLocationForm() {
    this.newLocationForm = new FormGroup({
      locationName: new FormControl(null, {
        validators: [Validators.required],
      }),
    });
  }

  private _initUpdateLocationForm() {
    if (this.locationEditSelector && this.locationEditSelector.locationName) {
      this.updateLocationForm = new FormGroup({
        locationName: new FormControl(this.locationEditSelector.locationName, {
          validators: [Validators.required],
        }),
      });
    }
  }

  // addUserToLocationForm FORM STATE
  onAddUserToLocation(mode: string, location?: Location) {
    this.addUserToLocationMode = mode;

    this.store.dispatch(BusinessActions.SelectLocation({ location: location }));

    this._initAddUserToLocationForm();
  }

  private _initAddUserToLocationForm() {
    let emails = new FormArray([]);

    this.addUserToLocationForm = new FormGroup({
      email: emails,
    });
  }

  // GETS AND HOLDS THE LIST OF addUserToLocationForm CONTROLS
  get newUserControls() {
    return (<FormArray>this.addUserToLocationForm.get('email')).controls;
  }

  onAddNewUserControl() {
    (<FormArray>this.addUserToLocationForm.get('email')).push(
      new FormGroup({
        email: new FormControl(null, Validators.required),
      })
    );
  }

  onRemoveNewUserControl(index: number) {
    if (this.newUserControls.length > 1) {
      (<FormArray>this.addUserToLocationForm.get('email')).removeAt(index);
    }
  }

  ngOnDestroy(): void {
    this.userAuthSub.unsubscribe();
    this.businessStoreSub.unsubscribe();
  }
}
