import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../../app-store/app.reducer';
import * as LocationActions from '../../location-store/location.actions';
import { LocationState } from '../../location-store/location.reducer';

import { map, Subscription } from 'rxjs';

import { Location } from '../../../../../models/location.model';
import { Product } from '../../../../../models/product.model';
import { User } from 'src/app/users/user.model';

import { LocationService } from '../../../../../inventory-app-control/location.service';
import { ProductsService } from '../../../../../inventory-app-control/products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit, OnDestroy {
  constructor(
    private _store: Store<fromAppStore.AppState>,
    private _locationService: LocationService,
    private _productsService: ProductsService // private _matExpansion: MatExpansionPanel
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

  loading = false;

  matExpanded: boolean;
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
      this._productsService.$productEditDialogStatus.subscribe((status) => {});

    this._userAuthSub = this._store
      .select('user')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.user = user;
        this.userDept = user?.department;
        if (!!user) {
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
        }
      });

    this._locationStoreSub = this._store
      .select('location')
      .subscribe((locState) => {
        this.locationState = locState;
        this.activeLocation = locState.activeLocation;
        this.activeProducts = locState.activeProducts;
        this.loading = locState.loading;

        console.group(
          '%cLocation State',
          `font-size: 1rem;
            color: lightgreen;`,
          locState
        );
        console.groupEnd();
      });

    this._businessStoreLoadingSub = this._store
      .select('business')
      .pipe(map((bizState) => bizState.loading))
      .subscribe((loading) => (this.loading = loading));
  }

  onNewProductSubmit(newProductForm: FormGroup) {
    console.log(newProductForm);
    console.log(newProductForm?.value);

    if (!newProductForm.valid) {
      return;
    }

    this._store.dispatch(
      LocationActions.POSTCreateProductForLocationStart({
        product: {
          id: null,
          createdAt: null,
          updatedAt: null,
          name: newProductForm.value.name,
          department: newProductForm.value.department,
          category: newProductForm.value.category,
          isActive: newProductForm.value.isActive,
          unitSize: newProductForm.value.unitSize,
          unitSingular: newProductForm.value.unitMeasure.singular,
          unitPlural: newProductForm.value.unitMeasure.plural,
          unitsPerPack: newProductForm.value.unitsPerPack,
          packsPerCase: newProductForm.value.packsPerCase,
          casePrice: newProductForm.value.casePrice,
          par: newProductForm.value.par,
          photo: null,
          location: this.activeLocation.id,
        },
        locationId: this.activeLocation.id,
      })
    );
  }

  onProductSelect(checked: boolean, product: Product) {
    this._locationService.selectProducts(
      checked,
      [...this.activeProducts],
      product
    );

    console.log(this.activeProducts);
  }

  onEditProduct(product: Product) {
    this._productsService.editProduct();
    console.log(product);
    this._productsService.setFormMode('update');
    this._productsService.setUpdateProduct(product);
  }

  onDeleteOne(productId: string) {
    this._store.dispatch(
      LocationActions.POSTDeleteProductsFromLocationStart({
        productIds: [productId],
        locationId: this.activeLocation.id,
      })
    );
  }

  onDeleteSelected() {
    let srcArr: any[] = [];
    let prodArr: string[] = [];

    srcArr = this.activeProducts;

    for (const product of srcArr) {
      prodArr.push(product.product.id);
    }

    console.log(prodArr);

    this._store.dispatch(
      LocationActions.POSTDeleteProductsFromLocationStart({
        productIds: prodArr,
        locationId: this.activeLocation.id,
      })
    );

    this._store.dispatch(LocationActions.ActivateProducts({ products: [] }));
  }

  ngOnDestroy(): void {
    this._businessStoreLoadingSub.unsubscribe();
    this._locationStoreSub.unsubscribe();
    this._userAuthSub.unsubscribe();
    this._productEditDialogStatus.unsubscribe();
    this._productFormModeSub.unsubscribe();
    this._updateProductSub.unsubscribe();
  }
}
