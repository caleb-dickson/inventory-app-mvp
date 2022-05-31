import { Action, createReducer, on } from '@ngrx/store';
import * as BusinessActions from './business.actions';

import { Business } from '../business-control/business.model';
import { Location } from '../business-control/location.model';

export interface BusinessState {
  business: Business;
  businessLocations: Location[];
  locationSelected: Location; //Change to 'activeLocation'
  businessError: string;
  loading: boolean;
}
const initialState: BusinessState = {
  business: null,
  businessLocations: [],
  locationSelected: null, //Change to 'activeLocation'
  businessError: null,
  loading: false,
};

export function businessReducer(
  businessState: BusinessState | undefined,
  businessAction: Action
) {
  return createReducer(
    initialState,

    // BUSINESS ACTIONS = OWNER
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


    // LOCATION ACTIONS = OWNER
    on(BusinessActions.POSTLocationStart, (state) => ({
      ...state,
      businessError: null,
      loading: true,
    })),
    on(BusinessActions.POSTLocationSuccess, (state) => ({
      ...state,
      loading: false
    })),
    on(BusinessActions.PUTLocationStart, (state) => ({
      ...state,
      loading: true
    })),
    on(BusinessActions.PUTLocationSuccess, (state) => ({
      ...state,
      loading: false
    })),
    on(BusinessActions.PUTUserToLocationStart, (state) => ({
      ...state,
      loading: true
    })),
    on(BusinessActions.PUTUserToLocationSuccess, (state, action) => ({
      ...state,
      loading: false,
      locationSelected: action.location
    })),
    on(BusinessActions.SelectLocation, (state, action) => ({
      ...state,
      locationSelected: action.location
    })),


    // FETCH ACTIONS = OWNER
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
    on(BusinessActions.GETBusinessLocationsStart, (state) => ({
      ...state,
      businessError: null,
      loading: true,
    })),
    on(BusinessActions.GETBusinessLocationsSuccess, (state, action) => ({
      ...state,
      loading: false,
      businessLocations: action.locations
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
    on(BusinessActions.BusinessError, (state, action) => ({
      ...state,
      businessError: action.errorMessage,
      loading: false,
    })),
    on(BusinessActions.clearError, (state) => ({
      ...state,
      businessError: null,
    })),


    // CLEAR BUSINESS STATE (ON LOGOUT)
    on(BusinessActions.clearBusinessState, (state) => ({
      ...state,
      business: null,
      businessLocations: [],
      businessError: null,
      loading: false,
    }))
  )(businessState, businessAction);
}
