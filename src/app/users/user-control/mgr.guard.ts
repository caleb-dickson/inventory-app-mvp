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
export class ManagerGuard implements CanActivate {
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
        return authState.user.userProfile;
      }),
      map((userProfile) => {
        const isMgr = userProfile.role > 1 || userProfile.department === 'admin' ? true : false;
        if (isMgr) {
          return true;
        }
        console.log(isMgr);
        return this.router.createUrlTree(['/app/dashboard']);
      })
    );
  }
}
