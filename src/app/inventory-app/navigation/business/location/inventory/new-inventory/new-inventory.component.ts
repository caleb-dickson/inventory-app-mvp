import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../../app-store/app.reducer';

import { Subscription } from 'rxjs';

import { Location } from '../../../../../models/location.model';
import { Product } from '../../../../../models/product.model';
import { User } from 'src/app/users/user.model';
import { Router } from '@angular/router';
import { Inventory } from '../../../../../models/inventory.model';

import { LocationService } from '../../../../../inventory-app-control/location.service';
import { InventoryService } from '../../../../../inventory-app-control/inventory.service';
import { ThemeService } from 'src/app/theme/theme.service';

@Component({
  selector: 'app-new-inventory',
  templateUrl: './new-inventory.component.html',
  styleUrls: ['./new-inventory.component.scss'],
})
export class NewInventoryComponent
  implements OnInit, OnDestroy
{

  // STATE
  // subs
  private _userStoreSub: Subscription;
  private _businessStoreSub: Subscription;
  private _locationStoreSub: Subscription;
  private _updateInventorySub: Subscription;
  // loading state
  appLoading: boolean;
  userLoading: boolean;
  businessLoading: boolean;
  locationLoading: boolean;

  // USER
  user: User;
  userRole: string;
  userDept: string;
  userLocations: Location[];

  // LOCATION
  activeLocation: Location;
  activeLocationInventories: Inventory[];
  locationError: string;
  activeInventory: Inventory;

  // INVENTORY
  inventoryData: any[];
  inventoryDataPopulated: Inventory[];
  draftInventory: any;
  draftInventoryItems: any;
  newInventoryProducts: any[] = [];
  initInvProducts = true;

  // FORM
  newInventoryForm: FormGroup;
  formDept = 'foh';
  formIsFinal = false;
  formError: string;

  // PRODUCTS
  activeProducts: Product[] = [];
  locationProducts: any[];
  selectedProducts: Product[] = [];

  constructor(
    private _router: Router,
    private _locationService: LocationService,
    private _inventoryService: InventoryService,
    private _store: Store<fromAppStore.AppState>,
    private _themeService: ThemeService
  ) {}

  ngOnInit() {
    // console.clear();

    this._userStoreSub = this._store.select('user').subscribe((userState) => {
      this.appLoading = userState.loading;
      this.userLoading = userState.loading;
      this.user = userState.user;
      if (this.user) {
        this.setUserRoleString(this.user.userProfile.role);
        this.userDept = userState.user.userProfile.department;
        this.formDept =
          this.userDept !== 'admin'
            ? this.user.userProfile.department
            : this.formDept;
      }
    });

    this._locationStoreSub = this._store
    .select('location')
    .subscribe((locationState) => {
      this.appLoading = locationState.loading;
      this.locationLoading = locationState.loading;
      this.locationError = locationState.locationError;
      this.userLocations = locationState.userLocations;
      this.activeLocation = locationState.activeLocation;
      this.inventoryData = locationState.activeLocation?.inventoryData;
      this.activeInventory = locationState.activeInventory;
      this.activeLocationInventories =
        locationState.activeLocationInventories;
      this.activeProducts = locationState.activeProducts;

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
          console.log(this.newInventoryProducts)
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

      console.group(
        '%cLocation State',
        `font-size: 1rem;
          color: lightgreen;`,
        locationState
      );
      console.groupEnd();
    });


  }

  ngOnDestroy(): void {
    this._userStoreSub.unsubscribe();
    this._locationStoreSub.unsubscribe();
  }

  setUserRoleString(intRole: number): void {
    switch (intRole) {
      case 3:
        this.userRole = 'owner';
        break;
      case 2:
        this.userRole = 'manager';
        break;
      case 1:
        this.userRole = 'staff';
        break;
    }
  }

  onDepartmentSelect(dept: string) {
    this.newInventoryProducts = [];
    this.formDept = dept;
    this.setProductList();
  }

  // DETERMINE WHAT PRODUCTS SHOULD BE INITIALIZED IN THE NEW INVENTORY FORM
  // AND PASS THOSE PRODUCTS TO THE CHILD FORM FOR INITIALIZATION
  setProductList(): void {
    for (const product of this.activeLocation.productList) {
      let productDept = product.product.department;
      if (productDept === this.formDept && product.product.isActive) {
        this.newInventoryProducts.push(product);
      }
    }
    this.initInvProducts = false;
  }

  onInventorySubmit(inventoryForm: FormGroup, saveNew: boolean): void {
    console.log(inventoryForm);
    this._inventoryService.saveInventory(
      inventoryForm,
      this.activeLocation,
      this.formDept,
      saveNew
    );
    // this._router.navigate(['/app/dashboard']);
  }

}
