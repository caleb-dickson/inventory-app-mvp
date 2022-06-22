import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams
} from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Store } from '@ngrx/store';
import { exhaustMap, map, take } from "rxjs";
import * as fromAppStore from '../../app-store/app.reducer';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private store: Store<fromAppStore.AppState>) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.store.select('user').pipe(
      take(1),
      map(authState => {
        return authState.user;
      }),
      exhaustMap((user) => {
        if (!user) {
          return next.handle(req);
        }
        const modifiedReq = req.clone({
          headers: req.headers.set("Authorization", "Bearer " + user.password),
        });
        return next.handle(modifiedReq);
      })
    );
  }
}
