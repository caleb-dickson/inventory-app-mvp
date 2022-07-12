import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../app-store/app.reducer';
import * as LocationActions from '../location-store/location.actions';

import { map } from 'rxjs';

import { LocationService } from '../../../../inventory-app-control/location.service';
import { Router } from '@angular/router';
import { Inventory } from '../../../../models/inventory.model';
import { InventoryService } from '../../../../inventory-app-control/inventory.service';
import { BusinessInventoryPeriod } from '../../../../models/business.model';
import { BaseComponent } from 'src/app/inventory-app/core/base-component';
import { ThemeService } from 'src/app/theme/theme.service';

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
export class InventoryComponent
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

  // STATE
  inventoryDataPopulatedSorted: Inventory[];
  workingInventory: any;

  dateFilterForm: FormGroup;

  newInventoryProducts: any[] = [];
  initInvProducts = true;
  initLocInventories = true;

  dataSource: MatTableDataSource<Inventory>;

  pastInventoryUpdateForm: FormGroup;
  formIsFinal = false;
  formError: string;

  inventoryPeriod = BusinessInventoryPeriod - 1;
  displayedColumns = inventoryColumns;

  ngOnInit(): void {
    console.clear();

    this.userStoreSub = this.store
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

    this.locationStoreSub = this.store
      .select('location')
      .subscribe((locState) => {
        this.activeProducts = locState.activeProducts;
        this.activeLocation = locState.activeLocation;
        this.workingInventory = locState.activeInventory;
        this.inventoryDataPopulatedSorted = locState.activeLocationInventories;

        // IF USER HAS AT LEAST ONE ACTIVATED LOCATION
        if (
          locState.activeLocation &&
          locState.activeLocation.productList &&
          locState.activeLocation.productList.length > 0
        ) {
          this.locationProducts = locState.activeLocation.productList;
        }

        if (
          locState.activeLocationInventories &&
          locState.activeLocationInventories.length > 0
        ) {
          this.onSortInventoryData();
        }

        console.group(
          '%cLocation State',
          `font-size: 1rem;
            color: lightgreen;`,
          locState
        );
        console.groupEnd();
      });
    this.dataSource = new MatTableDataSource(this.activeLocationInventories);
    this._initDateFilterForm();
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
      this.store.dispatch(
        LocationActions.LocationError({ errorMessage: 'Form Invalid' })
      );
    } else {
      console.log(draftInventoryForm.value);
    }
    console.log(this.pastInventoryUpdateForm.value);

    this.store.dispatch(
      LocationActions.PUTUpdateInventoryForLocationStart({
        inventory: draftInventoryForm.value,
      })
    );

    localStorage.removeItem('inventoryData');

    this._router.navigate(['/app/dashboard']);
  }

  ngOnDestroy(): void {
    this.userStoreSub.unsubscribe();
    this.locationStoreSub.unsubscribe();
  }
}
