import { createAction, props } from '@ngrx/store';

export const showMessage = createAction(
  '[Notifications] Show Action Message',
  props<{ message: string; notificationAction: string, duration: number }>()
);
