import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../app-store/app.reducer';
import * as LocationActions from './location.actions';

import {
  switchMap,
  map,
  of,
  concatMap,
  catchError,
  tap,
  Subscription,
  // withLatestFrom,
} from 'rxjs';

import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/location';

const handleError = (errorRes: HttpErrorResponse) => {
  console.log(errorRes);
  let errorMessage = errorRes.error.message;

  if (!errorRes.error.message) {
    console.log(errorRes);
    errorMessage =
      'Error: ' +
      errorRes.status +
      ' - ' +
      errorRes.statusText +
      'An unknown error has occurred.';
    return of(LocationActions.LocationError({ errorMessage }));
  }

  console.log(errorMessage);
  return of(LocationActions.LocationError({ errorMessage }));
};

@Injectable()
export class LocationEffects {





  

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<fromAppStore.AppState>
  ) {}
}
