import { createAction, props } from '@ngrx/store';
import { User } from '../auth-control/user.model';

export const loginStart = createAction(
  '[Auth] Login Start',
  props<{ email: string; password: string }>()
);
export const signupStart = createAction(
  '[Auth] Signup Start',
  props<{ newUser: User }>()
);
export const authSuccess = createAction(
  '[Auth] Auth Success',
  props<{ user: User }>()
);
export const authFail = createAction(
  '[Auth] Auth Fail',
  props<{ errorMessage: string }>()
);
export const clearError = createAction('[Auth] Clear Error');
export const autoLogin = createAction('[Auth] Auto Login');
export const logout = createAction('[Auth] Logout');
