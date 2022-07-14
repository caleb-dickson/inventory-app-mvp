import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly themeStatus = new BehaviorSubject<string>('theme-dark');

  constructor() {}

  setThemeMode() {
    const guestUserData = { themePref: 'theme-dark' };
    localStorage.setItem('guestUserData', JSON.stringify(guestUserData));
  }

  getThemeMode() {
    const guestUserData: {
      themePref: string;
    } = JSON.parse(localStorage.getItem('guestUserData'));

    const userProfileData = JSON.parse(localStorage.getItem('userProfileData'));

    if (guestUserData) {
      this.themeStatus.next(guestUserData.themePref);
      console.log('||| Theme data found in guestUserData |||');
    } else if (userProfileData) {
      this.themeStatus.next(userProfileData.userProfile.themePref)
      console.warn('||| Theme data found in userProfileData |||');

    } else {
      console.log('||| No theme data found in localstorage |||');
    }
  }

  switchThemeMode(theme: string) {
    this.themeStatus.next(theme);
    const guestUserData = {
      themePref: theme,
    };
    localStorage.setItem('guestUserData', JSON.stringify(guestUserData));
  }
}
