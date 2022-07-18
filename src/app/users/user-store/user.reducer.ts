import { Action, createReducer, on } from '@ngrx/store';

import * as UserActions from './user.actions';

import { Location } from 'src/app/inventory-app/models/location.model';
import { User } from '../user.model';

export interface UserState {
  user: User;
  userLocations: Location[];
  userMessage: string;
  userError: string;
  authError: string;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  userLocations: [],
  userMessage: null,
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
    on(
      UserActions.loginStart,
      UserActions.signupStart,
      UserActions.passwordResetInit,
      UserActions.DELETEUserStart,
      (state) => ({
        ...state,
        authError: null,
        loading: true,
      })
    ),
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
    on(UserActions.passwordResetInitSuccess, (state, action) => ({
      ...state,
      authError: null,
      loading: false,
      userMessage: action.message
    })),
    on(UserActions.setUserMessage, (state, action) => ({
      ...state,
      authError: null,
      loading: false,
      userMessage: action.message
    })),
    on(UserActions.DELETEUserSuccess, (state) => ({
      ...state,
      authError: null,
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
      loading: true,
    })),
    on(UserActions.PUTUpdateUserSuccess, (state, action) => ({
      ...state,
      loading: false,
      user: action.user,
    })),

    on(UserActions.logout, (state) => ({
      ...(state = initialState),
    })),
    on(UserActions.userError, (state, action) => ({
      ...state,
      userError: action.message,
    })),
    on(UserActions.clearError, (state) => ({ ...state, authError: null }))
  )(authState, authAction);
}
