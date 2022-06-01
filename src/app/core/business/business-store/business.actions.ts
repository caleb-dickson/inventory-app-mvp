import { createAction, props } from '@ngrx/store';

import { Business } from '../business-control/business.model';
import { Location } from '../business-control/location.model';

// BUSINESS ACTIONS = FOR OWNERS
// BUSINESS ACTIONS = FOR OWNERS
export const POSTBusinessStart = createAction(
  '[Business] Add Business Start',
  props<{ business: Business }>()
);
export const POSTBusinessSuccess = createAction(
  '[Business] Add Business Success',
  props<{ business: Business }>()
);
export const PUTBusinessStart = createAction(
  '[Business] Update Business Start',
  props<{ business: Business }>()
);
export const PUTBusinessSuccess = createAction(
  '[Business] Update Business Success',
  props<{ business: Business }>()
);

// LOCATION ACTIONS = FOR OWNERS
// LOCATION ACTIONS = FOR OWNERS
export const POSTLocationStart = createAction(
  '[Business] Add Location Start',
  props<{ location: Location }>()
);
export const POSTLocationSuccess = createAction(
  '[Business] Add Location Success'
);
export const PUTLocationStart = createAction(
  '[Business] Update Location Start',
  props<{ location: Location }>()
);
export const PUTLocationSuccess = createAction(
  '[Business] Update Location Start'
);
export const PUTUserToLocationStart = createAction(
  '[Business] Add User to Location Authorized managers/staff Start',
  props<{ emails: string[], role: string, location: Location }>()
);
export const PUTUserToLocationSuccess = createAction(
  '[Business] Add User to Location Authorized managers/staff Start',
  props<{ location: Location }>()
);
export const SelectLocation = createAction(
  '[Business] Select Location for Action',
  props<{ location: Location }>()
)

// INVENTORY ACTIONS ARE IN THE LOCATION (non-owner) STORE
// INVENTORY ACTIONS ARE IN THE LOCATION (non-owner) STORE

// PRODUCT ACTIONS ARE IN THE LOCATION (non-owner) STORE
// PRODUCT ACTIONS ARE IN THE LOCATION (non-owner) STORE

// FETCH = FOR OWNER
// FETCH = FOR OWNER
export const GETBusinessStart = createAction(
  '[Business] Fetch Business Start',
  props<{ ownerId: string }>()
);
export const GETBusinessSuccess = createAction(
  '[Business] Fetch Business Success',
  props<{ business: Business }>()
);
export const GETBusinessLocationsStart = createAction(
  '[Business] Fetch Business Locations Start',
  props<{ businessId: string }>()
);
export const GETBusinessLocationsSuccess = createAction(
  '[Business] Fetch Business Locations Success',
  props<{ locations: Location[] }>()
);



// ERROR HANDLING = FOR ALL USERS
// ERROR HANDLING = FOR ALL USERS
export const POSTEntityFail = createAction(
  '[Business] Add Entity Fail',
  props<{ errorMessage: string }>()
);
export const GETEntityFail = createAction(
  '[Business] Fetch Entity Fail',
  props<{ errorMessage: string }>()
);
export const BusinessError = createAction(
  '[Business] Business Errors',
  props<{ errorMessage: string }>()
);
export const clearError = createAction('[Business] Clear Error');

// CLEAR BUSINESS STATE ON LOGOUT = FOR ALL USERS
// CLEAR BUSINESS STATE ON LOGOUT = FOR ALL USERS
export const clearBusinessState = createAction(
  '[Business] Clear Business State'
);
