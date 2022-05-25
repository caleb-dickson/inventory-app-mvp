import { Action, createReducer, on } from '@ngrx/store';
import { User } from '../auth-control/user.model';
import * as AuthActions from './auth.actions';

export interface AuthState {
  userAuth: User;
  authError: string;
  loading: boolean;
}

const initialState: AuthState = {
  userAuth: null,
  authError: null,
  loading: false,
};


export function authReducer(authState: AuthState | undefined, authAction: Action) {
  return createReducer(
    initialState,
    on(AuthActions.loginStart, AuthActions.signupStart, (state) => ({
      ...state,
      authError: null,
      loading: true,
    })),
    on(AuthActions.authSuccess, (state, action) => ({
      ...state,
      authError: null,
      loading: false,
      userAuth: action.user
    })),
    on(AuthActions.authFail, (state, action) => ({
      ...state,
      userAuth: null,
      authError: action.errorMessage,
      loading: false,
    })),
    on(AuthActions.logout, (state) => ({
      ...state,
      userAuth: null,
    })),
    on(AuthActions.clearError, (state) => ({ ...state, authError: null }))
  )(authState, authAction);
}
