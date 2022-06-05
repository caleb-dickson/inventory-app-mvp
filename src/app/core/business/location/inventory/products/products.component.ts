import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../app-store/app.reducer';
import * as LocationActions from '../../location-store/location.actions';
import { LocationState } from '../../location-store/location.reducer';

import { map, Subscription } from 'rxjs';

import { Location } from '../../../business-control/location.model';
import {
  defaultCategories,
  ProductCategories,
} from './models/product-categories.model';
import { defaultUnits, UnitsCategories } from './models/units-list.model';
import { Product } from '../../../business-control/product.model';

import { LocationService } from '../../location-control/location.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  constructor(
    private store: Store<fromAppStore.AppState>,
    private locationService: LocationService
  ) {}

  private userAuthSub: Subscription;
  private locationStoreSub: Subscription;
  private businessStoreLoadingSub: Subscription;

  userRole: string;

  locationState: LocationState;
  activeLocation: Location;

  bizLoading: boolean;

  productCategories: ProductCategories;
  defaultUnits: UnitsCategories;

  activeProducts: Product[] = [];

  ngOnInit() {
    this.productCategories = defaultCategories;
    this.defaultUnits = defaultUnits;

    this.locationStoreSub = this.store
      .select('location')
      .subscribe((locState) => {
        console.log(locState);
        this.locationState = locState;
        this.activeLocation = locState.activeLocation;
        this.activeProducts = locState.activeProducts;
      });

      this.businessStoreLoadingSub = this.store
        .select('business')
        .pipe(map((bizState) => bizState.loading))
        .subscribe((loading) => this.bizLoading = loading)

  }

  onResetForm(form: NgForm) {
    form.reset();
  }

  onNewProductSubmit(newProductForm: NgForm) {
    console.log(newProductForm.value);

    if (!newProductForm.valid) {
      return;
    }

    this.store.dispatch(
      LocationActions.POSTCreateProductForLocationStart({
        product: {
          _id: null,
          parentOrg: this.activeLocation._id,
          category: newProductForm.value.category,
          name: newProductForm.value.name,
          unitSize: newProductForm.value.unitSize,
          unit: newProductForm.value.unit,
          packSize: newProductForm.value.packSize,
          packPrice: newProductForm.value.packPrice,
          par: newProductForm.value.par,
        },
        locationId: this.activeLocation._id,
      })
    );
    newProductForm.reset();
  }

  onProductSelect(checked: boolean, product: Product) {
    this.locationService.selectProducts(checked, [...this.activeProducts], product);
    // LOG THE CURRENT STATE FOR CONFIRMATION
    console.log(this.activeProducts) // COMPONENT COPY
    console.log(this.locationState.activeProducts); // STORE DATA
  }

  // onDeleteSelectedProducts() {
  //   this.selectedProducts = [];
  // }
}
