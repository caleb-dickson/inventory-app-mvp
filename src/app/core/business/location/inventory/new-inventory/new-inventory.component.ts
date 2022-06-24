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
import { DateAdapter } from '@angular/material/core';

import { Store } from '@ngrx/store';
import { LocationState } from '../../location-store/location.reducer';
import * as fromAppStore from '../../../../../app-store/app.reducer';
import * as LocationActions from '../../location-store/location.actions';

import { map, Subscription } from 'rxjs';

import { Location } from '../../../../models/location.model';
import { Product } from '../../../../models/product.model';
import { User } from 'src/app/users/user-control/user.model';
import { Router } from '@angular/router';
import { Inventory } from '../../../../models/inventory.model';

import { LocationService } from '../../../../core-control/location.service';
import { InventoryService } from '../../../../core-control/inventory.service';
import { BusinessInventoryPeriod } from '../../../../models/business.model';

@Injectable()
export class RangeSelectionStrategy<D>
  implements MatDateRangeSelectionStrategy<D>
{
  inventoryPeriod = BusinessInventoryPeriod - 1;

  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D | null): DateRange<D> {
    return this._createDateRange(date);
  }
  createPreview(activeDate: D | null): DateRange<D> {
    return this._createDateRange(activeDate);
  }
  private _createDateRange(date: D | null): DateRange<D> {
    if (date) {
      const start = this._dateAdapter.addCalendarDays(date, 0);
      const end = this._dateAdapter.addCalendarDays(date, this.inventoryPeriod);
      return new DateRange<D>(start, end);
    }
    return new DateRange<D>(null, null);
  }
}

@Component({
  selector: 'app-new-inventory',
  templateUrl: './new-inventory.component.html',
  styleUrls: ['./new-inventory.component.scss'],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: RangeSelectionStrategy,
    },
  ],
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

  locLoading: boolean;

  locationProducts: any[];
  newInventoryProducts: any[] = [];
  initInvProducts = true;
  initLocInventories = true;

  selectedProducts: Product[] = [];
  activeProducts: Product[] = [];

  newInventoryForm: FormGroup;
  draftInventoryForm: FormGroup;
  inventoryPeriod = BusinessInventoryPeriod - 1;
  formIsFinal = false;
  formError: string;

  ngOnInit() {
    console.clear();

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

          // // AND POPULATED INVENTORIES ARE NOT ALREADY FETCHED SINCE LAST RELOAD
          // if (this.initLocInventories) {
          //   this._onGetPopulatedInventories();
          // }

          // IF PRODUCTS ARE NEEDED AND USER ISN'T AN ADMIN
          if (this.initInvProducts && this.userDept !== 'admin') {
            // SET PRODUCTS TO ONLY USER'S DEPT PRODUCTS
            this.setProductList(false);
          } else {
            // OTHERWISE USER HAS ACCESS TO ALL ACTIVE LOCATION PRODUCTS
            this.setProductList(true);
          }

          // IF THERE'S A DRAFT WORKING INVENTORY, INITIALIZE THAT TOO
          if (this.workingInventory) {
            this.workingInventoryItems = this.workingInventory.inventory;
            this._initDraftInventoryForm();
          }
        }

        console.group('%cLocation State', 'font-size: 1rem', locState);
        console.groupEnd();
      });
    console.log(this.newInventoryProducts);
  }

  // GET AND STORE A POPULATED LIST OF THIS LOCATION'S INVENTORIES
  // private _onGetPopulatedInventories() {
  //   this._locationService.getPopulatedInventories(
  //     this.initLocInventories,
  //     this.inventoryData
  //   );
  //   this.initLocInventories = false;
  // }

  setProductList(isAdmin: boolean) {
    if (isAdmin && this.initInvProducts) {
      for (const product of this.locationState.activeLocation.productList) {
        if (product.product.isActive) {
          this.newInventoryProducts.push(product);
        }
      }
      // NOW WE CAN INITIALIZE THE NEW INV FORM HAVING DEFINED AN
      // ACCURATE PRODUCT LIST
      this._initNewInventoryForm();
    } else if (!isAdmin && this.initInvProducts) {
      for (const product of this.locationState.activeLocation.productList) {
        let productDept = product.product.department;
        if (
          productDept === this.user.userProfile.department &&
          product.product.isActive
        ) {
          this.newInventoryProducts.push(product);
        }
      }
      // NOW WE CAN INITIALIZE THE NEW INV FORM HAVING DEFINED AN
      // ACCURATE PRODUCT LIST
      this._initNewInventoryForm();
    }
    this.initInvProducts = false;
  }

  onResetNewInventoryForm() {
    this.newInventoryForm.reset();
  }

  onResetDraftInventoryForm() {
    this.draftInventoryForm.reset();
    // console.log(this.workingInventory);
    // console.log(this.workingInventoryItems);
    // this._initDraftInventoryForm();
  }

  onInventorySubmit(newInventoryForm: NgForm, saveNew: boolean) {
    console.log(newInventoryForm);
    console.log(saveNew);
    this._inventoryService.saveInventory(
      newInventoryForm,
      this.activeLocation,
      this.userDept,
      saveNew
    );
    this._router.navigate(['/app/dashboard']);
  }

  // FOR EXISTING INV DRAFT DOCS
  onDraftInventorySubmit(draftInventoryForm: NgForm) {
    if (draftInventoryForm.invalid) {
      this._store.dispatch(
        LocationActions.LocationError({ errorMessage: 'Form Invalid' })
      );
    } else {
      console.log(draftInventoryForm.value);
    }
    console.log(this.draftInventoryForm.value);

    this._store.dispatch(
      LocationActions.PUTUpdateInventoryForLocationStart({
        inventory: draftInventoryForm.value,
      })
    );

    localStorage.removeItem('inventoryData');

    this._router.navigate(['/app/dashboard']);
  }

  private _initNewInventoryForm() {
    let start = new Date();
    let beginDate = start.getDate() - this.inventoryPeriod;
    beginDate = start.setDate(beginDate);

    let items = new FormArray([]);

    console.log(this.newInventoryProducts);
    for (const product of this.newInventoryProducts) {
      items.push(
        new FormGroup({
          product: new FormControl(product.product, Validators.required),
          quantity: new FormControl(0),
        })
      );
    }

    this.newInventoryForm = new FormGroup({
      dateStart: new FormControl(start, Validators.required),
      dateEnd: new FormControl(new Date(), Validators.required),
      department: new FormControl(this.userDept, Validators.required),
      isFinal: new FormControl(this.formIsFinal, Validators.required),
      inventory: items,
    });
  }

  private _initDraftInventoryForm() {
    let items = new FormArray([]);

    for (const item of this.workingInventory.inventory) {
      let productId = item.product._id;
      let quantity = item.quantity;

      items.push(
        new FormGroup({
          product: new FormControl(productId, Validators.required),
          quantity: new FormControl(quantity),
        })
      );
    }

    this.draftInventoryForm = new FormGroup({
      _id: new FormControl(this.workingInventory._id),
      dateStart: new FormControl(
        this.workingInventory.dateStart,
        Validators.required
      ),
      dateEnd: new FormControl(
        this.workingInventory.dateEnd,
        Validators.required
      ),
      department: new FormControl(
        this.workingInventory.department,
        Validators.required
      ),
      isFinal: new FormControl(
        this.workingInventory.isFinal,
        Validators.required
      ),
      inventory: items,
    });
    console.log(this.draftInventoryForm.value);
    console.log(this.draftInventoryItemControls);
  }

  // GETS AND HOLDS THE LIST OF NEWInventoryForm CONTROLS
  get newInventoryItemControls() {
    return (<FormArray>this.newInventoryForm.get('inventory')).controls;
  }

  // GETS AND HOLDS THE LIST OF DRAFTInventoryItemControls CONTROLS
  get draftInventoryItemControls() {
    return (<FormArray>this.draftInventoryForm.get('inventory')).controls;
  }

  ngOnDestroy(): void {
    this._userAuthSub.unsubscribe();
    this._locationStoreSub.unsubscribe();
  }
}
