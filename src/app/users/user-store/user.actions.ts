import { createAction, props } from '@ngrx/store';

import { Location } from 'src/app/core/business/business-control/location.model';
import { User } from '../user-control/user.model';

export const loginStart = createAction(
  '[User] Login Start',
  props<{ email: string; password: string }>()
);
export const signupStart = createAction(
  '[User] Signup Start',
  props<{ newUser: User }>()
);
export const authSuccess = createAction(
  '[User] Auth Success',
  props<{ user: User }>()
);
export const authFail = createAction(
  '[User] Auth Fail',
  props<{ errorMessage: string }>()
);


export const GETUserLocationsStart = createAction(
  // FETCH ALL LOCATIONS WHERE USER IS AUTHORIZED
  '[Business] Fetch User Locations Start',
  props<{ userId: string, userRole: number }>()
);
export const GETUserLocationsSuccess = createAction(
  // SETS LOCATIONS AS USER AUTHORIZED LOCATIONS
  '[Business] Fetch User Locations Success',
  props<{ locations: Location[] }>()
);

export const clearError = createAction('[User] Clear Error');
export const autoLogin = createAction('[User] Auto Login');
export const logout = createAction('[User] Logout');
