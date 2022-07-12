import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { Product } from 'src/app/inventory-app/models/product.model';
import { ProductEditComponent } from 'src/app/inventory-app/dialog/product-edit/product-edit.component';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private _onDialogClose: Subscription;

  $updateProduct = new BehaviorSubject<Product>(null);
  $productFormMode = new BehaviorSubject<string>('new');
  $productEditDialogStatus = new BehaviorSubject<string>(null);

  /**
   *
   * @param _dialog
   */
  constructor(private _dialog: MatDialog) {
    this._onDialogClose = this._dialog.afterAllClosed.subscribe((event) => {
      this.$productEditDialogStatus.next('closed');
      this.$productFormMode.next('new');
      this.$updateProduct.next(null);
    });
  }

  /**
   *
   * @param updateProduct: {@link Product}
   */
  setUpdateProduct(updateProduct: Product): void {
    this.$updateProduct.next(updateProduct);
  }

  /**
   *
   * @param mode
   */
  setFormMode(mode: string): void {
    this.$productFormMode.next(mode);
  }

  /**
   * Sets `$productEditDialogStatus` to 'open' and opens
   * a dialog containing `ProductEditComponent`
   *
   * {@link ProductEditComponent}
   */
  editProduct(): void {
    this.$productEditDialogStatus.next('open');
    this._dialog.open(ProductEditComponent, {
      maxHeight: '98vh',
      maxWidth: '98vw',
    });
  }
}
