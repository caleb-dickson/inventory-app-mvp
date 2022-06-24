import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../app-store/app.reducer';
import * as LocationActions from '../../location-store/location.actions';
import { LocationState } from '../../location-store/location.reducer';

import { map, Subscription } from 'rxjs';

import { Location } from '../../../../models/location.model';
import {
  defaultCategories,
  ProductCategories,
} from '../../../../models/product-categories.model';
import { defaultUnits, UnitsCategories } from '../../../../models/units-list.model';
import { Product } from '../../../../models/product.model';

import { LocationService } from '../../../../core-control/location.service';
import { User } from 'src/app/users/user-control/user.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit, OnDestroy {
  constructor(
    private store: Store<fromAppStore.AppState>,
    private locationService: LocationService
  ) {}

  private _userAuthSub: Subscription;
  private _locationStoreSub: Subscription;
  private _businessStoreLoadingSub: Subscription;

  user: User;
  userRole: string;

  bizLoading: boolean;
  locLoading: boolean;

  newProductForm: NgForm;

  locationState: LocationState;
  activeLocation: Location;
  activeProducts: Product[] = [];

  productCategories: ProductCategories;
  defaultUnits: UnitsCategories;

  productName: string = null;
  productStatusInput = 'Active';

  ngOnInit() {
    console.clear();

    this.productCategories = defaultCategories;
    this.defaultUnits = defaultUnits;

    this._userAuthSub = this.store
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
        }
      });

    this._locationStoreSub = this.store
      .select('location')
      .subscribe((locState) => {
        this.locationState = locState;
        this.activeLocation = locState.activeLocation;
        this.activeProducts = locState.activeProducts;
        this.locLoading = locState.loading;
        console.group('%cLocation State', 'font-size: 1rem', locState);
        console.groupEnd();
      });

    this._businessStoreLoadingSub = this.store
      .select('business')
      .pipe(map((bizState) => bizState.loading))
      .subscribe((loading) => (this.bizLoading = loading));
  }

  onProductNameInput(name: string) {
    console.log(name);
    this.productName = name;
  }

  onProductStatusSelect(checked: boolean) {
    checked
      ? (this.productStatusInput = 'Active')
      : (this.productStatusInput = 'Inactive');
  }

  onResetForm(form: NgForm) {
    form.reset();
  }

  onNewProductSubmit(newProductForm: NgForm) {
    console.log(newProductForm);
    console.log(newProductForm.value);
    console.log(this.productStatusInput);

    if (!newProductForm.valid) {
      return;
    }

    this.store.dispatch(
      LocationActions.POSTCreateProductForLocationStart({
        product: {
          _id: null,
          parentOrg: this.activeLocation._id,
          isActive: this.productStatusInput === 'Active' ? true : false,
          department: this.user.userProfile.department,
          category: newProductForm.value.category,
          name: newProductForm.value.name,
          unitSize: newProductForm.value.unitSize,
          unitMeasure: newProductForm.value.unit,
          unitsPerPack: newProductForm.value.unitsPerPack,
          packsPerCase: newProductForm.value.packsPerCase,
          casePrice: newProductForm.value.casePrice,
          par: newProductForm.value.par,
        },
        locationId: this.activeLocation._id,
      })
    );
    newProductForm.reset();
  }

  onProductSelect(checked: boolean, product: Product) {
    this.locationService.selectProducts(
      checked,
      [...this.activeProducts],
      product
    );
    // LOG THE CURRENT STATE FOR CONFIRMATION
    console.log(this.activeProducts); // COMPONENT COPY
    console.log(this.locationState.activeProducts); // STORE DATA
  }

  // onDeleteSelectedProducts() {
  //   this.selectedProducts = [];
  // }

  ngOnDestroy(): void {
      this._businessStoreLoadingSub.unsubscribe();
      this._locationStoreSub.unsubscribe();
      this._userAuthSub.unsubscribe();
  }

}
