import { createAction, props } from '@ngrx/store';
import { Inventory } from '../../inventory/inv-control/inventory.model';

import { Business, LocationIds } from '../business-control/business.model';
import { Location } from '../business-control/location.model';

// BUSINESS ACTIONS
// BUSINESS ACTIONS
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

// LOCATION ACTIONS
// LOCATION ACTIONS
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

// INVENTORY ACTIONS ARE IN THE INVENTORY STORE
// INVENTORY ACTIONS ARE IN THE INVENTORY STORE

// PRODUCT ACTIONS ARE IN THE INVENTORY STORE
// PRODUCT ACTIONS ARE IN THE INVENTORY STORE

// ERROR HANDLING
// ERROR HANDLING
export const POSTEntityFail = createAction(
  '[Business] Add Entity Fail',
  props<{ errorMessage: string }>()
);
export const GETEntityFail = createAction(
  '[Business] Fetch Entity Fail',
  props<{ errorMessage: string }>()
);
export const clearError = createAction('[Business] Clear Error');

// FETCH
// FETCH
export const GETBusinessStart = createAction(
  '[Business] Fetch Business Start',
  props<{ ownerId: string }>()
);
export const GETBusinessSuccess = createAction(
  '[Business] Fetch Business Success',
  props<{ business: Business }>()
);

// CLEAR BUSINESS STATE ON LOGOUT
// CLEAR BUSINESS STATE ON LOGOUT
export const clearBusinessState = createAction(
  '[Business] Clear Business State'
);
