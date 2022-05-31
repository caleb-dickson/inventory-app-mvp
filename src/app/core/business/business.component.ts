import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { map, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as BusinessActions from '../business/business-store/business.actions';

import { User } from 'src/app/auth/auth-control/user.model';
import { Location } from './business-control/location.model';
import { BusinessService } from './business-control/business.service';

@Component({
  selector: 'app-manage',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss'],
})
export class BusinessComponent implements OnInit {
  private userAuthSub: Subscription;
  private businessStoreSub: Subscription;

  authState: object;
  businessState: any;

  isLoading: boolean;

  businessName: string;
  businessId: string;

  locationEditSelector: Location;
  locationAddUserSelector: Location;
  locations: any[];
  locationName: string;

  showEditControls = 'hidden';
  businessSubmitMode: string;
  locationSubmitMode = false;
  locationEditMode = false;
  addUserToLocationMode: string;

  businessForm: FormGroup;
  newLocationForm: FormGroup;
  updateLocationForm: FormGroup;
  addUserToLocationForm: FormGroup;

  user: User;
  userId: string;
  userRole: string;

  authError: string;
  businessError: string;

  constructor(
    private store: Store<fromAppStore.AppState>,
    private businessService: BusinessService
  ) {}

  ngOnInit() {
    this.userAuthSub = this.store
      .select('auth')
      .pipe(map((authState) => authState))
      .subscribe((authState) => {
        this.authState = authState;
        if (authState && authState.userAuth) {
          this.user = authState.userAuth;
          this.userId = authState.userAuth.userId;
        }
      });

    // this.checkBusiness();

    this.businessStoreSub = this.store
      .select('business')
      .subscribe((bizState) => {
        this.businessState = bizState;
        this.isLoading = bizState.loading;
        this.businessError = bizState.businessError;
        console.log(bizState);
        console.log(this.locations);
        console.log(this.businessError);
        if (bizState.business && bizState.business._id) {
          this.businessName = bizState.business.businessName;
          this.businessId = bizState.business._id;
          this.locations = bizState.businessLocations;
          this.locationAddUserSelector = bizState.locationSelected;
          this.locationEditSelector = bizState.locationSelected;
          // this.locationName = 'test';
          this.initBusinessForm();
          this.initNewLocationForm();
          this.initUpdateLocationForm();
          this.initAddUserToLocationForm();
        }
      });

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
  }

  onEditBusiness(mode: string) {
    this.businessSubmitMode = mode;
    this.initBusinessForm();
  }

  onEditLocation(mode: boolean | null, location?: Location) {
    this.locationEditMode = mode;
    this.store.dispatch(BusinessActions.SelectLocation({ location: location }));
    console.log(this.locationEditSelector);
    this.initUpdateLocationForm();
  }

  onCreateLocation(mode: boolean) {
    this.locationSubmitMode = mode;
    this.initNewLocationForm();
  }

  onAddUserToLocation(mode: string, location?: Location) {
    this.addUserToLocationMode = mode;

    this.store.dispatch(BusinessActions.SelectLocation({ location: location }));

    this.initAddUserToLocationForm();
  }

  onCancelForm(formToCancel: string) {
    if (formToCancel === 'business') {
      this.businessSubmitMode = null;
      this.initBusinessForm();
    } else if (formToCancel === 'location') {
      this.locationSubmitMode = false;
      this.initNewLocationForm();
    } else if (formToCancel === 'location-update') {
      this.locationEditMode = false;
      this.initUpdateLocationForm();
    } else if (formToCancel === 'add-location-user') {
      this.addUserToLocationMode = null;
      this.locationAddUserSelector = null;
    }
    this.store.dispatch(BusinessActions.clearError());
  }

  onBusinessSubmit() {
    if (this.businessForm.invalid) {
      return;
    }
    if (this.businessSubmitMode === 'new') {
      console.log(this.businessForm.value);
      console.log(this.businessForm);
      this.store.dispatch(
        BusinessActions.POSTBusinessStart({
          business: {
            _id: null,
            businessName: this.businessForm.value.businessName,
            ownerId: this.userId,
            locations: [],
          },
        })
      );
    } else {
    }
    this.businessSubmitMode === 'update';
    this.store.dispatch(
      BusinessActions.PUTBusinessStart({
        business: {
          _id: this.businessId,
          businessName: this.businessForm.value.businessName,
          ownerId: this.userId,
          locations: this.locations,
        },
      })
    );
    this.businessSubmitMode = null;
  }

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
          inventoryData: this.locationEditSelector.inventoryData,
        },
      })
    );
  }

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
          inventoryData: [],
        },
      })
    );
    this.locationSubmitMode = null;
    this.initNewLocationForm();
  }

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
  }

  // onAvatarPicked(event: Event) {
  //   const file = (event.target as HTMLInputElement).files[0];
  //   this.userProfileForm.patchValue({ image: file });
  //   this.userProfileForm.get('avatar').updateValueAndValidity();
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     this.imagePreview = reader.result as string;
  //   };
  //   reader.readAsDataURL(file);
  // }

  private initBusinessForm() {
    this.businessForm = new FormGroup({
      businessName: new FormControl(this.businessName, {
        validators: [Validators.required],
      }),
    });
  }

  private initNewLocationForm() {
    this.newLocationForm = new FormGroup({
      locationName: new FormControl(null, {
        validators: [Validators.required],
      }),
    });
  }

  private initUpdateLocationForm() {
    if (this.locationEditSelector && this.locationEditSelector.locationName) {
      this.updateLocationForm = new FormGroup({
        locationName: new FormControl(this.locationEditSelector.locationName, {
          validators: [Validators.required],
        }),
      });
    }
  }

  get newStaffControls() {
    return (<FormArray>this.addUserToLocationForm.get('email')).controls;
  }

  onAddNewStaffControl() {
    (<FormArray>this.addUserToLocationForm.get('email')).push(
      new FormGroup({
        email: new FormControl(null, Validators.required),
      })
    );
  }

  onRemoveNewStaffControl(index: number) {
    (<FormArray>this.addUserToLocationForm.get('email')).removeAt(index);
  }

  private initAddUserToLocationForm() {
    let emails = new FormArray([]);

    if (
      this.locationAddUserSelector &&
      this.locationAddUserSelector.locationName
    ) {
      this.addUserToLocationForm = new FormGroup({
        email: emails,
      });
    }
  }
}
