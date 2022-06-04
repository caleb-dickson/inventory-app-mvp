import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as AuthActions from '../../auth/auth-store/auth.actions';
import * as BusinessActions from '../business/business-store/business.actions';
import * as LocationActions from '../business/location/location-store/location.actions';
import { BusinessState } from '../business/business-store/business.reducer';
import { LocationState } from '../business/location/location-store/location.reducer';

import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { User } from 'src/app/auth/auth-control/user.model';

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

  businessState: BusinessState;
  businessName: string;
  businessId: string;
  singleBizLocationName: string;
  multiBizLocations: Location[];

  locationState: LocationState;
  singleUserLocationName: string;
  multiUserLocations: Location[];
  activatedLocation: Location;

  manageIcon: string;
  manageRoute: string;

  ngOnInit() {

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

        this.singleUserLocationName =
          this.locationState.userLocations.length === 1
            ? this.locationState.userLocations[0].locationName
            : null;
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
        this.onGetActivatedLocation();
      } else if (this.singleBizLocationName) {
        this.onActivateLocation(this.businessState.businessLocations[0]);
      }
    } else if (this.userRole === 'manager') {
      // IF MANAGER HAS MULTIPLE AUTHORIZED LOCATIONS CHECK
      // IN LOCALSTORAGE WHICH IS ACTIVE
      if (this.locationState.userLocations.length > 1) {
        this.onGetActivatedLocation();
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
    console.log(activatedLocation)
    console.log(this.locationState)
    if (!activatedLocation) {
      return;
    }

    localStorage.setItem(
      'activatedLocation',
      JSON.stringify(activatedLocation)
    );
    this.store.dispatch(
      LocationActions.ActivateLocation({
        location: activatedLocation,
      })
    );
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
    const userLocations: Location[] = JSON.parse(
      localStorage.getItem('userLocations')
    );

    const businessLocations: Location[] = JSON.parse(
      localStorage.getItem('businessLocations')
    );

    if (this.userRole === 'owner') {
      const storedBusiness: {
        business: {
          _id: string | null;
          businessName: string;
          ownerId: string;
          locations: Location[] | LocationIds[] | [] | null;
        };
      } = JSON.parse(localStorage.getItem('storedBusiness'));

      if (businessLocations) {
        console.log(businessLocations);
        console.log('||| locations fetched from local storage |||');
        this.store.dispatch(
          BusinessActions.GETBusinessLocationsSuccess({
            locations: businessLocations,
          })
        ), this.store.dispatch(
          LocationActions.GETUserLocationsSuccess({
            locations: businessLocations,
          })
        );
      } else if (!businessLocations) {
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
      if (userLocations) {
        console.log(userLocations);
        console.log('||| userLocations fetched from local storage |||');
        this.store.dispatch(
          LocationActions.GETUserLocationsSuccess({
            locations: userLocations,
          })
        );
      } else if (!userLocations) {
        console.log('||| getting userLocations from DB |||');
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

  onGetActivatedLocation() {
    const activatedLocation: Location = JSON.parse(
      localStorage.getItem('activatedLocation')
    );

    if (activatedLocation) {
      console.log(
        '||| Found active location: ' + activatedLocation.locationName + ' |||'
      );
      console.log(activatedLocation)
      this.store.dispatch(
        LocationActions.ActivateLocation({
          location: activatedLocation,
        })
      );
      this.activatedLocation = this.locationState.activeLocation;
    } else {
      console.log('||| No active location found. |||');
    }
    console.log(this.locationState.activeLocation)
  }

  ngOnDestroy(): void {
    this.userAuthSub.unsubscribe();
    this.businessStoreSub.unsubscribe();
    this.locationStoreSub.unsubscribe();
    this.themeSub.unsubscribe();
  }
}
