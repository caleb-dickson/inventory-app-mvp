import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Store } from '@ngrx/store';
import { map, Subscription } from 'rxjs';
import * as fromAppStore from '../../app-store/app.reducer';

import { UserService } from '../user-control/user.service';
import { ThemeService } from '../../theme/theme.service';

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
    private userService: UserService,
    private themeService: ThemeService,
    private store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit() {
    this.userAuthSub = this.store
      .select('user')
      .pipe(map((authState) => authState.user))
      .subscribe((userAuth) => {
        this.isAuthenticated = !!userAuth;
      });

    this.themeSub = this.themeService.themeStatus.subscribe((themeModeData) => {
      this.themeMode = themeModeData;
    });
    this.themeService.getThemeMode();
  }

  onOpenAuth(mode: string) {
    this.userService.openAuthForm(mode);
  }

  ngOnDestroy() {
    this.userAuthSub.unsubscribe();
  }
}
