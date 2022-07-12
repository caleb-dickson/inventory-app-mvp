import { ActionReducerMap } from "@ngrx/store";

import * as fromUser from '../users/user-store/user.reducer';
import * as fromBusiness from '../inventory-app/navigation/business/business-store/business.reducer';
import * as fromLocation from '../inventory-app/navigation/business/location/location-store/location.reducer';
import * as fromNotifications from "../notifications/notifications-store/notifications.reducer";

export interface AppState {
  user: fromUser.UserState;
  business: fromBusiness.BusinessState;
  location: fromLocation.LocationState;
  notification: fromNotifications.NotificationsState;
}

export const appReducer: ActionReducerMap<AppState> = {
  user: fromUser.userReducer,
  business: fromBusiness.businessReducer,
  location: fromLocation.locationReducer,
  notification: fromNotifications.notificationsReducer
}
