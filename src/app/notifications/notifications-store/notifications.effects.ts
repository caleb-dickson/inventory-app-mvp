import { Injectable } from '@angular/core';

import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as fromAppStore from '../../app-store/app.reducer';
import * as NotificationsActions from './notifications.actions';

import { of } from 'rxjs';
import {
  catchError,
  concatMap,
  exhaustMap,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { SimpleNotificationComponent } from '../simple-notification.component';

@Injectable()
export class NotificationsEffects {
  showTimeMessage$ = createEffect(() =>
    this._actions$.pipe(
      ofType(NotificationsActions.showTimeMessage),
      map((action) => {
        this._snackBar.open(action.message, null, {
          duration: action.duration,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar']
        });

        return { type: 'Action Dispatched' };
      })
    )
  );

  showConfirmMessage$ = createEffect(() =>
    this._actions$.pipe(
      ofType(NotificationsActions.showConfirmMessage),
      map((action) => {
        this._snackBar.open(action.message, action.notificationAction, {
          duration: action.duration,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar']
        });

        return { type: 'Action Dispatched' };
      })
    )
  );

  constructor(
    private _actions$: Actions,
    private _snackBar: MatSnackBar,
    private store: Store<fromAppStore.AppState>
  ) {}
}
