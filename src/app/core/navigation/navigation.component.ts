import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as AuthActions from '../../auth/auth-store/auth.actions';
import * as BusinessActions from '../business/business-store/business.actions';
import * as LocationActions from '../business/location/location-store/location.actions';

import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { User } from 'src/app/auth/auth-control/user.model';

import { ThemeService } from 'src/app/theme.service';
import {
  Business,
  LocationIds,
} from '../business/business-control/business.model';
import {
  InventoryIds,
  Location,
  Manager,
  Staff,
} from '../business/business-control/location.model';
import { Inventory } from '../business/business-control/inventory.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  private userAuthSub: Subscription;
  private businessStoreSub: Subscription;
  private locationStoreSub: Subscription;
  private themeSub: Subscription;

  themeMode: string;
  sideNavOpen: boolean;

  isAuthenticated: boolean;
  user: User;
  userRole: string;

  businessState: any;
  businessName: string;
  businessId: string;
  singleBizLocationName: string;
  multiBizLocations: Location[];

  locationState: any;
  singleUserLocationName: string;
  multiUserLocations: Location[];

  activatedLocation: Location;

  manageIcon: string;
  manageRoute: string;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private themeService: ThemeService,
    private store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit() {
    console.log(this.activatedLocation);

    this.userAuthSub = this.store
      .select('auth')
      .pipe(map((authState) => authState.userAuth))
      .subscribe((user) => {
        console.log(user);
        this.isAuthenticated = !!user;
        if (this.isAuthenticated) {
          this.user = user;
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
        console.log(this.userRole);
      });

    if (this.userRole === 'owner') {
      this.checkBusiness();
    } else {
      this.getLocations();
    }

    this.locationStoreSub = this.store
      .select('location')
      .subscribe((locState) => {
        console.log(locState);
        this.locationState = locState;

        this.multiUserLocations =
          this.locationState.userLocations.length > 1
            ? this.locationState.userLocations
            : null;

        this.singleUserLocationName =
          this.locationState.userLocations.length === 1
            ? this.locationState.userLocations[0].locationName
            : null;

        console.log(this.locationState.activeLocation);
      });

    this.businessStoreSub = this.store
      .select('business')
      .subscribe((bizState) => {
        console.log(bizState);
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

    this.themeSub = this.themeService.themeStatus.subscribe((themeModeData) => {
      this.themeMode = themeModeData;
    });
    this.themeService.getThemeMode();

    if (this.userRole === 'owner') {
      this.manageRoute = '/app/business';
    } else if (this.userRole === 'manager') {
      this.manageRoute = '/app/location';
    } else {
      this.manageRoute = null;
    }

    this.manageIcon = this.userRole === 'owner' ? 'business' : 'store';

    this.isHandset$.subscribe((state) => {
      this.sideNavOpen = !state;
    });

    if (this.userRole === 'owner') {
      if (this.multiBizLocations) {
        this.getActivatedLocation();
      } else if (this.singleBizLocationName) {
        this.onActivateLocation(this.businessState.businessLocations[0]);
      }
    } else if (this.userRole === 'manager') {
      // IF MANAGER HAS MULTIPLE AUTHORIZED LOCATIONS CHECK
      // IN LOCALSTORAGE WHICH IS ACTIVE
      if (this.locationState.userLocations.length > 1) {
        this.getActivatedLocation();
        // IF USER ONLY HAS ONE AUTHORIZED LOCATION, ACTIVATE THAT ONE
      } else if (this.locationState.userLocations.length === 1) {
        this.onActivateLocation(this.locationState.userLocations[0]);
      }
    }
  }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }





  onActivateLocation(activatedLocation: Location) {
    if (!activatedLocation) {
      return;
    }

    this.store.dispatch(
      LocationActions.ActivateLocation({
        location: activatedLocation,
      })
    );
    localStorage.setItem(
      'activatedLocation',
      JSON.stringify(activatedLocation)
    );

    this.router.navigate(['/app/location']);
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
      this.getLocations();
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

  getLocations() {
    if (this.userRole === 'owner') {
      const locations: [
        {
          _id: string | null;
          locationName: string;
          parentBusiness: string;
          managers: Manager[] | null;
          staff: Staff[] | null;
          inventoryData: InventoryIds[] | Inventory[] | null;
        }
      ] = JSON.parse(localStorage.getItem('locations'));

      const activatedLocation: Location = JSON.parse(
        localStorage.getItem('activatedLocation')
      );

      const storedBusiness: {
        business: {
          _id: string | null;
          businessName: string;
          ownerId: string;
          locations: Location[] | LocationIds[] | [] | null;
        };
      } = JSON.parse(localStorage.getItem('storedBusiness'));

      if (locations) {
        console.log(locations);
        this.store.dispatch(
          BusinessActions.GETBusinessLocationsSuccess({
            locations: locations,
          })
        );
        console.log('||| locations fetched from local storage |||');
      } else if (!locations) {
        console.log('||| getting locations from DB |||');
        console.log(storedBusiness);
        this.store.dispatch(
          BusinessActions.GETBusinessLocationsStart({
            businessId: storedBusiness.business._id,
          })
        );
      } else {
        this.store.dispatch(
          BusinessActions.BusinessError({ errorMessage: 'No locations found.' })
        );
      }
    } else if (this.userRole !== 'owner') {
      const userLocations: [
        {
          _id: string | null;
          locationName: string;
          parentBusiness: string;
          managers: Manager[] | null;
          staff: Staff[] | null;
          inventoryData: InventoryIds[] | Inventory[] | null;
        }
      ] = JSON.parse(localStorage.getItem('userLocations'));

      if (userLocations) {
        console.log(userLocations);
        this.store.dispatch(
          LocationActions.GETUserLocationsSuccess({
            locations: userLocations,
          })
        );
        console.log('||| userLocations fetched from local storage |||');
      } else if (!userLocations) {
        console.log('||| getting userLocations from DB |||');
        console.log(this.user.userId);
        this.store.dispatch(
          LocationActions.GETUserLocationsStart({
            userId: this.user.userId,
            userRole: this.user.userProfile.role,
          })
        );
      } else {
        this.store.dispatch(
          LocationActions.LocationError({
            errorMessage: 'No user locations found.',
          })
        );
      }
    }
  }

  getActivatedLocation() {
    const activatedLocation: Location = JSON.parse(
      localStorage.getItem('activatedLocation')
    );

    if (activatedLocation) {
      console.log('||| Found an active location |||');
      this.store.dispatch(
        LocationActions.ActivateLocation({
          location: activatedLocation,
        })
      );
      this.activatedLocation = this.locationState.activeLocation;
    } else {
      console.log('||| No active location found. |||');
    }
  }

  ngOnDestroy(): void {
    this.userAuthSub.unsubscribe();
    this.businessStoreSub.unsubscribe();
    this.locationStoreSub.unsubscribe();
    this.themeSub.unsubscribe();
  }
}
