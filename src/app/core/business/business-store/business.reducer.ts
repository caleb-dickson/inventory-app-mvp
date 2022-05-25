import { Action, createReducer, on } from '@ngrx/store';
import * as BusinessActions from './business.actions';

import { Business } from '../business-control/business.model';

export interface BusinessState {
  business: Business;
  // locations: object[];
  businessError: string;
  loading: boolean;
}
const initialState: BusinessState = {
  business: null,
  // locations: [],
  businessError: null,
  loading: false,
};

export function businessReducer(
  businessState: BusinessState | undefined,
  businessAction: Action
) {
  return createReducer(
    initialState,

    // BUSINESS ACTIONS
    on(BusinessActions.POSTBusinessStart, (state) => ({
      ...state,
      businessError: null,
      loading: true,
    })),
    on(BusinessActions.POSTBusinessSuccess, (state, action) => ({
      ...state,
      loading: false,
      business: action.business
    })),
    on(BusinessActions.PUTBusinessStart, (state) => ({
      ...state,
      businessError: null,
      loading: true,
    })),
    on(BusinessActions.PUTBusinessSuccess, (state, action) => ({
      ...state,
      loading: false,
      business: action.business
    })),


    // LOCATION ACTIONS
    on(BusinessActions.POSTLocationStart, (state) => ({
      ...state,
      businessError: null,
      loading: true,
    })),
    on(BusinessActions.POSTLocationSuccess, (state, action) => ({
      ...state,
      loading: false
    })),
    on(BusinessActions.PUTLocationStart, (state, action) => ({
      ...state,
      loading: true
    })),
    on(BusinessActions.PUTLocationSuccess, (state, action) => ({
      ...state,
      loading: false
    })),


    // FETCH ACTIONS
    on(BusinessActions.GETBusinessStart, (state) => ({
      ...state,
      businessError: null,
      loading: true,
    })),
    on(BusinessActions.GETBusinessSuccess, (state, action) => ({
      ...state,
      loading: false,
      business: action.business
    })),


    // ERROR HANDLING
    on(BusinessActions.POSTEntityFail, (state, action) => ({
      ...state,
      businessError: action.errorMessage,
      loading: false,
    })),
    on(BusinessActions.GETEntityFail, (state, action) => ({
      ...state,
      businessError: action.errorMessage,
      loading: false,
    })),
    on(BusinessActions.clearError, (state) => ({
      ...state,
      businessError: null,
    })),


    // CLEAR BUSINESS STATE ON LOGOUT
    on(BusinessActions.clearBusinessState, (state) => ({
      ...state,
      business: null,
      locations: [],
      businessError: null,
      loading: false,
    }))
  )(businessState, businessAction);
}
