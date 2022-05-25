import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Store } from '@ngrx/store';
import { map, Subscription } from 'rxjs';
import * as fromAppStore from '../app-store/app.reducer';

import { AuthService } from '../auth/auth-control/auth.service';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {
  themeMode: string;

  isAuthenticated = false;

  private userAuthSub: Subscription;
  private themeSub: Subscription;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit() {
    this.userAuthSub = this.store
      .select('auth')
      .pipe(map((authState) => authState.userAuth))
      .subscribe((userAuth) => {
        this.isAuthenticated = !!userAuth;
      });

    this.themeSub = this.themeService.themeStatus.subscribe((themeModeData) => {
      this.themeMode = themeModeData;
    });
    this.themeService.getThemeMode();
  }

  onOpenAuth(mode: string) {
    this.authService.openAuthForm(mode);
  }

  ngOnDestroy() {
    this.userAuthSub.unsubscribe();
  }
}
