import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';

import { Store } from '@ngrx/store';
import { LocationState } from '../../location-store/location.reducer';
import * as fromAppStore from '../../../../../app-store/app.reducer';
import * as LocationActions from '../../location-store/location.actions';

import { map, Subscription } from 'rxjs';

import { Location } from '../../../../models/location.model';
import { Product } from '../../../../models/product.model';
import { User } from 'src/app/users/user.model';
import { Router } from '@angular/router';
import { Inventory } from '../../../../models/inventory.model';

import { LocationService } from '../../../../core-control/location.service';
import { InventoryService } from '../../../../core-control/inventory.service';
import { MatRadioChange } from '@angular/material/radio';
import { InventoryFormData } from '../inventory-form/inventory-form.component';

@Component({
  selector: 'app-new-inventory',
  templateUrl: './new-inventory.component.html',
  styleUrls: ['./new-inventory.component.scss'],
})
export class NewInventoryComponent implements OnInit, OnDestroy {
  constructor(
    private _store: Store<fromAppStore.AppState>,
    private _router: Router,
    private _locationService: LocationService,
    private _inventoryService: InventoryService
  ) {}

  private _userAuthSub: Subscription;
  private _locationStoreSub: Subscription;
  private _updateInventorySub: Subscription;

  user: User;
  userRole: string;
  userDept: string = null;

  /**
   * Set to `foh` by default.
   * Changed by user input during inventory creation on exception.
   *
   * This variable will only change the inventory type if the user is
   * assigned `admin` department or if the `User` is an Owner (`role` = 3).
   *
   * Generally, it's expected that these users would most often
   * create `foh` inventories and only occasionally use the `boh` type.
   */
  formDept = 'foh';

  locationState: LocationState;
  locationStateError: string;
  activeLocation: Location;
  inventoryData: any[];
  inventoryDataPopulated: Inventory[];
  draftInventory: any;
  draftInventoryItems: any;

  locLoading: boolean;

  locationProducts: any[];
  newInventoryProducts: any[] = [];
  initInvProducts = true;

  selectedProducts: Product[] = [];
  activeProducts: Product[] = [];

  newInventoryForm: FormGroup;
  formIsFinal = false;
  formError: string;

  ngOnInit() {
    // console.clear();

    this._userAuthSub = this._store
      .select('user')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.user = user;
        if (user) {
          switch (user.userProfile.role) {
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
          this.userDept = user.userProfile.department;
          this.formDept =
            this.userDept !== 'admin'
              ? user.userProfile.department
              : this.formDept;
        }
      });

    this._locationStoreSub = this._store
      .select('location')
      .subscribe((locState) => {
        this.locationState = locState;
        this.locLoading = locState.loading;
        this.locationStateError = locState.locationError;
        this.activeProducts = locState.activeProducts;
        this.activeLocation = locState.activeLocation;
        this.draftInventory = locState.activeInventory;

        // IF USER HAS AT LEAST ONE ACTIVATED LOCATION
        if (locState.activeLocation?.productList.length > 0) {
          this.locationProducts = locState.activeLocation.productList;
          this.inventoryData = locState.activeLocation.inventoryData;
          this.inventoryDataPopulated = locState.activeLocationInventories;

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
            this._inventoryService.setInventoryForUpdate(this.draftInventory.inventory)
            this._updateInventorySub = this._inventoryService.$updateInventory.subscribe(inv => {
              this.draftInventoryItems = inv;
            })
          }
        }

        // this.setProductList();
        console.group(
          '%cLocation State',
          `font-size: 1rem;
            color: lightgreen;`,
          locState
        );
        console.groupEnd();
      });
  }

  onDepartmentSelect(dept: string) {
    this.newInventoryProducts = [];
    console.log(dept);
    this.formDept = dept;
    this.setProductList();
  }

  // DETERMINE WHAT PRODUCTS SHOULD BE INITIALIZED IN THE NEW INVENTORY FORM
  // AND PASS THOSE PRODUCTS TO THE CHILD FORM FOR INITIALIZATION
  setProductList() {
    console.log(this.formDept);
    for (const product of this.locationState.activeLocation.productList) {
      let productDept = product.product.department;
      if (productDept === this.formDept && product.product.isActive) {
        this.newInventoryProducts.push(product);
      }
    }
    this.initInvProducts = false;
    console.log(this.newInventoryProducts)
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
      this._store.dispatch(
        LocationActions.LocationError({ errorMessage: 'Form Invalid' })
      );
    } else {
      console.log(draftInventoryForm.value);
    }

    this._store.dispatch(
      LocationActions.PUTUpdateInventoryForLocationStart({
        inventory: draftInventoryForm.value,
      })
    );

    localStorage.removeItem('inventoryData');

    this._router.navigate(['/app/dashboard']);
  }

  ngOnDestroy(): void {
    this._userAuthSub.unsubscribe();
    this._locationStoreSub.unsubscribe();
  }
}
