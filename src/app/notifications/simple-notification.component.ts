import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../app-store/app.reducer';

@Component({
  selector: 'app-simple-notification',
  template: `
  <html class="theme">
    <span class="message"> {{ message }} </span>
</html>
  `,
  styles: [
    `
    .message {
      margin-inline-start: 6.2rem;
      color: #d6d6d7;
    }
    * {
      background-color: #1c2120;
      padding-top: -2rem;
    }
    `
  ]
})
export class SimpleNotificationComponent implements OnInit {

  constructor(private _store: Store<fromAppStore.AppState>) { }

  private _notificationSub: Subscription;

  message: string

  ngOnInit() {
    this._notificationSub = this._store
      .select('notification')
      .subscribe(notificationsState => {
        this.message = notificationsState.message;
      })
  }

}
