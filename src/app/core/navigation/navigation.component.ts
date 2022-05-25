import { Component, OnInit } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as AuthActions from '../../auth/auth-store/auth.actions';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../../auth/auth-control/auth.service';
import { ThemeService } from 'src/app/theme.service';
import { User } from 'src/app/auth/auth-control/user.model';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  private userAuthSub: Subscription;
  private themeSub: Subscription;

  themeMode: string;
  sideNavOpen: boolean;

  isAuthenticated: boolean;
  user: User;

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

    this.themeSub = this.themeService.themeStatus.subscribe((themeModeData) => {
      this.themeMode = themeModeData;
    });
    this.themeService.getThemeMode();

    this.manageIcon = this.user.userProfile.role === 3 ? 'business' : 'store';
    this.manageRoute =
      this.user.userProfile.role === 3 ? '/app/business' : '/app/location';
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

  ngOnDestroy(): void {
    this.userAuthSub.unsubscribe();
    this.themeSub.unsubscribe();
  }
}
