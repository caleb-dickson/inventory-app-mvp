import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import {
  DateRange,
  MatDateRangeSelectionStrategy,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';
import { MatRipple } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../app-store/app.reducer';
import * as LocationActions from '../location-store/location.actions';
import { LocationState } from '../location-store/location.reducer';

import { map, Subscription } from 'rxjs';

import { Location } from '../../business-control/location.model';
import { Product } from '../../business-control/product.model';

import { LocationService } from '../location-control/location.service';
import { User } from 'src/app/auth/auth-control/user.model';
import { Router } from '@angular/router';
import { Inventory } from '../../business-control/inventory.model';

export const BusinessInventoryPeriod = 14;

// @Injectable()
// class RangeSelectionStrategy<D>
//   implements MatDateRangeSelectionStrategy<D>
// {
//   inventoryPeriod = BusinessInventoryPeriod - 1;

//   constructor(private _dateAdapter: DateAdapter<D>) {}

//   selectionFinished(date: D | null): DateRange<D> {
//     return this._createDateRange(date);
//   }
//   createPreview(activeDate: D | null): DateRange<D> {
//     return this._createDateRange(activeDate);
//   }
//   private _createDateRange(date: D | null): DateRange<D> {
//     if (date) {
//       const start = this._dateAdapter.addCalendarDays(date, 0);
//       const end = this._dateAdapter.addCalendarDays(date, this.inventoryPeriod);
//       return new DateRange<D>(start, end);
//     }
//     return new DateRange<D>(null, null);
//   }
// }

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit, OnDestroy {
  constructor(
    private _locationService: LocationService,
    private _router: Router,
    private _store: Store<fromAppStore.AppState>
  ) {}

  private _userAuthSub: Subscription;
  private _locationStoreSub: Subscription;

  user: User;
  userRole: string;
  userDept: string;

  locationState: LocationState;
  locationStateError: string;
  activeLocation: Location;
  inventoryData: any[];
  inventoryDataPopulated: Inventory[];
  workingInventory: any;
  workingInventoryItems: any;

  loading: boolean;

  locationProducts: any[];
  newInventoryProducts: any[] = [];
  initInvProducts = true;
  initLocInventories = true;

  selectedProducts: Product[] = [];
  activeProducts: Product[] = [];

  displayedColumns: string[];
  dataSource: MatTableDataSource<Inventory>;

  pastInventoryUpdateForm: FormGroup;
  // inventoryValue: number;
  formIsFinal = false;
  formError: string;

  inventoryPeriod = BusinessInventoryPeriod - 1;

  ngOnInit(): void {
    console.clear();

    this._userAuthSub = this._store
      .select('auth')
      .pipe(map((authState) => authState.userAuth))
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

        // IF USER HAS AT LEAST ONE ACTIVATED LOCATION
        if (
          locState.activeLocation &&
          locState.activeLocation.productList &&
          locState.activeLocation.productList.length > 0
        ) {
          this.locationProducts = locState.activeLocation.productList;
          this.inventoryData = locState.activeLocation.inventoryData;
          this.inventoryDataPopulated = locState.activeLocationInventories;
          this.displayedColumns = [
            'category',
            'product name',
            'department',
            'unit',
            'case size',
            'packs par',
            'in stock',
            'inventory value',
          ];
          this.dataSource = new MatTableDataSource(this.inventoryDataPopulated);

          // AND POPULATED INVENTORIES ARE NOT ALREADY FETCHED SINCE LAST RELOAD
          if (this.initLocInventories) {
            this._onGetPopulatedInventories();
          }

          // IF THERE'S A DRAFT WORKING INVENTORY, INITIALIZE THAT TOO
          if (this.workingInventory) {
            this.workingInventoryItems = this.workingInventory.inventory;
            // this._initPastInventoryUpdateForm();
          }
        }

        console.group(
          '%cLocation State',
          `font-size: 1rem;
           color: lightgreen;`,
          locState
        );
        console.groupEnd();
      });
  }

  // GET AND STORE A POPULATED LIST OF THIS LOCATION'S INVENTORIES
  private _onGetPopulatedInventories() {
    this._locationService.getPopulatedInventories(
      this.initLocInventories,
      this.inventoryData,
      this.locationState.activeLocation._id
    );
    console.log(this.inventoryDataPopulated);
    this.initLocInventories = false;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  setProductList() {
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
