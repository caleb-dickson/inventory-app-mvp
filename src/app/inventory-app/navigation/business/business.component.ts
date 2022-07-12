import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { catchError, map } from 'rxjs';

import { environment } from 'src/environments/environment';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../app-store/app.reducer';
import * as BusinessActions from './business-store/business.actions';
import { authSuccess } from '../../../users/user-store/user.actions';

import { User } from 'src/app/users/user.model';
import { Location } from '../../models/location.model';
import { HttpClient } from '@angular/common/http';
import { Business } from '../../models/business.model';
import { BaseComponent } from '../../core/base-component';
import { ThemeService } from 'src/app/theme/theme.service';
import { BusinessService } from '../../inventory-app-control/business.service';

const BACKEND_URL = environment.apiUrl + '/business';

@Component({
  selector: 'app-manage',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss'],
})
export class BusinessComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  constructor(
    private _businessService: BusinessService,
    themeService: ThemeService,
    store: Store<fromAppStore.AppState>
  ) {
    super(store, themeService);
  }

  // Business State
  business: Business;
  locations: Location[];
  businessError: string;

  // FORMS
  businessForm: FormGroup;
  newLocationForm: FormGroup;
  updateLocationForm: FormGroup;
  addUserToLocationForm: FormGroup;

  // FILE UPLOADS
  imagePreview: string;
  bizPhotoUpload: Blob | null;
  mimeType: string;
  mimeTypeValid = true;
  fileSizeOk = true;

  // UI CONDITIONALS
  businessSubmitMode: string;
  locationSubmitMode = false;
  locationEditMode = false;
  locationEditSelector: Location;
  locationAddUserSelector: Location;
  addUserToLocationMode: string;

  ngOnInit(): void {
    // console.clear();

    // BUSINESS STORE
    this.businessStoreSub = this.store
      .select('business')
      .subscribe((businessState) => {
        this.business = businessState.business;
        this.appLoading = businessState.loading;
        this.businessLoading = businessState.loading;
        this.businessError = businessState.businessError;
        this._initBusinessForm();
        if (businessState.business && businessState.business._id) {
          this.locations = businessState.businessLocations;
          this.locationAddUserSelector = businessState.locationSelected;
          this.locationEditSelector = businessState.locationSelected;

          if (businessState.business) {
            this._initNewLocationForm();
          }
          if (businessState.business.locations.length > 0) {
            this._initUpdateLocationForm();
          }

          if (
            this.locationAddUserSelector &&
            this.locationAddUserSelector.locationName
          ) {
            this._initAddUserToLocationForm();
          }
        }
        if (this.userRole === 'Owner' || this.userDept === 'admin') {
          console.group(
            '%cBusiness State',
            `font-size: 1rem;
              color: yellow;`,
            businessState
          );
          console.groupEnd();
        }
      });
  }

  onEditBusiness(mode: string): void {
    this.businessSubmitMode = mode;
    this._initBusinessForm();
  }

  onEditLocation(mode: boolean | null, location?: Location): void {
    this.locationEditMode = mode;
    this.store.dispatch(BusinessActions.SelectLocation({ location: location }));
    console.log(this.locationEditSelector);
    this._initUpdateLocationForm();
  }

  onCreateLocation(mode: boolean): void {
    this.locationSubmitMode = mode;
    this._initNewLocationForm();
  }

  // RESETS THE FORMS AND UI TO ABORT EDITING
  onCancelForm(formToCancel: string): void {
    this.mimeTypeValid = true;
    this.fileSizeOk = true;
    this.imagePreview = null;
    this.store.dispatch(BusinessActions.clearError());

    switch (formToCancel) {
      case 'business':
        this.businessSubmitMode = null;
        this._initBusinessForm();
        break;
      case 'location':
        this.locationSubmitMode = false;
        this._initNewLocationForm();
        break;
      case 'location-update':
        this.locationEditMode = false;
        this._initUpdateLocationForm();
        break;
      case 'add-location-user':
        this.addUserToLocationMode = null;
        this.locationAddUserSelector = null;
        break;

      default:
        break;
    }
  }

  onBusinessPhotoPicked(event: Event): void {
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
  }

  // BUSINESS FORM SUBMIT (JUST TO CHANGE BUSINESS NAME FOR NOW)
  onBusinessSubmit(): void {
    if (this.businessForm.invalid) {
      return;
    }

    this._businessService.submitBusiness(
      this.businessForm,
      this.business._id,
      this.businessSubmitMode,
      this.bizPhotoUpload,
      this.user
    );

    this.businessSubmitMode = null;
  }

  // CREATE NEW LOCATION FOR BUSINESS SUBMIT
  onNewLocationSubmit(): void {
    if (this.newLocationForm.invalid) {
      return;
    }
    console.log(this.newLocationForm.value);
    this.store.dispatch(
      BusinessActions.POSTLocationStart({
        location: {
          _id: null,
          locationName: this.newLocationForm.value.locationName,
          parentBusiness: this.business._id,
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
  onUpdateLocationSubmit(): void {
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
  onAddUserToLocationSubmit(): void {
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

  private _initBusinessForm(): void {
    this.businessForm = new FormGroup({
      businessName: new FormControl(this.business?.businessName, {
        validators: [Validators.required],
      }),
      businessPhoto: new FormControl(null),
    });
  }

  private _initNewLocationForm(): void {
    this.newLocationForm = new FormGroup({
      locationName: new FormControl(null, {
        validators: [Validators.required],
      }),
    });
  }

  private _initUpdateLocationForm(): void {
    if (this.locationEditSelector && this.locationEditSelector.locationName) {
      this.updateLocationForm = new FormGroup({
        locationName: new FormControl(this.locationEditSelector.locationName, {
          validators: [Validators.required],
        }),
      });
    }
  }

  // addUserToLocationForm FORM STATE
  onAddUserToLocation(mode: string, location?: Location): void {
    this.addUserToLocationMode = mode;

    this.store.dispatch(BusinessActions.SelectLocation({ location: location }));

    this._initAddUserToLocationForm();
  }

  private _initAddUserToLocationForm(): void {
    let emails = new FormArray([]);

    this.addUserToLocationForm = new FormGroup({
      email: emails,
    });
  }

  get newUserControls() {
    return (<FormArray>this.addUserToLocationForm.get('email')).controls;
  }

  onAddNewUserControl(): void {
    (<FormArray>this.addUserToLocationForm.get('email')).push(
      new FormGroup({
        email: new FormControl(null, Validators.required),
      })
    );
  }

  onRemoveNewUserControl(index: number): void {
    if (this.newUserControls.length > 1) {
      (<FormArray>this.addUserToLocationForm.get('email')).removeAt(index);
    }
  }

  ngOnDestroy(): void {
    this.userStoreSub.unsubscribe();
    this.businessStoreSub.unsubscribe();
  }
}
