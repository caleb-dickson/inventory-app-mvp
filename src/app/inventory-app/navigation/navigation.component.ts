import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as UserActions from '../../users/user-store/user.actions';
import * as BusinessActions from './business/business-store/business.actions';
import { BusinessState } from './business/business-store/business.reducer';

import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ThemeService } from 'src/app/theme/theme.service';
import { Business } from '../models/business.model';
import { Location } from '../models/location.model';
import { LocationService } from '../inventory-app-control/location.service';
import { Inventory } from '../models/inventory.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '../core/base-component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent extends BaseComponent implements OnInit {
  constructor(
    private _breakpointObserver: BreakpointObserver,
    private _locationService: LocationService,
    themeService: ThemeService,
    store: Store<fromAppStore.AppState>
  ) {
    super(store, themeService);
  }

  // UI
  sideNavOpen: boolean;
  manageIcon: string;
  manageRoute: string;
  navSpacer: string;
  isHandset$: Observable<boolean> = this._breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  // BUSINESS STATE
  businessState: BusinessState;
  business: Business;
  businessName: string;
  businessId: string;
  // OWNER USER SPECIFIC BUSINESS STATE
  singleBizLocationName: string;
  multiBizLocations: Location[];

  multiLocationSelectForm: FormGroup;

  // INVENTORY PROPS
  inventoryDataPopulated: Inventory[];
  workingInventory: any;
  workingInventoryItems: any;
  newInventoryProducts: any[] = [];
  initInvProducts = true;
  initLocInventories = true;
  // NON-OWNER USER SPECIFIC LOCATION STATE
  singleUserLocation: Location;
  singleUserLocationName: string;
  multiUserLocations: Location[];

  ngOnInit() {
    console.clear();

    this.locationStoreSub = this.store
      .select('location')
      .subscribe((locState) => {
        this.workingInventory = locState.activeInventory;

        this.multiUserLocations =
          locState.userLocations.length > 1 ? locState.userLocations : null;

        this.singleUserLocation =
          locState.userLocations.length === 1
            ? locState.userLocations[0]
            : null;

        this.singleUserLocationName =
          locState.userLocations.length === 1
            ? locState.userLocations[0].locationName
            : null;

        // SET AN ERROR ON THE LOCATION SELECTOR
        // IF NO LOCATION HAS BEEN SELECED YET
        this._initMultiLocationSelectForm();
        if (!this.activeLocation) {
          this.multiLocationSelectForm.markAsTouched();
          this.multiLocationSelectForm.markAsDirty();
          this.multiLocationSelectForm
            .get('activeLocation')
            .setErrors({ noActiveLocation: true });
        } else {
          this.multiLocationSelectForm
            .get('activeLocation')
            .setValue(this.activeLocation);
          this.multiLocationSelectForm.updateValueAndValidity();
        }
        console.log(this.multiLocationSelectForm.value);

        // ONCE A LOCATION HAS BEEN SELECTED/ACTIVATED
        if (locState.activeLocation?.productList.length > 0) {
          this.locationProducts = locState.activeLocation.productList;
          this.inventoryDataPopulated = locState.activeLocationInventories;

          // AND POPULATED (JOINED) INVENTORIES WERE NOT ALREADY
          // FETCHED SINCE LAST RELOAD
          if (
            !locState.activeLocationInventories ||
            (locState.activeLocationInventories?.length === 0 &&
              locState.activeLocation?.inventoryData.length > 0)
          ) {
            this._onGetPopulatedInventories();
          }
        }
      });

    this.businessStoreSub = this.store
      .select('business')
      .subscribe((businessState) => {
        this.businessState = businessState;
        if (businessState.business && businessState.business._id) {
          this.businessLoading = businessState.loading;
          this.business = businessState.business;
          this.businessName = businessState.business.businessName;
          this.businessId = businessState.business._id;
          this.multiBizLocations =
            this.businessState.businessLocations.length > 1
              ? businessState.businessLocations
              : null;

          this.singleBizLocationName =
            this.businessState.businessLocations.length === 1
              ? businessState.businessLocations[0].locationName
              : null;
        }
      });

    this.setNavSpacer();

    if (this.userRole === 'owner') {
      // OWNER USERS GET ALL BUSINESS LOCATIONS
      this.getBusiness();
    } else {
      // NON-OWNER USERS ONLY GET LOCATIONS THEY'RE ADDED TO
      this.onGetLocations();
    }

    this.manageIcon =
      this.userRole === 'owner' || this.userDept === 'admin'
        ? 'business'
        : 'store';

    this.isHandset$.subscribe((state) => {
      this.sideNavOpen = !state;
    });

    if (this.userRole === 'owner') {
      // IF BUSINESS HAS MULTIPLE LOCATIONS
      if (this.multiBizLocations) {
        this._locationService.getActivatedLocation();

        // IF BUSINESS ONLY HAS ONE LOCATION
      } else if (this.singleBizLocationName) {
        console.log(
          '%cUser Location: ',
          `font-size: 1rem;
            color: lightgreen;`,
          this.singleBizLocationName
        );
        this.onActivateLocation(this.businessState.businessLocations[0]);
      }
    } else {
      // IF MANAGER HAS MULTIPLE AUTHORIZED LOCATIONS CHECK
      // IN LOCALSTORAGE WHICH IS ACTIVE
      if (this.userLocations.length > 1) {
        this._locationService.getActivatedLocation();
        // IF USER ONLY HAS ONE AUTHORIZED LOCATION, ACTIVATE THAT ONE
      } else if (this.userLocations.length === 1) {
        this.onActivateLocation(this.userLocations[0]);
      }
    }
  }

  setNavSpacer(): string {
    switch (this.userRole) {
      case 'owner':
        return 'spacer-owner';
      case 'manager':
        return 'spacer-mgr';
      case 'staff':
        return 'spacer-staff';
      default:
        return;
    }
  }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  // GET AND STORE A POPULATED LIST OF THIS LOCATION'S INVENTORIES
  private _onGetPopulatedInventories() {
    this._locationService.getPopulatedInventories(this.initLocInventories);
    this.initLocInventories = false;
  }

  private _initMultiLocationSelectForm() {
    this.multiLocationSelectForm = new FormGroup({
      activeLocation: new FormControl(this.activeLocation, Validators.required),
    });
  }

  onActivateLocation(activeLocation: Location) {
    this._locationService.activateLocation(activeLocation);
  }

  onLogout() {
    this.store.dispatch(UserActions.logout());
  }

  getBusiness() {
    const storedBusiness: {
      business: Business;
    } = JSON.parse(localStorage.getItem('storedBusiness'));

    if (storedBusiness) {
      console.log(
        '%cStored Business',
        `font-size: 1rem;
          color: lightgreen;`,
        storedBusiness.business
      );
      this.store.dispatch(
        BusinessActions.GETBusinessSuccess({
          business: {
            _id: storedBusiness.business._id,
            businessName: storedBusiness.business.businessName,
            ownerId: storedBusiness.business.ownerId,
            businessPhoto: storedBusiness.business.businessPhoto,
            locations: [...storedBusiness.business.locations],
          },
        })
      );
      this.onGetLocations();
    } else if (!storedBusiness) {
      console.warn('||| Fetching business from DB |||');
      this.store.dispatch(
        BusinessActions.GETBusinessStart({
          ownerId: this.user.userId,
        })
      );
    } else {
      console.error('||| checkBusiness error |||');
      this.store.dispatch(
        BusinessActions.BusinessError({ errorMessage: 'No business found.' })
      );
    }
  }

  onGetLocations() {
    this._locationService.getLocations(
      this.user.userId,
      this.userRole,
      this.user.userProfile.role
    );
  }

  ngOnDestroy(): void {
    this.userStoreSub.unsubscribe();
    this.businessStoreSub.unsubscribe();
    this.locationStoreSub.unsubscribe();
    this.themeSub.unsubscribe();
  }
}
