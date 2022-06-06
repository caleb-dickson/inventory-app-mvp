import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../app-store/app.reducer';
import * as LocationActions from '../../location-store/location.actions';
import { LocationState } from '../../location-store/location.reducer';

import { map, Subscription } from 'rxjs';

import { Location } from '../../../business-control/location.model';
import { Product } from '../../../business-control/product.model';

import { LocationService } from '../../location-control/location.service';
import { User } from 'src/app/auth/auth-control/user.model';

@Component({
  selector: 'app-new-inventory',
  templateUrl: './new-inventory.component.html',
  styleUrls: ['./new-inventory.component.scss'],
})
export class NewInventoryComponent implements OnInit {
  constructor(
    private store: Store<fromAppStore.AppState>,
    private locationService: LocationService
  ) {}

  private userAuthSub: Subscription;
  private locationStoreSub: Subscription;

  user: User;
  userRole: string;

  locationState: LocationState;
  activeLocation: Location;

  loading: boolean;

  locationProducts: Product[];

  selectedProducts: Product[] = [];
  activeProducts: Product[] = [];

  inventoryForm: FormGroup;
  inventoryValue: number;

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
      });

    this.locationStoreSub = this.store
      .select('location')
      .subscribe((locState) => {
        console.log(locState);
        this.locationState = locState;
        this.loading = locState.loading;
        this.activeLocation = locState.activeLocation;
        this.activeProducts = locState.activeProducts;
        this.locationProducts = locState.activeLocation.productList;
        if (
          this.activeLocation &&
          this.locationProducts &&
          this.locationProducts.length > 0
        ) {
          this.initInventoryForm();
          console.log(this.locationProducts);
          console.log(this.inventoryControls);
          console.log(this.activeLocation);
          console.log(this.locationProducts)
        }
      });
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

  onInventorySubmit() {
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
      let productId = product._id;
      let quantity: number;

      items.push(
        new FormGroup({
          locProduct: new FormControl(productId, Validators.required),
          quantity: new FormControl(quantity, Validators.required),
        })
      );
    }
    this.inventoryForm = new FormGroup({
      inventory: items,
    });
  }

  get inventoryControls() {
    return (<FormArray>this.inventoryForm.get('inventory')).controls;
  }
}
