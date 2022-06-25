import { Component, OnInit /* Inject, Renderer2 */ } from '@angular/core';
// import { DOCUMENT } from '@angular/common';

import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../app-store/app.reducer';
import * as UserActions from '../users/user-store/user.actions';

import { UserService } from '../users/user-control/user.service';
import { ThemeService } from '../app-control/theme.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  themeMode: string;

  isAuthenticated = false;
  displayName: string;
  error: string;
  userLoading: boolean;

  private _userSub: Subscription;
  private _themeSub: Subscription;

  constructor(
    // @Inject(DOCUMENT) private document: Document,
    // private renderer: Renderer2,
    private userService: UserService,
    private themeService: ThemeService,
    private store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit() {
    this._userSub = this.store
      .select('user')
      .pipe(map((userState) => userState))
      .subscribe((userState) => {
        this.isAuthenticated = !!userState.user;
        this.userLoading = userState.loading;
        if (this.isAuthenticated) {
          this.displayName =
            userState.user.userProfile.firstName +
            ' ' +
            userState.user.userProfile.lastName;
        }
      });

    this._themeSub = this.themeService.themeStatus.subscribe(
      (themeModeData) => {
        this.themeMode = themeModeData;
      }
    );
    this.themeService.getThemeMode();
  }

  getTheme() {
    return this.themeMode == 'theme-dark' ? 'mode-dark' : 'mode-light';
  }

  onConsultSubmit(consultationForm: NgForm) {}

  onOpenAuth(mode: string) {
    this.userService.openAuthForm(mode);
  }

  onPreviewLogin(accType: string) {
    switch (accType) {
      case 'owner':
        this.store.dispatch(
          UserActions.loginStart({
            email: 'owner@ownerUser.com',
            password: 'testPass',
          })
        );
        break;
      case 'manager':
        this.store.dispatch(
          UserActions.loginStart({
            email: 'manager@managerUser.com',
            password: 'testPass',
          })
        );
        break;
      case 'staff':
        this.store.dispatch(
          UserActions.loginStart({
            email: 'staff@staffUser.com',
            password: 'testPass',
          })
        );
        break;
    }
  }
}
