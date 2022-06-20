import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';

import { Store } from '@ngrx/store';
import { map, Subscription } from 'rxjs';
import * as fromAppStore from './app-store/app.reducer';
import * as AuthActions from './users/user-store/user.actions';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  themeMode: string;

  isAuthenticated = false;

  private userAuthSub: Subscription;
  private themeSub: Subscription;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private themeService: ThemeService,
    private store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit() {
    this.store.dispatch(AuthActions.autoLogin());

    this.userAuthSub = this.store
      .select('user')
      .pipe(map((authState) => authState.userAuth))
      .subscribe((userAuth) => {
        this.isAuthenticated = !!userAuth;
      });

    this.themeSub = this.themeService.themeStatus.subscribe((themeStatus) => {
      this.themeMode = themeStatus;
      this.renderer.setAttribute(this.document.body, 'class', themeStatus);
    });


    if (!this.isAuthenticated) {
      this.themeService.setThemeMode();
      this.themeService.getThemeMode();
      if (this.themeMode == 'theme-light') {
        this.themeService.switchThemeMode(false);
        this.renderer.setAttribute(this.document.body, 'class', this.themeMode);
      } else {
        this.themeService.switchThemeMode(true);
        this.renderer.setAttribute(this.document.body, 'class', this.themeMode);
      }
    }
  }

  ngOnDestroy() {
    this.userAuthSub.unsubscribe();
    this.themeSub.unsubscribe();
  }
}
