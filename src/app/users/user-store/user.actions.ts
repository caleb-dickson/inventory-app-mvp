import { createAction, props } from '@ngrx/store';

import { Location } from 'src/app/inventory-app/models/location.model';
import { User } from '../user.model';

// AUTH ACTIONS
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

// PASSWORD RESET ACTIONS
export const passwordResetInit = createAction(
  '[User] Password Reset Start',
  props<{ email: string }>()
);
export const passwordResetInitSuccess = createAction(
  '[User] Password Reset Init Success',
  props<{ message: string }>()
);
export const checkTokenValidity = createAction(
  '[User] Password Reset Check Token Validity',
  props<{ token: string }>()
);
export const saveNewPassword = createAction(
  '[User] Save New Password',
  props<{ newPass: string; userId: string, token: string }>()
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

export const setUserMessage = createAction(
  '[User] Set User Action Response Message',
  props<{ message: string }>()
);

export const userError = createAction(
  // NON AUTH RELATED ERRORS
  '[User] User Fail',
  props<{ message: string }>()
);

export const DELETEUserStart = createAction(
  '[User] Delete User Start',
  props<{ userId: string }>()
);
export const DELETEUserSuccess = createAction('[User] Delete User Success');

export const clearError = createAction('[User] Clear Error');
export const autoLogin = createAction('[User] Auto Login');
export const logout = createAction('[User] Logout');
