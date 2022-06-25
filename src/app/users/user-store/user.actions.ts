import { createAction, props } from '@ngrx/store';

import { Location } from 'src/app/core/models/location.model';
import { User } from '../user-control/user.model';

export const loginStart = createAction(
  '[User] Login Start',
  props<{ email: string; password: string }>()
);
export const loginPreviewStart = createAction(
  '[User] Login Preview User Start',
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
  '[User] Fetch User Locations Start',
  props<{ userId: string; userRole: number }>()
);
export const GETUserLocationsSuccess = createAction(
  // SETS LOCATIONS AS USER AUTHORIZED LOCATIONS
  '[User] Fetch User Locations Success',
  props<{ locations: Location[] }>()
);

export const PUTUpdateUserStart = createAction(
  // FETCH ALL LOCATIONS WHERE USER IS AUTHORIZED
  '[User] Update User Start'
);
export const PUTUpdateUserSuccess = createAction(
  // SETS LOCATIONS AS USER AUTHORIZED LOCATIONS
  '[User] Update User Success',
  props<{ user: User }>()
);

export const userError = createAction(
  // NON AUTH RELATED ERRORS
  '[User] User Fail',
  props<{ message: string }>()
);
export const clearError = createAction('[User] Clear Error');
export const autoLogin = createAction('[User] Auto Login');
export const logout = createAction('[User] Logout');
