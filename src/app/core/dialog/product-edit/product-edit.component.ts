import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ProductsService } from '../../core-control/products.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
})
export class ProductEditComponent implements OnInit {
  constructor(
    private _productsService: ProductsService,
    private _dialog: MatDialog
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
  }

  onCloseDialog() {
    this._dialog.closeAll();
  }
}
