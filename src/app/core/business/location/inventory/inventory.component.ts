import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../app-store/app.reducer';
import * as LocationActions from '../location-store/location.actions';
import { LocationState } from '../location-store/location.reducer';

import { map, Subscription } from 'rxjs';

import { Location } from '../../../models/location.model';
import { Product } from '../../../models/product.model';

import { LocationService } from '../../../core-control/location.service';
import { User } from 'src/app/users/user-control/user.model';
import { Router } from '@angular/router';
import { Inventory } from '../../../models/inventory.model';
import { InventoryService } from '../../../core-control/inventory.service';
import { BusinessInventoryPeriod } from '../../../models/business.model';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDateRangePickerInput } from '@angular/material/datepicker/date-range-picker';

interface DateRange {
  dateStart: Date | null;
  dateEnd: Date | null;
}

const inventoryColumns = [
  'category',
  'product name',
  'department',
  'unit',
  'case size',
  'packs par',
  'in stock',
  'inventory value',
];

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit, OnDestroy {
  constructor(
    private _store: Store<fromAppStore.AppState>,
    private _router: Router,
    private _locationService: LocationService,
    private _inventoryService: InventoryService
  ) {}

  private _userAuthSub: Subscription;
  private _locationStoreSub: Subscription;

  user: User;
  userRole: string;
  userDept: string;

  locationState: LocationState;
  // STATE VALUE ALIASES / VARS
  locationStateError: string;
  activeLocation: Location;
  inventoryData: any[];
  inventoryDataPopulatedSorted: Inventory[];
  needInvVal = true;
  inventoryPopulatedValue = [];
  workingInventory: any;
  workingInventoryItems: any;

  loading: boolean;

  dateFilterForm: FormGroup;

  locationProducts: any[];
  newInventoryProducts: any[] = [];
  initInvProducts = true;
  initLocInventories = true;

  selectedProducts: Product[] = [];
  activeProducts: Product[] = [];

  dataSource: MatTableDataSource<Inventory>;

  pastInventoryUpdateForm: FormGroup;
  formIsFinal = false;
  formError: string;

  inventoryPeriod = BusinessInventoryPeriod - 1;
  displayedColumns = inventoryColumns;

  ngOnInit(): void {
    // console.clear();

    this._userAuthSub = this._store
      .select('user')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.user = user;
        if (!!user) {
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
      .subscribe((locState) => {
        this.locationState = locState;
        this.loading = locState.loading;
        this.locationStateError = locState.locationError;
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
          this.inventoryData = locState.activeLocation.inventoryData;
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
        console.log(this.inventoryDataPopulatedSorted);
      });
    this.dataSource = new MatTableDataSource(
      this.locationState.activeLocationInventories
    );
    this._initDateFilterForm();
  }

  // WORKING
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

    console.log(range.dateEnd);

    for (const inv of filteredInventories) {
      if (
        new Date(inv.dateEnd) >= range.dateStart &&
        new Date(inv.dateEnd) <= range.dateEnd
      ) {
        arr.push(inv);
      }
      console.log(arr);
    }
    filteredInventories = arr;

    console.log(filteredInventories);

    this.inventoryDataPopulatedSorted = filteredInventories;
    console.log(this.inventoryDataPopulatedSorted);
  }

  resetFilter() {
    this.onSortInventoryData();
    this._initDateFilterForm();
    this.dateFilterForm.updateValueAndValidity();
  }

  onSetInvProductList() {
    for (const product of this.locationState.activeLocation.productList) {
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
    let sortedInv = [...this.locationState.activeLocationInventories];
    console.log(this.userRole)
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

  // onResetInventoryForm() {
  //   this.pastInventoryUpdateForm.reset();
  // }

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

  // FUTURE UPDATE
  // private _initPastInventoryUpdateForm() {
  //   let items = new FormArray([]);

  //   // NEED TO ITER OVER MULTIPLE INVS AND THEIR ITEMS
  //   // LARGER TASK FOR LATER

  //   for (const item of this.activeLocation.inventoryData) {
  //     let productId = item.product._id;
  //     let quantity = item.quantity;

  //     items.push(
  //       new FormGroup({
  //         product: new FormControl(productId, Validators.required),
  //         quantity: new FormControl(quantity),
  //       })
  //     );
  //   }

  //   this.pastInventoryUpdateForm = new FormGroup({
  //     _id: new FormControl(this.workingInventory._id),
  //     dateStart: new FormControl(
  //       this.workingInventory.dateStart,
  //       Validators.required
  //     ),
  //     dateEnd: new FormControl(
  //       this.workingInventory.dateEnd,
  //       Validators.required
  //     ),
  //     department: new FormControl(
  //       this.workingInventory.department,
  //       Validators.required
  //     ),
  //     isFinal: new FormControl(
  //       this.workingInventory.isFinal,
  //       Validators.required
  //     ),
  //     dInventory: items,
  //   });
  //   console.log(this.pastInventoryUpdateForm.value);
  //   console.log(this.draftInventoryItemControls);
  // }

  // GETS AND HOLDS THE LIST OF DRAFTInventoryItemControls CONTROLS
  // get draftInventoryItemControls() {
  //   return (<FormArray>this.pastInventoryUpdateForm.get('dInventory')).controls;
  // }

  ngOnDestroy(): void {
    this._userAuthSub.unsubscribe();
    this._locationStoreSub.unsubscribe();
  }
}
