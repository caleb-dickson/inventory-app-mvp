import { Action, createReducer, on } from '@ngrx/store';

import * as NotificationsActions from './notifications.actions';

export interface NotificationsState {
  message: string;
  duration: number;
  notificationAction: string;
  isOpen: boolean;
}

const initialState: NotificationsState = {
  message: null,
  duration: null,
  notificationAction: null,
  isOpen: false
};

export function notificationsReducer(
  notificationsState: NotificationsState | undefined,
  notificationsAction: Action
) {
  return createReducer(
    initialState,
    on(NotificationsActions.showMessage, (state, action) => ({
      ...state,
      message: action.message,
      notificationAction: action.notificationAction,
      duration: action.duration,
      isOpen: true
    }))
  ) (notificationsState, notificationsAction);
}
