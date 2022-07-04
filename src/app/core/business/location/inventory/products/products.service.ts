import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { Product } from 'src/app/core/models/product.model';
import { ProductEditComponent } from 'src/app/core/dialog/product-edit/product-edit.component';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {

  private _onDialogClose: Subscription;

  $updateProduct = new BehaviorSubject<Product>(null);
  $productFormMode = new BehaviorSubject<string>('new');
  $productEditDialogStatus = new BehaviorSubject<string>(null);

  constructor(private _dialog: MatDialog) {
    this._onDialogClose = this._dialog.afterAllClosed.subscribe((event) => {
      this.$productEditDialogStatus.next('closed');
      this.$productFormMode.next('new');
      this.$updateProduct.next(null);
    });
  }

  setUpdateProduct(updateProduct: Product) {
    this.$updateProduct.next(updateProduct);
  }

  setFormMode(mode: string) {
    this.$productFormMode.next(mode);
  }

  editProduct() {
    this.$productEditDialogStatus.next('open');
    this._dialog.open(ProductEditComponent, {
      maxHeight: '98vh',
      maxWidth: '98vw'
    });
  }
}
