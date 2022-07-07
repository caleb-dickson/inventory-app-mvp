import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { User } from 'src/app/users/user.model';
import { Router } from '@angular/router';
import { Inventory } from '../../../../models/inventory.model';

import { LocationService } from '../../../../core-control/location.service';
import { InventoryService } from '../../../../core-control/inventory.service';
import { BusinessInventoryPeriod } from '../../../../models/business.model';
import { MatRadioChange } from '@angular/material/radio';

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

export interface InventoryFormData {
  inventoryForm: FormGroup;
  saveNew: boolean;
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

  @Output() inventoryFormSubmitted = new EventEmitter<InventoryFormData>();

  private _userAuthSub: Subscription;
  private _locationStoreSub: Subscription;

  user: User;
  userRole: string;
  userDept: string;

  /**
   * Needed for `User`s with a department of `admin` to determine
   * which department to create a new inventory for.
   */
  @Input() formDept: string;
  @Input() invFormMode: string;

  locationState: LocationState;
  locationStateError: string;
  activeLocation: Location;
  inventoryData: any[];
  inventoryDataPopulated: Inventory[];
  @Input() draftInventory: Inventory;
  draftInventoryItems: any;

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

  ngOnInit(): void {
    // console.clear();
    console.log(this.formDept);

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

        // IF USER HAS AT LEAST ONE ACTIVATED LOCATION
        if (locState.activeLocation?.productList.length > 0) {
          this.locationProducts = locState.activeLocation.productList;
          this.inventoryData = locState.activeLocation.inventoryData;
          this.inventoryDataPopulated = locState.activeLocationInventories;

          // IF THERE'S A DRAFT WORKING INVENTORY, INITIALIZE THAT TOO
          if (this.draftInventory) {
            this.draftInventoryItems = this.draftInventory.inventory;
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
    this._initInventoryForm();
  }

  onResetInventoryForm(): void {
    // this.inventoryForm.reset();
    this._initInventoryForm();
  }

  /**
   * Sets `inventoryForm` control `isFinal` to `true` or
   * `false` based on user input.
   * @param $event
   */
  onSaveTypeSelect($event: MatRadioChange) {
    this.inventoryForm.get('isFinal').setValue($event.value);
    console.log(this.inventoryForm.value);
  }

  /**
   * ### Outputs an `EventEmitter<InventoryFormData>` to the parent component of `<app-inventory-form>`
   * ###
   *
   * @param formData Is an Object of `InventoryFormData`
   *  ```
   * interface InventoryFormData {
   * inventoryForm: FormGroup;
   * saveNew: boolean;
   * }
   * ```
   */
  onInventorySubmit(formData: InventoryFormData): void {
    console.log(formData);
    this.inventoryFormSubmitted.emit(formData);
  }

  /**
   * In a future update, initializes the form depending on the form mode.
   */
  private _initInventoryForm(): void {
    console.log(this.invFormMode);
    if (this.invFormMode === 'new') {
      let start = new Date();
      let beginDate = start.getDate() - this.inventoryPeriod;
      beginDate = start.setDate(beginDate);

      let items = new FormArray([]);

      for (const product of this.inventoryProducts) {
        items.push(
          new FormGroup({
            product: new FormControl(product.product, Validators.required),
            quantity: new FormControl(null),
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
    } else {
      console.log(this.invFormMode);

      let items = new FormArray([]);

      for (const product of this.inventoryProducts) {
        items.push(
          new FormGroup({
            product: new FormControl(product.product, Validators.required),
            quantity: new FormControl(product.quantity),
          })
        );
      }

      this.inventoryForm = new FormGroup({
        dateStart: new FormControl(
          this.draftInventory.dateStart,
          Validators.required
        ),
        dateEnd: new FormControl(
          this.draftInventory.dateEnd,
          Validators.required
        ),
        department: new FormControl(
          this.draftInventory.department,
          Validators.required
        ),
        isFinal: new FormControl(
          this.draftInventory.isFinal,
          Validators.required
        ),
        inventory: items,
      });
    }
  }

  get inventoryItemControls() {
    if (this.inventoryForm) {
      return (<FormArray>this.inventoryForm.get('inventory')).controls;
    }
  }
}
