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
    return this.store.select('auth').pipe(
      take(1),
      map((authState) => {
        return authState.userAuth.userProfile.role;
      }),
      map((userRole) => {
        const isMgr = userRole > 1 ? true : false;
        if (isMgr) {
          return true;
        }
        console.log(isMgr);
        console.log('||| mgr guard ^^^ |||')
        return this.router.createUrlTree(['/']);
      })
    );
  }
}
