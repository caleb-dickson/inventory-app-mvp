import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../app-store/app.reducer';
import * as UserActions from '../users/user-store/user.actions';
import * as NotificationsActions from '../notifications/notifications-store/notifications.actions';

import { UserService } from '../users/user-control/user.service';
import { ThemeService } from '../theme/theme.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  private _userSub: Subscription;
  private _themeSub: Subscription;
  private _passResetRouteSub: Subscription;

  themeMode: string;
  passResetMode = false;

  isAuthenticated = false;
  displayName: string;
  error: string;
  userLoading: boolean;

  showPreviewReminder = true;

  lastUpdate: Date;
  version: string;

  constructor(
    private _route: ActivatedRoute,
    private _dialog: MatDialog,
    private _userService: UserService,
    private _themeService: ThemeService,
    private _store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit() {
    this.lastUpdate = environment.lastUpdate;
    this.version = environment.version;

    this._userSub = this._store
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

    this._themeSub = this._themeService.themeStatus.subscribe(
      (themeModeData) => {
        this.themeMode = themeModeData;
      }
    );
    this._themeService.getThemeMode();

    console.log(this._route);
    this._passResetRouteSub = this._route.params.subscribe((param) => {
      console.log(param.token);
      if (param.token) {
        this.passResetMode = true;
        this._userService.passReset(param.token);
      }
    });

    if (this.showPreviewReminder && !this.isAuthenticated && !this.passResetMode) {
      this._store.dispatch(
        NotificationsActions.showMessage({
          message: "Welcome to Inventory. Don't forget to preview the App!",
          notificationAction: 'Close',
          duration: 5000,
        })
      );
    }

  }

  getTheme() {
    return this.themeMode == 'theme-dark' ? 'mode-dark' : 'mode-light';
  }

  onOpenAuth(mode: string) {
    this._store.dispatch(UserActions.logout());
    this._userService.openAuthForm(mode);
  }

  onOpenPreview() {
    this._userService.openPreviewSelect();
  }

  onConsultSubmit(consultationForm: NgForm) {}
}
