import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as AuthActions from '../../auth/auth-store/auth.actions';
import * as BusinessActions from '../business/business-store/business.actions';

import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { User } from 'src/app/auth/auth-control/user.model';

import { AuthService } from '../../auth/auth-control/auth.service';
import { ThemeService } from 'src/app/theme.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  private userAuthSub: Subscription;
  private themeSub: Subscription;
  private businessStoreSub: Subscription;

  themeMode: string;
  sideNavOpen: boolean;

  isAuthenticated: boolean;
  user: User;

  businessState: any;
  businessName: string;
  businessId: string;

  manageIcon: string;
  manageRoute: string;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private themeService: ThemeService,
    private store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit() {
    this.userAuthSub = this.store
      .select('auth')
      .pipe(map((authState) => authState.userAuth))
      .subscribe((user) => {
        this.isAuthenticated = !!user;
        console.log(user);
        if (this.isAuthenticated) {
          this.user = user;
        }
      });

      this.checkBusiness();

      this.businessStoreSub = this.store
      .select('business')
      .pipe(map((bizState) => bizState))
      .subscribe((bizState) => {
        this.businessState = bizState;
        if (bizState.business && bizState.business._id) {
          this.businessName = bizState.business.businessName;
          this.businessId = bizState.business._id;
        }
        console.log(bizState);
      });

    this.themeSub = this.themeService.themeStatus.subscribe((themeModeData) => {
      this.themeMode = themeModeData;
    });
    this.themeService.getThemeMode();

    this.manageIcon = this.user.userProfile.role === 3 ? 'business' : 'store';
    this.manageRoute =
      this.user.userProfile.role === 3 ? '/app/business' : '/app/location';

    this.isHandset$.subscribe((state) => {
        this.sideNavOpen = !state;
    })
  }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  onOpenAuth(mode: string) {
    this.authService.openAuthForm(mode);
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
    } else if (!storedBusiness) {
      console.log('||| Fetching business from DB |||');
      console.log(this.user.userId)
      this.store.dispatch(
        BusinessActions.GETBusinessStart({
          ownerId: this.user.userId,
        })
      );
    } else {
      this.store.dispatch(BusinessActions.GETEntityFail({ errorMessage: 'No business found.'}))
    }
  }

  ngOnDestroy(): void {
    this.userAuthSub.unsubscribe();
    this.themeSub.unsubscribe();
  }
}
