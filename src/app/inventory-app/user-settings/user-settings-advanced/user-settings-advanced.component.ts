import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../app-store/app.reducer';
import * as UserActions from '../../../users/user-store/user.actions';

@Component({
  selector: 'app-user-settings-advanced',
  templateUrl: './user-settings-advanced.component.html',
  styleUrls: ['./user-settings-advanced.component.scss'],
})
export class UserSettingsAdvancedComponent implements OnInit {
  init = true;
  loading = false;

  timer: any;
  countInterval: any;
  countdown = 5;

  goodbyeTimer: any;
  goodbyeMessage: string = null;

  constructor(
    private _dialog: MatDialog,
    private _store: Store<fromAppStore.AppState>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  ngOnInit(): void {
    console.log(this.data)
  }

  nextStep() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.init = !this.init;
    }, 1000);
  }

  cancel() {
    this.loading = false;
    this.undo();
    this._dialog.closeAll();
  }


  confirm() {
    this.loading = true;
    this.countInterval = setInterval(() => {
        this.countdown >= 1 ? this.countdown-- : null;
    }, 1000);

    this.goodbyeTimer = setTimeout(() => {
      this.goodbyeMessage = 'Thank you for using Inventory. Goodbye!';
    }, 5000)

    this.timer = setTimeout(() => {
      this.loading = false;
      this.goodbyeMessage = null;
      clearInterval(this.countInterval);
      this._store.dispatch(UserActions.DELETEUserStart({ userId: this.data }));
      console.log('USER DELETED');
      this.undo();
    }, 8000);
  }

  undo() {
    console.log('Delete CANCELED')
    this.loading = false;
    this.countdown = 5;
    this.goodbyeMessage = null;
    clearInterval(this.countInterval);
    clearTimeout(this.goodbyeTimer);
    clearTimeout(this.timer);
  }

}
