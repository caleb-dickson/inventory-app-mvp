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
import * as fromAppStore from '../../../../../../app-store/app.reducer';

import { map, Subscription } from 'rxjs';

import { Location } from '../../../../../models/location.model';
import { Product } from '../../../../../models/product.model';
import { User } from 'src/app/users/user.model';
import { Router } from '@angular/router';
import { Inventory } from '../../../../../models/inventory.model';

import { LocationService } from '../../../../../inventory-app-control/location.service';
import { InventoryService } from '../../../../../inventory-app-control/inventory.service';
import { MatRadioChange } from '@angular/material/radio';

@Injectable()
export class RangeSelectionStrategy<D>
  implements MatDateRangeSelectionStrategy<D>
{
  inventoryPeriod = this;

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
      const end = this._dateAdapter.addCalendarDays(date, 13);
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
export class InventoryFormComponent implements OnInit, OnDestroy {
  private _userAuthSub: Subscription;
  private _locationStoreSub: Subscription;
  private _activeDepartmentProductsSub: Subscription;

  @Output() inventoryFormSubmitted = new EventEmitter<FormGroup>();

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
  inventoryProducts: any[];
  initInvProducts = true;
  initLocInventories = true;

  selectedProducts: Product[] = [];
  activeProducts: Product[] = [];

  inventoryForm: FormGroup;
  inventoryPeriod: number;
  formIsFinal = false;
  formError: string;

  constructor(
    private _store: Store<fromAppStore.AppState>,
    private _router: Router,
    private _locationService: LocationService,
    private _inventoryService: InventoryService
  ) {}

  ngOnInit(): void {
    this._userAuthSub = this._store
      .select('user')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.user = user;
        if (user) {
          switch (user.role) {
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
          this.userDept = user.department;
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
        if (locState.activeLocation?.products.length > 0) {
          this.locationProducts = locState.activeLocation.products;
          this.inventoryData = locState.activeLocation.inventories;
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

        this._activeDepartmentProductsSub =
        this._inventoryService.$activeDepartmentProducts.subscribe(
          (products) => {
            this.inventoryProducts = products;
            console.log(products);
            this._initInventoryForm(products);
          }
        );
        console.log(this.inventoryProducts)

  }

  ngOnDestroy(): void {
    this._userAuthSub.unsubscribe();
    this._locationStoreSub.unsubscribe();
  }

  onResetInventoryForm(): void {
    this._initInventoryForm(this.inventoryProducts);
  }

  /**
   * Sets `inventoryForm` control `isFinal` to `true` or
   * `false` based on user input.
   * @param $event
   */
  onSaveTypeSelect($event: MatRadioChange) {
    this.inventoryForm.get('isFinal').setValue($event.value);
  }

  onInventorySubmit(): void {
    console.log(this.inventoryForm);
    this.inventoryFormSubmitted.emit(this.inventoryForm);
    this.inventoryForm.reset();
    this._initInventoryForm(this.inventoryProducts);
  }

  private _initInventoryForm(products: Product[]): void {
    console.log(this.invFormMode);
    console.log(products)
    if (this.invFormMode === 'new') {
      let start = new Date();
      let beginDate = start.getDate() - this.inventoryPeriod;
      beginDate = start.setDate(beginDate);

      let items = new FormArray([]);

      for (const product of products) {
        items.push(
          new FormGroup({
            product: new FormControl(product, Validators.required),
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
      console.log(this.inventoryForm.value);
    } else {
      console.log(this.invFormMode);

      let items = new FormArray([]);

      for (const product of this.draftInventory.inventory) {
        items.push(
          new FormGroup({
            product: new FormControl(product.product, Validators.required),
            quantity: new FormControl(product.quantity),
          })
        );
      }

      this.inventoryForm = new FormGroup({
        id: new FormControl(this.draftInventory.id),
        parentLocation: new FormControl(this.draftInventory.location),
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
      console.log(this.inventoryForm.value);
    }
  }

  get inventoryItemControls() {
    if (this.inventoryForm) {
      return (<FormArray>this.inventoryForm.get('inventory')).controls;
    }
  }
}
