import { createAction, props } from '@ngrx/store';

export const showTimeMessage = createAction(
  '[Notifications] Show Timed Message',
  props<{ message: string; duration: number }>()
);

export const showConfirmMessage = createAction(
  '[Notifications] Show Action Message',
  props<{ message: string; notificationAction: string, duration: number }>()
);
