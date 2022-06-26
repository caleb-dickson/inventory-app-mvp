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
import { TitleCasePipe } from '@angular/common';

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

    if (this.showPreviewReminder && !this.isAuthenticated) {
      this.store.dispatch(
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
    this.store.dispatch(
      NotificationsActions.showConfirmMessage({
        message: message,
        notificationAction: 'Close',
        duration: 1250,
      })
    );
  }

  onOpenAuth(mode: string) {
    this.userService.openAuthForm(mode);
  }

  onOpenPreview() {
    this.userService.openPreviewSelect();
  }

  onConsultSubmit(consultationForm: NgForm) {}
}
