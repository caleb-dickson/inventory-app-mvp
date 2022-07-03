import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as UserActions from '../../users/user-store/user.actions';
import * as BusinessActions from '../business/business-store/business.actions';
import { BusinessState } from '../business/business-store/business.reducer';
import { LocationState } from '../business/location/location-store/location.reducer';

import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { User } from 'src/app/users/user-control/user.model';

import { ThemeService } from 'src/app/app-control/theme.service';
import { Business } from '../models/business.model';
import { Location } from '../models/location.model';
import { LocationService } from '../core-control/location.service';
import { Inventory } from '../models/inventory.model';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  constructor(
    private _breakpointObserver: BreakpointObserver,
    private _themeService: ThemeService,
    private _locationService: LocationService,
    private _store: Store<fromAppStore.AppState>
  ) {}

  // SUBS
  private _userStoreSub: Subscription;
  private _businessStoreSub: Subscription;
  private _locationStoreSub: Subscription;
  private _themeSub: Subscription;

  // UI
  themeMode: string;
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

  // USER STATE
  isAuthenticated: boolean;
  user: User;
  userRole: string;
  userDept: string;

  // BUSINESS STATE
  businessState: BusinessState;
  businessName: string;
  businessId: string;
  // OWNER USER SPECIFIC
  singleBizLocationName: string;
  multiBizLocations: Location[];

  // LOCATION STATE
  locationState: LocationState;
  activeLocation: Location;
  locationProducts: any[];
  selectedProducts: Product[] = [];
  activeProducts: Product[] = [];

  inventoryData: any[];
  inventoryDataPopulated: Inventory[];
  workingInventory: any;
  workingInventoryItems: any;
  newInventoryProducts: any[] = [];
  initInvProducts = true;
  initLocInventories = true;
  // NON-OWNER USER SPECIFIC
  singleUserLocation: Location;
  singleUserLocationName: string;
  multiUserLocations: Location[];

  ngOnInit() {
    console.clear();

    this._userStoreSub = this._store
      .select('user')
      .pipe(map((userState) => userState.user))
      .subscribe((user) => {
        this.isAuthenticated = !!user;
        if (this.isAuthenticated) {
          this.user = user;
          this.userDept = user.userProfile.department
            ? user.userProfile.department
            : null;
          switch (user.userProfile.role) {
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
      });

    if (this.userRole === 'owner') {
      // OWNER USERS GET ALL BUSINESS LOCATIONS
      this.onGetBusiness();
    } else {
      // NON-OWNER USERS ONLY GET LOCATIONS THEY'RE ADDED TO
      this.onGetLocations();
    }

    this._locationStoreSub = this._store
      .select('location')
      .subscribe((locState) => {
        this.locationState = locState;

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

        this.activeLocation = locState.activeLocation;
        this.activeProducts = locState.activeProducts;
        this.workingInventory = locState.activeInventory;

        // ONCE A LOCATION HAS BEEN ACTIVATED
        if (
          locState.activeLocation &&
          locState.activeLocation.productList &&
          locState.activeLocation.productList.length > 0
        ) {
          this.locationProducts = locState.activeLocation.productList;
          this.inventoryData = locState.activeLocation.inventoryData;
          this.inventoryDataPopulated = locState.activeLocationInventories;

          // AND POPULATED INVENTORIES ARE NOT ALREADY FETCHED SINCE LAST RELOAD
          if (
            !locState.activeLocationInventories ||
            (locState.activeLocationInventories.length === 0 &&
              locState.activeLocation.inventoryData.length > 0)
          ) {
            this._onGetPopulatedInventories();
          }
        }
      });

    this._businessStoreSub = this._store
      .select('business')
      .subscribe((bizState) => {
        this.businessState = bizState;
        if (bizState.business && bizState.business._id) {
          this.businessName = bizState.business.businessName;
          this.businessId = bizState.business._id;
          this.multiBizLocations =
            this.businessState.businessLocations.length > 1
              ? bizState.businessLocations
              : null;

          this.singleBizLocationName =
            this.businessState.businessLocations.length === 1
              ? bizState.businessLocations[0].locationName
              : null;
        }
      });

    this._themeSub = this._themeService.themeStatus.subscribe(
      (themeModeData) => {
        this.themeMode = themeModeData;
      }
    );
    this._themeService.getThemeMode();

    this.manageIcon =
      this.userRole === 'owner' || this.userDept === 'admin'
        ? 'business'
        : 'store';

    this.isHandset$.subscribe((state) => {
      this.sideNavOpen = !state;
      this.setNavSpacer(state);
    });

    if (this.userRole === 'owner') {
      if (this.multiBizLocations) {
        this._locationService.getActivatedLocation();
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
      if (this.locationState.userLocations.length > 1) {
        this._locationService.getActivatedLocation();
        // IF USER ONLY HAS ONE AUTHORIZED LOCATION, ACTIVATE THAT ONE
      } else if (this.locationState.userLocations.length === 1) {
        this.onActivateLocation(this.locationState.userLocations[0]);
      }
    }
  }

  setNavSpacer(state?: boolean) {

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

  // GET AND STORE A POPULATED LIST OF THIS LOCATION'S INVENTORIES
  private _onGetPopulatedInventories() {
    this._locationService.getPopulatedInventories(this.initLocInventories);
    this.initLocInventories = false;
  }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  onActivateLocation(activeLocation: Location) {
    this._locationService.activateLocation(activeLocation);
  }

  onLogout() {
    this._store.dispatch(UserActions.logout());
  }

  onThemeModeSwitched($event: any) {
    let theme = $event.checked ? 'theme-dark' : 'theme-light';
    this._themeService.switchThemeMode(theme);
  }

  onGetBusiness() {
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
      this._store.dispatch(
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
      this._store.dispatch(
        BusinessActions.GETBusinessStart({
          ownerId: this.user.userId,
        })
      );
    } else {
      console.error('||| checkBusiness error |||');
      this._store.dispatch(
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
    this._userStoreSub.unsubscribe();
    this._businessStoreSub.unsubscribe();
    this._locationStoreSub.unsubscribe();
    this._themeSub.unsubscribe();
  }
}
