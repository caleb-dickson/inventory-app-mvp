import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../app-store/app.reducer';
import * as BusinessActions from '../business-store/business.actions';

import { environment } from 'src/environments/environment';

import { Business } from './business.model';
import { Location } from './location.model';
import { catchError, map, of } from 'rxjs';

const BACKEND_URL = environment.apiUrl + '/business';

const handleError = (errorRes: HttpErrorResponse) => {
  console.log(errorRes)
  let errorMessage = errorRes.error.message;

  if (!errorRes.error.message) {
    console.log(errorRes);
    errorMessage =
      'Error: ' +
      errorRes.status +
      ' - ' +
      errorRes.statusText +
      'An unknown error has occurred.';
    return of(BusinessActions.APICallFail({ errorMessage }));
  }

  console.log(errorMessage);
  return of(BusinessActions.APICallFail({ errorMessage }));
}

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  constructor(
    private http: HttpClient,
    private store: Store<fromAppStore.AppState>
  ) {}

  addLocationManagers(emails: any, locationId: string) {
    console.log(emails, locationId);
    this.http
      .put<{ updatedBusiness: Business }>(BACKEND_URL + '/add-managers', {
        managerEmails: emails,
        locationId: locationId,
      })
      .pipe(
        map((resData) => {
          console.log(resData);
          if (resData && resData.updatedBusiness) {
            this.store.dispatch(
              BusinessActions.GETBusinessSuccess({
                business: resData.updatedBusiness,
              })
            );
          }
        }),
        catchError((errorRes) => {
          console.log(errorRes);
          return handleError(errorRes);
        })
      )
      .subscribe((resData) => console.log(resData));
  }

  // fetchBusinessLocations(businessId: string) {
  //   console.log('||| businessId: ===>>>' + businessId);
  //   this.http.get<{ fetchedLocations: Location[] }>(
  //     BACKEND_URL + '/fetch-locations/' + businessId
  //   )
  //   .subscribe(resData => {
  //     console.log(resData);
  //     if (resData && resData.fetchedLocations) {
  //       const locations = resData.fetchedLocations;
  //       localStorage.setItem('locations', JSON.stringify(locations));
  //     }
  //   })
  // }

  // fetchUserLocations(userId: string) {}
}
