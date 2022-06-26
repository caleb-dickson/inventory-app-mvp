import { Component, OnInit } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import { User } from 'src/app/users/user-control/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private breakpointObserver: BreakpointObserver,
    private _store: Store<fromAppStore.AppState>
  ) {}

  private _userStoreSub: Subscription;
  private _businessStoreSub: Subscription;
  private _locationStoreSub: Subscription;

  user: User;
  userRole: string;
  userDept: string;
  userLoading: boolean;

  ngOnInit(): void {
    // console.clear();

    this._userStoreSub = this._store.select('user').subscribe((userState) => {
      this.user = userState.user;
      this.userLoading = userState.loading;

      if (userState.user) {
        switch (userState.user.userProfile.role) {
          case 3:
            this.userRole = 'owner';
            break;
          case 2:
            this.userRole = 'manager';
            break;
          case 1:
            this.userRole = 'staff';
            break;
        }
      }
    });
  }

  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Inventory Values', cols: 2, rows: 1 },
          { title: 'Products', cols: 2, rows: 1 },
          { title: 'Tasks', cols: 2, rows: 1 },
          { title: 'Drafts Pending', cols: 2, rows: 1 },
        ];
      }

      return [
        { title: 'Inventory Values by Location', cols: 2, rows: 1 },
        { title: 'Products', cols: 1, rows: 1 },
        { title: 'Tasks', cols: 1, rows: 2 },
        { title: 'Drafts Pending', cols: 1, rows: 1 },
      ];
    })
  );
}
