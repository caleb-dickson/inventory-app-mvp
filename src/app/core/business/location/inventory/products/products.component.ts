import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../app-store/app.reducer';
import * as LocationActions from '../../location-store/location.actions';
import { LocationState } from '../../location-store/location.reducer';

import { map, Observable, Subject, Subscription } from 'rxjs';

import { Location } from '../../../../models/location.model';

import { Product } from '../../../../models/product.model';

import { LocationService } from '../../../../core-control/location.service';
import { User } from 'src/app/users/user-control/user.model';
import { ProductsService } from './products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit, OnDestroy {
  constructor(
    private store: Store<fromAppStore.AppState>,
    private locationService: LocationService,
    private _productsService: ProductsService
  ) {}

  private _userAuthSub: Subscription;
  private _locationStoreSub: Subscription;
  private _businessStoreLoadingSub: Subscription;
  private _updateProductSub: Subscription;
  private _productFormModeSub: Subscription;
  private _productEditDialogStatus: Subscription;

  user: User;
  userRole: string;
  userDept: string;

  bizLoading: boolean;
  locLoading: boolean;

  newProductForm: NgForm;
  productFormMode: string = 'new';
  updateProduct: Product;

  productUpdateForm: NgForm;

  locationState: LocationState;
  activeLocation: Location;
  activeProducts: Product[] = [];

  productName: string = null;

  ngOnInit() {
    console.clear();

    this._updateProductSub = this._productsService.$updateProduct.subscribe(
      (product) => {
        this.updateProduct = product;
      }
    );

    this._productFormModeSub = this._productsService.$productFormMode.subscribe(
      (mode) => {
        this.productFormMode = mode;
      }
    );

    this._productEditDialogStatus =
      this._productsService.$productEditDialogStatus.subscribe((status) => {

      });

    this._userAuthSub = this.store
      .select('user')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.user = user;
        this.userDept = user?.userProfile?.department;
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
        console.group(
          '%cLocation State',
          `font-size: 1rem;
            color: lightgreen;`,
          locState
        );
        console.groupEnd();
      });

    this._businessStoreLoadingSub = this.store
      .select('business')
      .pipe(map((bizState) => bizState.loading))
      .subscribe((loading) => (this.bizLoading = loading));
  }

  onNewProductSubmit(newProductForm: any) {
    console.log(newProductForm);
    console.log(newProductForm?.value);

    if (!newProductForm.valid) {
      return;
    }

    // this.store.dispatch(
    //   LocationActions.POSTCreateProductForLocationStart({
    //     product: {
    //       _id: null,
    //       parentOrg: this.activeLocation._id,
    //       isActive: this.productStatusInput === 'Active' ? true : false,
    //       department: this.user.userProfile.department,
    //       category: newProductForm.value.category,
    //       name: newProductForm.value.name,
    //       unitSize: newProductForm.value.unitSize,
    //       unitMeasure: newProductForm.value.unit,
    //       unitsPerPack: newProductForm.value.unitsPerPack,
    //       packsPerCase: newProductForm.value.packsPerCase,
    //       casePrice: newProductForm.value.casePrice,
    //       par: newProductForm.value.par,
    //     },
    //     locationId: this.activeLocation._id,
    //   })
    // );
    // newProductForm.reset();
  }

  onProductUpdateSubmit(productUpdateForm: NgForm) {
    console.log(productUpdateForm);
    console.log(productUpdateForm.value);
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

  onEditProduct(product: Product) {
    this._productsService.editProduct();
    console.log(product);
    this._productsService.setFormMode('update');
    this._productsService.setUpdateProduct(product);
  }

  // onDeleteSelectedProducts() {
  //   this.selectedProducts = [];
  // }

  ngOnDestroy(): void {
    this._businessStoreLoadingSub.unsubscribe();
    this._locationStoreSub.unsubscribe();
    this._userAuthSub.unsubscribe();
    this._productEditDialogStatus.unsubscribe();
    this._productFormModeSub.unsubscribe();
    this._updateProductSub.unsubscribe();
  }
}
