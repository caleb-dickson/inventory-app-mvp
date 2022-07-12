import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';

import { Store } from '@ngrx/store';
import { LocationState } from '../../location-store/location.reducer';
import * as fromAppStore from '../../../../../../app-store/app.reducer';
import * as LocationActions from '../../location-store/location.actions';

import { map, Subscription } from 'rxjs';

import { Location } from '../../../../../models/location.model';
import { Product } from '../../../../../models/product.model';
import { User } from 'src/app/users/user.model';
import { Router } from '@angular/router';
import { Inventory } from '../../../../../models/inventory.model';

import { LocationService } from '../../../../../inventory-app-control/location.service';
import { InventoryService } from '../../../../../inventory-app-control/inventory.service';
import { MatRadioChange } from '@angular/material/radio';
import { InventoryFormData } from '../inventory-form/inventory-form.component';
import { BaseComponent } from 'src/app/inventory-app/core/base-component';
import { ThemeService } from 'src/app/theme/theme.service';

@Component({
  selector: 'app-new-inventory',
  templateUrl: './new-inventory.component.html',
  styleUrls: ['./new-inventory.component.scss'],
})
export class NewInventoryComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  constructor(
    private _router: Router,
    private _locationService: LocationService,
    private _inventoryService: InventoryService,
    store: Store<fromAppStore.AppState>,
    themeService: ThemeService
  ) {
    super(store, themeService);
  }

  private _updateInventorySub: Subscription;

  formDept = 'foh';

  locationStateError: string;
  inventoryDataPopulated: Inventory[];
  draftInventory: any;
  draftInventoryItems: any;

  newInventoryProducts: any[] = [];
  initInvProducts = true;

  newInventoryForm: FormGroup;
  formIsFinal = false;
  formError: string;

  ngOnInit() {
    console.clear();

    if (this.user) {
      this.setUserRoleString(this.user.userProfile.role);
      this.formDept =
        this.userDept !== 'admin'
          ? this.user.userProfile.department
          : this.formDept;
    }

    this.draftInventory = this.activeInventory;

    // IF USER HAS AT LEAST ONE ACTIVATED LOCATION
    if (this.activeLocation?.productList.length > 0) {
      this.locationProducts = this.activeLocation.productList;
      this.inventoryDataPopulated = this.activeLocationInventories;

      // IF PRODUCTS ARE NEEDED AND USER ISN'T AN ADMIN
      if (
        this.activeLocation &&
        this.initInvProducts &&
        this.user.userProfile.department !== 'admin'
      ) {
        // SET PRODUCTS TO ONLY USER'S DEPT PRODUCTS
        this.setProductList();

        // IF USER IS AN ADMIN
      } else if (
        this.activeLocation &&
        this.initInvProducts &&
        this.user.userProfile.department === 'admin'
      ) {
        this.onDepartmentSelect(this.formDept);
      }

      // IF THERE'S A DRAFT WORKING INVENTORY, INITIALIZE THAT TOO
      if (this.draftInventory) {
        this._inventoryService.setInventoryForUpdate(
          this.draftInventory.inventory
        );
        this._updateInventorySub =
          this._inventoryService.$updateInventory.subscribe((inv) => {
            this.draftInventoryItems = inv;
          });
      }
    }
  }

  ngOnDestroy(): void {
    super.userStoreSub.unsubscribe();
    super.locationStoreSub.unsubscribe();
    super.themeSub.unsubscribe();
  }

  onDepartmentSelect(dept: string) {
    this.newInventoryProducts = [];
    this.formDept = dept;
    this.setProductList();
  }

  // DETERMINE WHAT PRODUCTS SHOULD BE INITIALIZED IN THE NEW INVENTORY FORM
  // AND PASS THOSE PRODUCTS TO THE CHILD FORM FOR INITIALIZATION
  setProductList() {
    for (const product of this.activeLocation.productList) {
      let productDept = product.product.department;
      if (productDept === this.formDept && product.product.isActive) {
        this.newInventoryProducts.push(product);
      }
    }
    this.initInvProducts = false;
  }

  onInventorySubmit(formData: InventoryFormData) {
    console.log(formData);
    this._inventoryService.saveInventory(
      formData.inventoryForm,
      this.activeLocation,
      this.formDept,
      true
    );
    // this._router.navigate(['/app/dashboard']);
  }

  // UPDATE EXISTING, !isFinal INVENTORIES
  onDraftInventorySubmit(draftInventoryForm: NgForm) {
    if (draftInventoryForm.invalid) {
      this.store.dispatch(
        LocationActions.LocationError({ errorMessage: 'Form Invalid' })
      );
    } else {
      console.log(draftInventoryForm.value);
    }

    this.store.dispatch(
      LocationActions.PUTUpdateInventoryForLocationStart({
        inventory: draftInventoryForm.value,
      })
    );

    localStorage.removeItem('inventoryData');

    this._router.navigate(['/app/dashboard']);
  }

}
