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
    ) {
  }

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
      formData.append('_id', null);
      formData.append('businessName', businessForm.value.businessName);
      formData.append('ownerId', user._id);
      if (bizPhotoUpload) {
        formData.append(
          'businessPhoto',
          businessForm.value.businessPhoto,
          businessForm.value.businessName
        );
      }
      formData.append('locations', null);

      this._store.dispatch(BusinessActions.POSTBusinessStart());

      this.http
        .post<{
          message: string;
          business: Business;
          businessId: string;
          updatedUser: User;
          updatedUserId: string;
        }>(BACKEND_URL + '/create-business', formData)
        .pipe(
          map((resData) => {
            console.log(resData);
            if (resData.business) {
              const storedBusiness = {
                business: {
                  _id: resData.businessId,
                  businessName: resData.business.businessName,
                  ownerId: resData.business.ownerId,
                  locations: resData.business.locations,
                },
              };

              localStorage.setItem(
                'storedBusiness',
                JSON.stringify(storedBusiness)
              );
            }

            const userProfileData = {
              userId: resData.updatedUserId,
              email: resData.updatedUser.email,
              userProfile: resData.updatedUser.userProfile,
            };
            localStorage.setItem(
              'userProfileData',
              JSON.stringify(userProfileData)
            );

            this._store.dispatch(
              authSuccess({
                user: {
                  _id: resData.updatedUserId,
                  userId: resData.updatedUserId,
                  email: resData.updatedUser.email,
                  password: resData.updatedUser.password,
                  userProfile: resData.updatedUser.userProfile,
                },
              })
            );

            this._store.dispatch(
              BusinessActions.POSTBusinessSuccess({
                business: {
                  _id: resData.businessId,
                  businessName: resData.business.businessName,
                  ownerId: resData.business.ownerId,
                  businessPhoto: resData.business.businessPhoto,
                  locations: [],
                },
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
      formData.append('businessName', businessForm.value.businessName);
      formData.append('ownerId', user._id);
      if (bizPhotoUpload) {
        formData.append(
          'businessPhoto',
          businessForm.value.businessPhoto,
          businessForm.value.businessName + '_photo'
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
