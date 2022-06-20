import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as AuthActions from '../../users/user-store/user.actions';
import * as BusinessActions from '../business/business-store/business.actions';
import * as LocationActions from '../business/location/location-store/location.actions';
import { BusinessState } from '../business/business-store/business.reducer';
import { LocationState } from '../business/location/location-store/location.reducer';

import { Observable, Subscription } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';

import { User } from 'src/app/users/user-control/user.model';

import { ThemeService } from 'src/app/theme.service';
import {
  Business,
  LocationIds,
} from '../business/business-control/business.model';
import { Location } from '../business/business-control/location.model';
import { LocationService } from '../business/location/location-control/location.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  constructor(
    private breakpointObserver: BreakpointObserver,
    private themeService: ThemeService,
    private locationService: LocationService,
    private store: Store<fromAppStore.AppState>
  ) {}

  private userAuthSub: Subscription;
  private businessStoreSub: Subscription;
  private locationStoreSub: Subscription;
  private themeSub: Subscription;

  themeMode: string;
  sideNavOpen: boolean;

  isAuthenticated: boolean;
  user: User;
  userRole: string;
  userDept: string;

  businessState: BusinessState;
  businessName: string;
  businessId: string;
  singleBizLocationName: string;
  multiBizLocations: Location[];

  locationState: LocationState;
  singleUserLocation: Location;
  singleUserLocationName: string;
  multiUserLocations: Location[];
  activatedLocation: Location;

  manageIcon: string;
  manageRoute: string;

  ngOnInit() {
    console.clear();
    this.userAuthSub = this.store
      .select('user')
      .pipe(map((authState) => authState.userAuth))
      .subscribe((user) => {
        console.log(user);
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
      this.checkBusiness();
    } else {
      this.onGetLocations();
    }

    this.locationStoreSub = this.store
      .select('location')
      .subscribe((locState) => {
        this.locationState = locState;

        this.multiUserLocations =
          this.locationState.userLocations.length > 1
            ? this.locationState.userLocations
            : null;

        this.singleUserLocation =
        this.locationState.userLocations.length === 1
          ? this.locationState.userLocations[0]
          : null;

        this.singleUserLocationName =
          this.locationState.userLocations.length === 1
            ? this.locationState.userLocations[0].locationName
            : null;

        this.activatedLocation = locState.activeLocation;
      });

    this.businessStoreSub = this.store
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
        // console.log(bizState)
      });

    this.themeSub = this.themeService.themeStatus.subscribe((themeModeData) => {
      this.themeMode = themeModeData;
    });
    this.themeService.getThemeMode();

    if (this.userRole === 'owner' || this.userDept === 'admin') {
      this.manageRoute = '/app/business';
    } else if (this.userRole === 'manager') {
      this.manageRoute = '/app/location';
    } else {
      this.manageRoute = null;
    }

    this.manageIcon = this.userRole === 'owner' || this.userDept === 'admin' ? 'business' : 'store';

    this.isHandset$.subscribe((state) => {
      this.sideNavOpen = !state;
    });

    // if (this.userRole !== 'owner') {
    //   if (this.multiUserLocations) {
    //     this.locationService.getActivatedLocation();
    //   } else if (this.singleUserLocationName) {
    //     this.onActivateLocation(this.singleUserLocation)
    //   }
    // }

    if (this.userRole === 'owner') {
      if (this.multiBizLocations) {
        this.locationService.getActivatedLocation();
      } else if (this.singleBizLocationName) {
        console.log(this.singleBizLocationName)
        this.onActivateLocation(this.businessState.businessLocations[0]);
      }
    } else {
      // IF MANAGER HAS MULTIPLE AUTHORIZED LOCATIONS CHECK
      // IN LOCALSTORAGE WHICH IS ACTIVE
      if (this.locationState.userLocations.length > 1) {
        this.locationService.getActivatedLocation();
        // IF USER ONLY HAS ONE AUTHORIZED LOCATION, ACTIVATE THAT ONE
      } else if (this.locationState.userLocations.length === 1) {
        console.log('got')
        this.onActivateLocation(this.locationState.userLocations[0]);
      }
    }
  }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  onActivateLocation(activatedLocation: Location) {
    console.log(activatedLocation);
    console.log(this.activatedLocation);

    this.locationService.activateLocation(activatedLocation);
  }

  onLogout() {
    this.store.dispatch(AuthActions.logout());
  }

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  onThemeModeSwitched($event: any) {
    this.themeService.switchThemeMode($event.checked);
  }

  checkBusiness() {
    const storedBusiness: {
      business: Business;
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
      this.onGetLocations();
    } else if (!storedBusiness) {
      console.log('||| Fetching business from DB |||');
      this.store.dispatch(
        BusinessActions.GETBusinessStart({
          ownerId: this.user.userId,
        })
      );
    } else {
      console.log('||| checkBusiness error |||');
      this.store.dispatch(
        BusinessActions.BusinessError({ errorMessage: 'No business found.' })
      );
    }
  }

  onGetLocations() {
    this.locationService.getLocations(
      this.user.userId,
      this.userRole,
      this.user.userProfile.role
    );
  }

  ngOnDestroy(): void {
    this.userAuthSub.unsubscribe();
    this.businessStoreSub.unsubscribe();
    this.locationStoreSub.unsubscribe();
    this.themeSub.unsubscribe();
  }
}
