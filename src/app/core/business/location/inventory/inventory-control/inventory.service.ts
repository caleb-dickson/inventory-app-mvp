import { Injectable, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../app-store/app.reducer';
import * as LocationActions from '../../location-store/location.actions';
import * as BusinessActions from '../../../business-store/business.actions';

import { Location } from '../../../business-control/location.model';
import { LocationIds } from '../../../business-control/business.model';
import { LocationState } from '../../location-store/location.reducer';
import { BusinessState } from '../../../business-store/business.reducer';
import { Product } from '../../../business-control/product.model';
import { Inventory } from '../../../business-control/inventory.model';
import { NgForm } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class InventoryService implements OnInit {
  constructor(private _store: Store<fromAppStore.AppState>) {}

  private _businessStoreSub: Subscription;
  private _locationStoreSub: Subscription;

  private _businessState: BusinessState;
  private _locationState: LocationState;

  ngOnInit(): void {
    this._locationStoreSub = this._store
      .select('location')
      .subscribe((locState) => {
        console.log(locState);
        this._locationState = locState;
      });

    this._businessStoreSub = this._store
      .select('business')
      .subscribe((bizState) => {
        console.log(bizState);
        this._businessState = bizState;
      });
  }

  saveInventory(
    inventoryForm: NgForm,
    activeLocation: Location,
    userDept: string,
    saveNew: boolean
  ) {
    // CREATE A NEW INVENTORY OBJ BASED ON FORM INPUT AND CALC TOTAL VALUE
    const inventory: Inventory = {
      _id: null,
      parentLocation: activeLocation._id,
      dateStart: inventoryForm.value.dateStart,
      dateEnd: inventoryForm.value.dateEnd,
      department: userDept,
      isFinal: inventoryForm.value.isFinal,
      inventory: inventoryForm.value.inventory,
      value: this.getInventoriesValues(inventoryForm.value.inventory),
    };

    // HANDLE INVALID FORM
    if (inventoryForm.invalid) {
      this._store.dispatch(
        LocationActions.LocationError({ errorMessage: 'Form Invalid' })
      );
    } else {
      // IF SAVING A NEW INVENTORY
      if (saveNew) {
        console.log(inventory);

        this._store.dispatch(
          LocationActions.POSTCreateInventoryForLocationStart({
            location: activeLocation,
            inventory: inventory,
          })
        );

        // REMOVING THIS TRIGGERS A FETCH ACTION TO GET THE LATEST
        // THE INVENTORY DATA
        localStorage.removeItem('inventoryData');

        console.log(inventoryForm.value);

        // IF UPDATING A DRAFT
      } else {
        console.log(inventoryForm.value);

        this._store.dispatch(
          LocationActions.PUTUpdateInventoryForLocationStart({
            inventory: inventoryForm.value,
          })
        );

        // REMOVING THIS TRIGGERS A FETCH ACTION TO GET THE LATEST
        // THE INVENTORY DATA
        localStorage.removeItem('inventoryData');
      }
    }
  }

  // WHEN SUBMITTING OR UPDATING INVENTORY, CALCULATES TOTAL INV VALUE
  getInventoriesValues(
    inventoryItems: [{ product: Product; quantity: number }]
  ) {
    let value: number = 0;

    console.log(inventoryItems);
    for (let index = 0; index < inventoryItems.length; index++) {
      const item = inventoryItems[index];

      const unitPrice =
        item.product.casePrice /
        (item.product.unitSize *
          item.product.unitsPerPack *
          item.product.packsPerCase);
      let itemValue = unitPrice * item.quantity;

      value += itemValue;
    }
    console.log(value);
    return value;
  }
}