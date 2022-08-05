import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler
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
      map(authState => authState.authToken),
      exhaustMap((token) => {
        if (!token) {
          return next.handle(req);
        }
        const modifiedReq = req.clone({
          headers: req.headers.set("Authorization", "Bearer " + token),
        });
        return next.handle(modifiedReq);
      })
    );
  }
}
