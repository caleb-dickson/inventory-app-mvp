import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { map, Subscription, take } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as BusinessActions from '../business/business-store/business.actions';

import { User } from 'src/app/auth/auth-control/user.model';
import { LocationIds } from './business-control/business.model';
import { Location } from './business-control/location.model';

@Component({
  selector: 'app-manage',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss'],
})
export class BusinessComponent implements OnInit {
  authState: object;
  businessState: any;

  isLoading: boolean;

  businessName: string;
  businessId: string;

  locationSelector: Location;
  locationName: string;
  locations: any[];

  showEditControls = 'hidden';
  businessSubmitMode: string;
  locationSubmitMode = false;
  locationEditMode = false;

  businessForm: FormGroup;
  newLocationForm: FormGroup;
  updateLocationForm: FormGroup;

  user: User;
  userId: string;
  userRole: string;

  authError: string;
  businessError: string;

  private userAuthSub: Subscription;
  private businessStoreSub: Subscription;

  constructor(
    private store: Store<fromAppStore.AppState>,
    private router: Router
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

    this.checkBusiness();

    this.businessStoreSub = this.store
      .select('business')
      .pipe(map((bizState) => bizState))
      .subscribe((bizState) => {
        this.businessState = bizState;
        this.isLoading = bizState.loading;
        this.businessError = bizState.businessError;
        if (bizState.business && bizState.business._id) {
          this.businessName = bizState.business.businessName;
          this.businessId = bizState.business._id;
          this.locations = bizState.business.locations;
          this.locationName = 'test';
          this.initBusinessForm();
          this.initNewLocationForm();
          this.initUpdateLocationForm();
        }
        console.log(bizState);
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

  onEditControlHover(visibility: string) {
    this.showEditControls = visibility;
    console.log(this.showEditControls);
  }

  checkBusiness() {
    const storedBusiness: {
      business: {
        _id: string;
        businessName: string;
        ownerId: string;
        locations: any[];
      };
    } = JSON.parse(localStorage.getItem('storedBusiness'));

    if (storedBusiness) {
      console.log('||| Business fetched from local storage |||');
      console.log(storedBusiness.business.locations);
      // this.setLocations(storedBusiness);
      this.store.dispatch(
        BusinessActions.GETBusinessSuccess({
          business: {
            _id: storedBusiness.business._id,
            businessName: storedBusiness.business.businessName,
            ownerId: storedBusiness.business.ownerId,
            locations: [...storedBusiness.business.locations],
          },
        })
      );
    } else if (!storedBusiness && this.user.userProfile.businessId) {
      console.log('||| Fetching business from DB |||');
      console.log(this.userId)
      this.store.dispatch(
        BusinessActions.GETBusinessStart({
          ownerId: this.userId,
        })
      );
    } else {
      this.store.dispatch(BusinessActions.GETEntityFail({ errorMessage: 'No business found.'}))
    }
  }

  onEditBusiness(mode: string) {
    this.businessSubmitMode = mode;
    console.log(this.businessSubmitMode);
    this.initBusinessForm();
  }

  onEditLocation(mode: boolean | null, location?: Location) {
    this.locationEditMode = mode;
    this.locationSelector = location;
    console.log(this.locationSelector);
    this.initUpdateLocationForm();
  }

  onCreateLocation(mode: boolean) {
    this.locationSubmitMode = mode;
    this.initNewLocationForm();
  }

  onCancelForm(formToCancel: string) {
    if (formToCancel === 'business') {
      this.businessSubmitMode = null;
      this.initBusinessForm();
    } else if (formToCancel === 'location') {
      this.locationSubmitMode = null;
      this.initNewLocationForm();
    } else if (formToCancel === 'location-update') {
      this.locationEditMode = false;
      this.initUpdateLocationForm();
    }
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
    this.initBusinessForm();
  }

  onUpdateLocationSubmit() {
    console.log(this.updateLocationForm.value);
    this.store.dispatch(
      BusinessActions.PUTLocationStart({
        location: {
          _id: this.locationSelector._id,
          locationName: this.updateLocationForm.value.locationName,
          parentBusiness: this.locationSelector.parentBusiness,
          inventoryData: this.locationSelector.inventoryData,
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
          inventoryData: [],
        },
      })
    );
    this.locationSubmitMode = null;
    this.initNewLocationForm();
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
      businessName: new FormControl(this.businessName /* NEED BIZ DATA */, {
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
    if (this.locationSelector && this.locationSelector.locationName) {
      this.updateLocationForm = new FormGroup({
        locationName: new FormControl(this.locationSelector.locationName, {
          validators: [Validators.required],
        }),
      });
    }
  }
}
