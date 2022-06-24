import { Action, createReducer, on } from '@ngrx/store';

import * as UserActions from './user.actions';

import { Location } from 'src/app/core/models/location.model';
import { User } from '../user-control/user.model';

export interface UserState {
  user: User;
  userLocations: Location[];
  userError: string;
  authError: string;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  userLocations: [],
  userError: null,
  authError: null,
  loading: false,
};

export function userReducer(
  authState: UserState | undefined,
  authAction: Action
) {
  return createReducer(
    initialState,
    on(UserActions.loginStart, UserActions.signupStart, (state) => ({
      ...state,
      authError: null,
      loading: true,
    })),
    on(UserActions.authSuccess, (state, action) => ({
      ...state,
      authError: null,
      loading: false,
      user: action.user,
    })),
    on(UserActions.authFail, (state, action) => ({
      ...state,
      user: null,
      authError: action.errorMessage,
      loading: false,
    })),

    on(UserActions.GETUserLocationsStart, (state) => ({
      ...state,
      authError: null,
      loading: true,
    })),
    on(UserActions.GETUserLocationsSuccess, (state, action) => ({
      ...state,
      authError: null,
      loading: false,
      userLocations: action.locations,
    })),

    on(UserActions.PUTUpdateUserStart, (state) => ({
      ...state,
      loading: true
    })),
    on(UserActions.PUTUpdateUserSuccess, (state, action) => ({
      ...state,
      loading: false,
      user: action.user
    })),

    on(UserActions.logout, (state) => ({
      ...state = initialState
    })),
    on(UserActions.userError, (state, action) => ({
      ...state,
      userError: action.message,
    })),
    on(UserActions.clearError, (state) => ({ ...state, authError: null }))
  )(authState, authAction);
}
