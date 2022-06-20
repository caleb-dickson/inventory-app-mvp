import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private store: Store<fromAppStore.AppState>,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Promise<boolean | UrlTree>
    | Observable<boolean | UrlTree> {
    return this.store.select('user').pipe(
      take(1),
      map((authState) => {
        return authState.userAuth.userProfile;
      }),
      map((userProfile) => {
        const isOwner = userProfile.role === 3 || userProfile.department === 'admin' ? true : false;
        if (isOwner) {
          return true;
        }
        return this.router.createUrlTree(['/app/dashboard']);
      })
    );
  }
}
