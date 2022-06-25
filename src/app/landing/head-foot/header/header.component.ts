import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../app-store/app.reducer';
import * as UserActions from '../../../users/user-store/user.actions';

import { UserService } from '../../../users/user-control/user.service';
import { ThemeService } from 'src/app/app-control/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  themeMode: string;
  themeConditional = "themeMode == 'theme-dark' ? 'mode-color' : null";

  navbarCollapsed = true;

  isAuthenticated = false;
  userEmail: string;
  displayName: string;
  private userAuthSub: Subscription;
  private themeSub: Subscription;

  constructor(
    private themeService: ThemeService,
    private userService: UserService,
    private store: Store<fromAppStore.AppState>
    ) {}

    ngOnInit() {
      this.userAuthSub = this.store
      .select('user')
      .pipe(map((authState) => authState.user))
      .subscribe((userAuth) => {
        this.isAuthenticated = !!userAuth;
        if (this.isAuthenticated) {
          this.displayName = userAuth.userProfile.firstName + ' ' + userAuth.userProfile.lastName;
          this.userEmail = userAuth.email;
        }
      });
      this.themeSub = this.themeService.themeStatus.subscribe((themeModeData) => {
        this.themeMode = themeModeData ;
      });
      this.themeService.getThemeMode();
    }

    onThemeModeSwitched($event: any) {
      const checked = $event.checked;
      this.themeService.switchThemeMode(checked);
    }

    getTheme() {
      return this.themeMode  == 'theme-dark' ? 'mode-color' : null
    }

    onOpenAuth(mode: string) {
      this.userService.openAuthForm(mode);
    }

    toggleCollapsedHeader() {
      this.navbarCollapsed = !this.navbarCollapsed;
    }

    onLogout() {
      this.store.dispatch(UserActions.logout());
      this.userAuthSub.unsubscribe();
    }

}
