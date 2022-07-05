import { Component, EventEmitter, Injectable, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.scss'],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: RangeSelectionStrategy,
    },
  ],
})
export class InventoryFormComponent implements OnInit {
  constructor(
    private _store: Store<fromAppStore.AppState>,
    private _router: Router,
    private _locationService: LocationService,
    private _inventoryService: InventoryService
  ) {}

  @Output() inventoryFormSubmitted =
    new EventEmitter<FormGroup>();

  private _userAuthSub: Subscription;
  private _locationStoreSub: Subscription;

  user: User;
  userRole: string;
  userDept: string;
  @Input() formDept: string;


  locationState: LocationState;
  locationStateError: string;
  activeLocation: Location;
  inventoryData: any[];
  inventoryDataPopulated: Inventory[];
  workingInventory: any;
  workingInventoryItems: any;

  locLoading: boolean;

  locationProducts: any[];
  @Input() inventoryProducts: any[];
  initInvProducts = true;
  initLocInventories = true;

  selectedProducts: Product[] = [];
  activeProducts: Product[] = [];

  inventoryForm: FormGroup;
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
        if (locState.activeLocation?.productList.length > 0) {
          this.locationProducts = locState.activeLocation.productList;
          this.inventoryData = locState.activeLocation.inventoryData;
          this.inventoryDataPopulated = locState.activeLocationInventories;

          // IF THERE'S A DRAFT WORKING INVENTORY, INITIALIZE THAT TOO
          if (this.workingInventory) {
            this.workingInventoryItems = this.workingInventory.inventory;
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
      if (this.formDept && this.inventoryProducts?.length > 0) {
        this._initInventoryForm();
      }
  }

  onResetInventoryForm() {
    this.inventoryForm.reset();
  }

  onInventorySubmit(inventoryForm: NgForm, saveNew: boolean) {

  }

  private _initInventoryForm() {
    let start = new Date();
    let beginDate = start.getDate() - this.inventoryPeriod;
    beginDate = start.setDate(beginDate);

    let items = new FormArray([]);

    for (const product of this.inventoryProducts) {
      items.push(
        new FormGroup({
          product: new FormControl(product.product, Validators.required),
          quantity: new FormControl(0),
        })
      );
    }

    this.inventoryForm = new FormGroup({
      dateStart: new FormControl(start, Validators.required),
      dateEnd: new FormControl(new Date(), Validators.required),
      department: new FormControl(this.userDept, Validators.required),
      isFinal: new FormControl(this.formIsFinal, Validators.required),
      inventory: items,
    });
  }

    // GETS AND HOLDS THE LIST OF inventoryForm CONTROLS
    get inventoryItemControls() {
      if (this.inventoryForm) {
        return (<FormArray>this.inventoryForm.get('inventory')).controls;
      }
    }

    ngOnDestroy(): void {
      this._userAuthSub.unsubscribe();
      this._locationStoreSub.unsubscribe();
    }


}
