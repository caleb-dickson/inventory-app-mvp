import { Injectable, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as LocationActions from '../business/location/location-store/location.actions';
import * as BusinessActions from '../business/business-store/business.actions';

import { Location } from '../models/location.model';
import { LocationIds } from '../models/business.model';
import { LocationState } from '../business/location/location-store/location.reducer';
import { BusinessState } from '../business/business-store/business.reducer';
import { Product } from '../models/product.model';
import { Inventory } from '../models/inventory.model';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private _businessStoreSub: Subscription;
  private _locationStoreSub: Subscription;

  businessState: BusinessState;
  locationState: LocationState;

  constructor(private _store: Store<fromAppStore.AppState>) {
    this._locationStoreSub = this._store
      .select('location')
      .subscribe((locState) => {
        console.log(locState);
        this.locationState = locState;
      });

    this._businessStoreSub = this._store
      .select('business')
      .subscribe((bizState) => {
        console.log(bizState);
        this.businessState = bizState;
      });
  }
}
