import { Action, createReducer, on } from '@ngrx/store';

import * as AuthActions from './auth.actions';

import { Location } from 'src/app/core/business/business-control/location.model';
import { User } from '../auth-control/user.model';

export interface AuthState {
  userAuth: User;
  userLocations: Location[];
  authError: string;
  loading: boolean;
}

const initialState: AuthState = {
  userAuth: null,
  userLocations: [],
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

    on(AuthActions.GETUserLocationsStart, (state) => ({
      ...state,
      authError: null,
      loading: true,
    })),
    on(AuthActions.GETUserLocationsSuccess, (state, action) => ({
      ...state,
      authError: null,
      loading: false,
      userLocations: action.locations
    })),


    on(AuthActions.logout, (state) => ({
      ...state,
      userAuth: null,
    })),
    on(AuthActions.clearError, (state) => ({ ...state, authError: null }))
  )(authState, authAction);
}
