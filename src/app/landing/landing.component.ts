import { Component, OnInit /* Inject, Renderer2 */ } from '@angular/core';
// import { DOCUMENT } from '@angular/common';

import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../app-store/app.reducer';
import * as UserActions from '../users/user-store/user.actions';
import * as NotificationsActions from '../notifications/notifications-store/notifications.actions';

import { UserService } from '../users/user-control/user.service';
import { ThemeService } from '../app-control/theme.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  private _userSub: Subscription;
  private _themeSub: Subscription;

  themeMode: string;

  isAuthenticated = false;
  displayName: string;
  error: string;
  userLoading: boolean;

  showPreviewReminder = true;

  constructor(
    // @Inject(DOCUMENT) private document: Document,
    // private renderer: Renderer2,
    private _userService: UserService,
    private _themeService: ThemeService,
    private _store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit() {
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

    if (this.showPreviewReminder && !this.isAuthenticated) {
      this._store.dispatch(
        NotificationsActions.showConfirmMessage({
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

  showMessage(message: string) {
    this._store.dispatch(
      NotificationsActions.showConfirmMessage({
        message: message,
        notificationAction: 'Close',
        duration: 1250,
      })
    );
  }

  onOpenAuth(mode: string) {
    this._store.dispatch(NotificationsActions.hideSnackBar());
    this._store.dispatch(UserActions.logout());
    this._userService.openAuthForm(mode);
  }

  onOpenPreview() {
    this._userService.openPreviewSelect();
  }

  onConsultSubmit(consultationForm: NgForm) {}
}
