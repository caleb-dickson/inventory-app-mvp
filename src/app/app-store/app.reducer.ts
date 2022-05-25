import { ActionReducerMap } from "@ngrx/store";

import * as fromAuth from '../auth/auth-store/auth.reducer';
import * as fromBusiness from '../core/business/business-store/business.reducer'

export interface AppState {
  auth: fromAuth.AuthState;
  business: fromBusiness.BusinessState;
}

export const appReducer: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer,
  business: fromBusiness.businessReducer
}
