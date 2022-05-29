import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../app-store/app.reducer';
import * as BusinessActions from '../business-store/business.actions';

import { environment } from 'src/environments/environment';

import { Business } from './business.model';

const BACKEND_URL = environment.apiUrl + '/business';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  constructor(
    private http: HttpClient,
    private store: Store<fromAppStore.AppState>
  ) {}

  addLocationManagers(emails: any, locationId: string) {
    console.log(emails)
    this.http
      .put<{ updatedBusiness: Business }>(BACKEND_URL + '/add-managers', {
        managerEmails: emails,
        locationId: locationId,
      })
      .subscribe((resData) => {
        console.log(resData);
        if (resData && resData.updatedBusiness) {
          this.store.dispatch(
            BusinessActions.GETBusinessSuccess({
              business: resData.updatedBusiness,
            })
          );
        } else {
          this.store.dispatch(
            BusinessActions.POSTEntityFail({
              errorMessage:
                '||| An unknown error has occurred |||==>>' + resData,
            })
          );
        }
      });
  }

  fetchBusinessLocations(businessId: string) {
    console.log('||| businessId: ===>>>' + businessId);
    this.http
      .get
  }

  fetchUserLocations(userId: string) {

  }

}
