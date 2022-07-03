import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { map, Subscription } from 'rxjs';
import {
  defaultCategories,
  ProductCategories,
} from 'src/app/core/models/product-categories.model';
import { Product, Unit } from 'src/app/core/models/product.model';
import {
  defaultUnits,
  UnitsCategories,
} from 'src/app/core/models/units-list.model';
import { User } from 'src/app/users/user-control/user.model';
import { LocationState } from '../../../location-store/location.reducer';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../../app-store/app.reducer';
import { Location } from 'src/app/core/models/location.model';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  constructor(
    private store: Store<fromAppStore.AppState>,
    private _productsService: ProductsService
  ) {}

  private _userAuthSub: Subscription;
  private _locationStoreSub: Subscription;
  private _updateProductSub: Subscription;
  private _productFormModeSub: Subscription;

  user: User;
  userRole: string;

  bizLoading: boolean;
  locLoading: boolean;

  productForm: FormGroup;
  productFormMode: string = 'new';
  updateProduct: Product;
  @Output('productFormSubmitted') productFormSubmitted =
    new EventEmitter<FormGroup>();
  @Output('productStatusSubmit') productStatusSubmit =
    new EventEmitter<string>();

  locationState: LocationState;
  activeLocation: Location;
  activeProducts: Product[] = [];

  productCategories: ProductCategories;
  defaultUnits: UnitsCategories;
  unit: Unit;

  productName: string = null;
  productStatus = true;
  productStatusText = 'Active';

  ngOnInit(): void {
    this.productCategories = defaultCategories;
    this.defaultUnits = defaultUnits;

    this._updateProductSub = this._productsService.$updateProduct.subscribe(
      (product) => {
        this.updateProduct = product;
        console.log(this.updateProduct);
      }
    );

    this._productFormModeSub = this._productsService.$productFormMode.subscribe(
      (mode) => {
        this.productFormMode = mode;
        this.initProductForm();
        console.log(this.productFormMode);
      }
    );

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
        console.group(
          '%cLocation State',
          `font-size: 1rem;
          color: lightgreen;`,
          locState
        );
        console.groupEnd();
      });
  }

  onProductNameInput(name: string) {
    console.log(name);
    this.productName = name;
  }

  onProductStatusSelect(checked: boolean) {
    checked
      ? (this.productStatusText = 'Active')
      : (this.productStatusText = 'Inactive');
    this.productStatus = checked;
    this.productForm.get('isActive').setValue(this.productStatus);
    console.log(this.productForm.invalid);
    console.log(this.productForm.value);
  }

  onResetForm() {
    this._productsService.setFormMode('new');
    this._productsService.setUpdateProduct(null);
    this.productForm.reset();
    this.productStatusText = 'Active';
    this.productStatus = true;
    console.log(this.productStatus);
  }

  onProductSubmit() {
    this.productForm.updateValueAndValidity();
    console.log(this.productForm.valid);
    console.log(this.productForm.value);
    this.productFormSubmitted.emit(this.productForm);
    this.initProductForm();
  }

  initProductForm() {
    if (this.productFormMode === 'new') {
      this.productForm = new FormGroup({
        _id: new FormControl(null),
        parentOrg: new FormControl(null),
        isActive: new FormControl(this.productStatus, Validators.required),
        department: new FormControl(null),
        category: new FormControl(null, Validators.required),
        name: new FormControl(null, Validators.required),
        unitSize: new FormControl(null, Validators.required),
        unitMeasure: new FormControl(null, Validators.required),
        unitsPerPack: new FormControl(null, Validators.required),
        packsPerCase: new FormControl(null, Validators.required),
        casePrice: new FormControl(null, Validators.required),
        par: new FormControl(null, Validators.required),
      });
    } else if (this.productFormMode === 'update') {
      console.log(this.productFormMode);
      console.log(this.updateProduct);

      this.productForm = new FormGroup({
        _id: new FormControl(this.updateProduct._id),
        parentOrg: new FormControl(this.updateProduct.parentOrg),
        isActive: new FormControl(
          this.updateProduct.isActive,
          Validators.required
        ),
        department: new FormControl(this.updateProduct.department),
        category: new FormControl(
          this.updateProduct.category,
          Validators.required
        ),
        name: new FormControl(this.updateProduct.name, Validators.required),
        unitSize: new FormControl(
          this.updateProduct.unitSize,
          Validators.required
        ),
        unitMeasure: new FormControl(
          this.updateProduct.unitMeasure,
          Validators.required
        ),
        unitsPerPack: new FormControl(
          this.updateProduct.unitsPerPack,
          Validators.required
        ),
        packsPerCase: new FormControl(
          this.updateProduct.packsPerCase,
          Validators.required
        ),
        casePrice: new FormControl(
          this.updateProduct.casePrice,
          Validators.required
        ),
        par: new FormControl(this.updateProduct.par, Validators.required),
      });
    }
  }
}
