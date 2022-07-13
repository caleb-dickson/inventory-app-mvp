import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../app-store/app.reducer';
import * as LocationActions from '../location-store/location.actions';

import { map, Subscription } from 'rxjs';

import { LocationService } from '../../../../inventory-app-control/location.service';
import { Router } from '@angular/router';
import { Inventory } from '../../../../models/inventory.model';
import { InventoryService } from '../../../../inventory-app-control/inventory.service';
import { BusinessInventoryPeriod } from '../../../../models/business.model';
import { ThemeService } from 'src/app/theme/theme.service';
import { User } from 'src/app/users/user.model';
import { Product } from 'src/app/inventory-app/models/product.model';
import { Location } from 'src/app/inventory-app/models/location.model';

interface DateRange {
  dateStart: Date | null;
  dateEnd: Date | null;
}

const inventoryColumns = [
  'category',
  'productName',
  'department',
  'unit',
  'caseSize',
  'packsPar',
  'inStock',
  'inventoryValue',
];

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit, OnDestroy {

  // STATE
  // subs
  private _userStoreSub: Subscription;
  private _businessStoreSub: Subscription;
  private _locationStoreSub: Subscription;
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
  inventoryDataPopulatedSorted: Inventory[];
  workingInventory: any;
  newInventoryProducts: any[] = [];
  initInvProducts = true;
  initLocInventories = true;

  inventoryPeriod = BusinessInventoryPeriod - 1;
  displayedColumns = inventoryColumns;

  // PRODUCTS
  activeProducts: Product[] = [];
  locationProducts: any[];
  selectedProducts: Product[] = [];

  // FORMS
  dateFilterForm: FormGroup;
  dataSource: MatTableDataSource<Inventory>;
  pastInventoryUpdateForm: FormGroup;
  formIsFinal = false;
  formError: string;

  constructor(
    private _router: Router,
    private _locationService: LocationService,
    private _inventoryService: InventoryService,
    private _store: Store<fromAppStore.AppState>,
    private _themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // console.clear();

    this._userStoreSub = this._store
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
        }
      });

    this._locationStoreSub = this._store
      .select('location')
      .subscribe((locationState) => {
        this.activeProducts = locationState.activeProducts;
        this.activeLocation = locationState.activeLocation;
        this.workingInventory = locationState.activeInventory;
        this.inventoryDataPopulatedSorted = locationState.activeLocationInventories;

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

        // IF USER HAS AT LEAST ONE ACTIVATED LOCATION
        if (
          locationState.activeLocation &&
          locationState.activeLocation.productList &&
          locationState.activeLocation.productList.length > 0
        ) {
          this.locationProducts = locationState.activeLocation.productList;
        }

        if (
          locationState.activeLocationInventories &&
          locationState.activeLocationInventories.length > 0
        ) {
          this.onSortInventoryData();
        }

        console.group(
          '%cLocation State',
          `font-size: 1rem;
            color: lightgreen;`,
          locationState
        );
        console.groupEnd();
      });
    this.dataSource = new MatTableDataSource(this.activeLocationInventories);
    this._initDateFilterForm();
  }

  ngOnDestroy(): void {
    this._userStoreSub.unsubscribe();
    this._locationStoreSub.unsubscribe();
  }

  defineFilter() {
    console.log(this.dateFilterForm.value);

    let range: DateRange = {
      dateStart: this.dateFilterForm.value.dateStart,
      dateEnd: this.dateFilterForm.value.dateEnd,
    };
    console.log(range);

    if (
      this.dateFilterForm.value.dateStart &&
      this.dateFilterForm.value.dateEnd
    ) {
      this.applyFilter(range);
    }
  }

  private _initDateFilterForm() {
    this.dateFilterForm = new FormGroup({
      dateStart: new FormControl(null),
      dateEnd: new FormControl(null),
    });
  }

  applyFilter(range: DateRange) {
    let arr = [];
    let filteredInventories = this.inventoryDataPopulatedSorted;

    for (const inv of filteredInventories) {
      if (
        new Date(inv.dateEnd) >= range.dateStart &&
        new Date(inv.dateEnd) <= range.dateEnd
      ) {
        arr.push(inv);
      }
    }
    filteredInventories = arr;

    this.inventoryDataPopulatedSorted = filteredInventories;
  }

  resetFilter() {
    this.onSortInventoryData();
    this._initDateFilterForm();
    this.dateFilterForm.updateValueAndValidity();
  }

  onSetInvProductList() {
    for (const product of this.activeLocation.productList) {
      let productDept = product.product.department;
      if (
        productDept === this.user.userProfile.department &&
        product.product.isActive
      ) {
        this.newInventoryProducts.push(product);
      }
    }
    this.initInvProducts = false;
  }

  onSortInventoryData() {
    let arr = [];
    let sortedInv = [...this.activeLocationInventories];
    if (this.userDept === 'admin') {
      for (const inv of sortedInv) {
        if (inv.isFinal) {
          arr.push(inv);
        }
      }
      arr.sort((a, b) => (a.dateEnd < b.dateEnd ? 1 : -1));
    } else {
      for (const inv of sortedInv) {
        if (inv.isFinal && inv.department === this.userDept) {
          arr.push(inv);
        }
      }
      arr.sort((a, b) => (a.dateEnd < b.dateEnd ? 1 : -1));
    }
    sortedInv = arr;

    this.inventoryDataPopulatedSorted = sortedInv;
  }

  onPastInventoryUpdateSubmit(draftInventoryForm: NgForm) {
    if (draftInventoryForm.invalid) {
      this._store.dispatch(
        LocationActions.LocationError({ errorMessage: 'Form Invalid' })
      );
    } else {
      console.log(draftInventoryForm.value);
    }
    console.log(this.pastInventoryUpdateForm.value);

    this._store.dispatch(
      LocationActions.PUTUpdateInventoryForLocationStart({
        inventory: draftInventoryForm.value,
      })
    );

    localStorage.removeItem('inventoryData');

    this._router.navigate(['/app/dashboard']);
  }
}
