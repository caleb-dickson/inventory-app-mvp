import { Component, OnInit, /* Inject, Renderer2 */ } from '@angular/core';
// import { DOCUMENT } from '@angular/common';

import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../app-store/app.reducer';

import { UserService } from '../users/user-control/user.service';
import { ThemeService } from '../theme.service';
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
      .pipe(map((authState) => authState.user))
      .subscribe((userAuth) => {
        this.isAuthenticated = !!userAuth;
        if (this.isAuthenticated) {
          this.displayName = userAuth.userProfile.firstName + ' ' + userAuth.userProfile.lastName;
        }
      });

    this._themeSub = this.themeService.themeStatus.subscribe((themeModeData) => {
      this.themeMode = themeModeData;
    });
    this.themeService.getThemeMode();
  }

  getTheme() {
    return this.themeMode  == 'theme-dark' ? 'mode-dark' : 'mode-light'
  }

  onConsultSubmit(consultationForm: NgForm) {

  }

  onOpenAuth(mode: string) {
    this.userService.openAuthForm(mode);
  }
}
