import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../app-store/app.reducer';
import * as LocationActions from '../../navigation/business/location/location-store/location.actions';

import { ProductsService } from '../../inventory-app-control/products.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
})
export class ProductEditComponent implements OnInit {
  constructor(
    private _productsService: ProductsService,
    private _dialog: MatDialog,
    private _store: Store<fromAppStore.AppState>
  ) {}

  private _updateProductSub: Subscription;
  private _productFormModeSub: Subscription;

  productFormMode: string = 'update';
  updateProduct: Product;

  ngOnInit(): void {
    this._updateProductSub = this._productsService.$updateProduct.subscribe(
      (product) => {
        this.updateProduct = product;
        console.log(this.updateProduct);
      }
    );

    this._productFormModeSub = this._productsService.$productFormMode.subscribe(
      (mode) => {
        this.productFormMode = mode;
        console.log(this.productFormMode);
      }
    );
  }

  onProductUpdateSubmit(productForm: FormGroup) {
    console.log(productForm);
    console.log(productForm.value);
    this._store.dispatch(
      LocationActions.PUTUpdateProductForLocationStart({
        product: productForm.value,
      })
    );
    this._dialog.closeAll();
  }

  onCloseDialog() {
    this._dialog.closeAll();
  }
}
