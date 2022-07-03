import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { Product } from 'src/app/core/models/product.model';
import { ProductEditComponent } from 'src/app/core/dialog/product-edit/product-edit.component';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  $updateProduct = new BehaviorSubject<Product>(null);
  $productFormMode = new BehaviorSubject<string>('new');

  constructor(private _dialog: MatDialog) {}

  setUpdateProduct(updateProduct: Product) {
    this.$updateProduct.next(updateProduct);
  }

  setFormMode(mode: string) {
    this.$productFormMode.next(mode);
  }

  editProduct() {
    this._dialog.open(ProductEditComponent);
  }
}
