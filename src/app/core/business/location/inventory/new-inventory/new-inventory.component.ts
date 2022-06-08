import { Component, Injectable, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../app-store/app.reducer';
import * as LocationActions from '../../location-store/location.actions';
import { LocationState } from '../../location-store/location.reducer';

import { map, Subscription } from 'rxjs';

import { Location } from '../../../business-control/location.model';
import { Product } from '../../../business-control/product.model';

import { LocationService } from '../../location-control/location.service';
import { User } from 'src/app/auth/auth-control/user.model';

// THIS WILL BE SET BY THE BUSINESS OWNER IN THE FUTURE, FOR ALL LOCATIONS
// Example: a two-week inventory period
const businessInventoryPeriod = 14;

@Injectable()
export class RangeSelectionStrategy<D>
  implements MatDateRangeSelectionStrategy<D>
{
  inventoryPeriod = businessInventoryPeriod - 1;

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
export class NewInventoryComponent implements OnInit {
  constructor(
    private locationService: LocationService,
    private store: Store<fromAppStore.AppState>
  ) {}

  private userAuthSub: Subscription;
  private locationStoreSub: Subscription;

  user: User;
  userRole: string;

  locationState: LocationState;
  activeLocation: Location;

  loading: boolean;

  locationProducts: any[];

  selectedProducts: Product[] = [];
  activeProducts: Product[] = [];

  inventoryForm: FormGroup;
  inventoryValue: number;

  inventoryPeriod = businessInventoryPeriod;

  ngOnInit() {
    this.userAuthSub = this.store
      .select('auth')
      .pipe(map((authState) => authState.userAuth))
      .subscribe((user) => {
        console.log(user);
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
        }
        console.log(this.userRole);
      });

    this.locationStoreSub = this.store
      .select('location')
      .subscribe((locState) => {
        console.log(locState);
        this.locationState = locState;
        this.loading = locState.loading;
        this.activeProducts = locState.activeProducts;
        this.activeLocation = locState.activeLocation;
        if (
          locState.activeLocation &&
          locState.activeLocation.productList &&
          locState.activeLocation.productList.length > 0
          ) {
          this.locationProducts = locState.activeLocation.productList;
          this.initInventoryForm();
          console.log(this.locationProducts);
          console.log(this.inventoryControls);
          console.log(this.activeLocation);
        }
      });
      console.log(this.userRole);
  }

  // onProductSelect(checked: boolean, product: Product) {
  //   this.locationService.selectProducts(
  //     checked,
  //     [...this.activeProducts],
  //     product
  //   );
  //   // LOG THE CURRENT STATE FOR CONFIRMATION
  //   console.log(this.activeProducts); // COMPONENT COPY
  //   console.log(this.locationState.activeProducts); // STORE DATA
  // }

  // onProductSelect() {}

  onInventorySubmitDraft() {
    if (this.inventoryForm.invalid) {
      this.store.dispatch(
        LocationActions.LocationError({ errorMessage: 'Form Invalid' })
      );
    }

    console.log(this.inventoryForm.value);
  }

  onInventorySubmitFinal() {
    if (this.inventoryForm.invalid) {
      this.store.dispatch(
        LocationActions.LocationError({ errorMessage: 'Form Invalid' })
      );
    }

    console.log(this.inventoryForm.value);
  }

  // GETS AND HOLDS THE LIST OF inventoryForm CONTROLS

  private initInventoryForm() {
    let items = new FormArray([]);

    // THIS LOOP MAY NEED TO HAPPEN IN THE TEMPLATE
    for (const product of this.locationProducts) {
      let productId = product.product._id;
      let quantity: number;

      items.push(
        new FormGroup({
          product: new FormControl(productId, Validators.required),
          quantity: new FormControl(quantity, Validators.required),
        })
      );
      console.log(items);
    }
    this.inventoryForm = new FormGroup({
      dateStart: new FormControl(null, Validators.required),
      dateEnd: new FormControl(null, Validators.required),
      department: new FormControl(null, Validators.required),
      isFinal: new FormControl(false, Validators.required),
      inventory: items,
    });
    console.log(this.inventoryForm.value);
  }

  get inventoryControls() {
    return (<FormArray>this.inventoryForm.get('inventory')).controls;
  }
}
