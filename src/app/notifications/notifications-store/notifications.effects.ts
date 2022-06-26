import { Injectable } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';

import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as fromAppStore from '../../app-store/app.reducer';
import * as NotificationsActions from './notifications.actions';

import { map } from 'rxjs/operators';

@Injectable()
export class NotificationsEffects {
  constructor(
    private _actions$: Actions,
    private _snackBar: MatSnackBar,
    private store: Store<fromAppStore.AppState>
  ) {}

  showTimeMessage$ = createEffect(() =>
    this._actions$.pipe(
      ofType(NotificationsActions.showTimeMessage),
      map((action) => {
        this._snackBar.open(action.message, null, {
          duration: action.duration,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar'],
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
          panelClass: ['snackbar'],
        });

        return { type: 'Action Dispatched' };
      })
    )
  );

  hideSnackBar$ = createEffect(() =>
  this._actions$.pipe(
    ofType(NotificationsActions.hideSnackBar),
    map(() => {
      this._snackBar.dismiss();

      return { type: 'Action Dispatched' };
    })
  ))
}
