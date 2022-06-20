import { ActionReducerMap } from "@ngrx/store";

import * as fromUser from '../users/user-store/user.reducer';
import * as fromBusiness from '../core/business/business-store/business.reducer';
import * as fromLocation from '../core/business/location/location-store/location.reducer';

export interface AppState {
  user: fromUser.UserState;
  business: fromBusiness.BusinessState;
  location: fromLocation.LocationState;
}

export const appReducer: ActionReducerMap<AppState> = {
  user: fromUser.userReducer,
  business: fromBusiness.businessReducer,
  location: fromLocation.locationReducer
}
