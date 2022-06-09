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
import { User } from 'src/app/auth/auth-control/user.model';

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

  user: User;
  userRole: string;

  bizLoading: boolean;

  locationState: LocationState;
  activeLocation: Location;
  activeProducts: Product[] = [];

  productCategories: ProductCategories;
  defaultUnits: UnitsCategories;

  productName: string = null;


  ngOnInit() {
    this.productCategories = defaultCategories;
    this.defaultUnits = defaultUnits;

    this.userAuthSub = this.store
    .select('auth')
    .pipe(map((authState) => authState.userAuth))
    .subscribe((user) => {
      console.log(user);
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

  onProductNameInput(name: string) {
    console.log(name);
    this.productName = name;
  }

  onResetForm(form: NgForm) {
    form.reset();
  }

  onNewProductSubmit(newProductForm: NgForm) {
    console.log(newProductForm);
    console.log(newProductForm.value);

    if (!newProductForm.valid) {
      return;
    }

    this.store.dispatch(
      LocationActions.POSTCreateProductForLocationStart({
        product: {
          _id: null,
          parentOrg: this.activeLocation._id,
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
    this.locationService.selectProducts(checked, [...this.activeProducts], product);
    // LOG THE CURRENT STATE FOR CONFIRMATION
    console.log(this.activeProducts) // COMPONENT COPY
    console.log(this.locationState.activeProducts); // STORE DATA
  }

  // onDeleteSelectedProducts() {
  //   this.selectedProducts = [];
  // }
}
