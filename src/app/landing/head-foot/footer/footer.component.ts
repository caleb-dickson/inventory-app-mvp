import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../app-store/app.reducer';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  isAuthenticated = false;
  userEmail: string;
  private userAuthSub: Subscription;

  constructor(
    private store: Store<fromAppStore.AppState>
  ) {}

  ngOnInit(): void {
    this.userAuthSub = this.store
      .select('user')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.isAuthenticated = !!user;
        if (this.isAuthenticated) {
          this.userEmail = user.email;
        }
      });
  }

}
