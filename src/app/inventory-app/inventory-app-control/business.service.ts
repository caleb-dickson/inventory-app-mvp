import { Injectable } from '@angular/core';

import { catchError, map } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as BusinessActions from '../navigation/business/business-store/business.actions';
import { authSuccess } from '../../users/user-store/user.actions';

import { Business } from '../models/business.model';

import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/users/user.model';

import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/business';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  constructor(
    private _store: Store<fromAppStore.AppState>,
    private http: HttpClient
  ) {}

  submitBusiness(
    businessForm: FormGroup,
    businessId: string,
    businessSubmitMode: string,
    bizPhotoUpload: Blob | null,
    user: User
  ) {
    if (businessForm.invalid) {
      return;
    }
    if (businessSubmitMode === 'new') {
      businessForm.updateValueAndValidity();

      const formData = new FormData();
      formData.append('id', null);
      formData.append('name', businessForm.value.name);
      formData.append('ownerId', user.id);
      if (bizPhotoUpload) {
        formData.append(
          'businessPhoto',
          businessForm.value.businessPhoto,
          businessForm.value.name
        );
      }
      formData.append('locations', null);

      this._store.dispatch(BusinessActions.POSTBusinessStart());

      this.http
        .post<{ newBusiness: Business }>(
          BACKEND_URL + '/create-business',
          formData
        )
        .pipe(
          map((resData) => {
            console.log(resData);
            if (resData.newBusiness) {
              const storedBusiness = resData.newBusiness;

              localStorage.setItem(
                'storedBusiness',
                JSON.stringify(storedBusiness)
              );
            }

            this._store.dispatch(
              BusinessActions.POSTBusinessSuccess({
                business: resData.newBusiness,
              })
            );
          }),
          catchError((errorRes) => {
            return errorRes;
          })
        )
        .subscribe();
    } else {
      businessSubmitMode === 'update';
      businessForm.updateValueAndValidity();

      const formData = new FormData();
      formData.append('businessId', businessId);
      formData.append('name', businessForm.value.name);
      formData.append('ownerId', user.id);
      if (bizPhotoUpload) {
        formData.append(
          'businessPhoto',
          businessForm.value.businessPhoto,
          businessForm.value.name + '_photo'
        );
      }
      formData.append('locations', null);

      this._store.dispatch(BusinessActions.PUTBusinessStart());

      this.http
        .put<{
          message: string;
          updatedBusiness: Business;
          updatedBusinessId: string;
        }>(BACKEND_URL + '/update-business/', formData)
        .pipe(
          map((resData) => {
            console.log(resData);
            const storedBusiness = {
              business: resData.updatedBusiness,
            };

            localStorage.setItem(
              'storedBusiness',
              JSON.stringify(storedBusiness)
            );

            this._store.dispatch(
              BusinessActions.PUTBusinessSuccess({
                business: resData.updatedBusiness,
              })
            );
          }),
          catchError((errorRes) => {
            this._store.dispatch(
              BusinessActions.BusinessError({ errorMessage: errorRes })
            );
            return null;
          })
        )
        .subscribe();
    }
  }
}
