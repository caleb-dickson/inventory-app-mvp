import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly themeStatus = new Subject<string>();

  constructor() {}


  setThemeMode() {
    const guestUserData: {
      themePref: string;
    } = JSON.parse(localStorage.getItem('guestUserData'));
    if (!guestUserData) {
      const guestUserData = {
        themePref: 'theme-dark',
      };
      localStorage.setItem('guestUserData', JSON.stringify(guestUserData));
    }
  }

  getThemeMode() {
    const guestUserData: {
      themePref: string;
    } = JSON.parse(localStorage.getItem('guestUserData'));
    if (guestUserData) {
      this.themeStatus.next(guestUserData.themePref);
    } else {
      return;
    }
  }

  switchThemeMode(checked: boolean) {
    const themeMode = checked ? 'theme-dark' : 'theme-light';
    this.themeStatus.next(themeMode);
    const guestUserData = {
      themePref: themeMode,
    };
    localStorage.setItem('guestUserData', JSON.stringify(guestUserData));
  }
}
