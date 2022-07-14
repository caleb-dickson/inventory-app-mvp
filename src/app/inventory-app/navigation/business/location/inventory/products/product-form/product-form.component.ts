import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map, Subscription } from 'rxjs';
import {
  defaultCategories,
  ProductCategories,
} from 'src/app/inventory-app/models/product-categories.model';
import { Product, Unit } from 'src/app/inventory-app/models/product.model';
import {
  defaultUnits,
  UnitsCategories,
} from 'src/app/inventory-app/models/units-list.model';
import { User } from 'src/app/users/user.model';
import { LocationState } from '../../../location-store/location.reducer';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../../../app-store/app.reducer';
import { Location } from 'src/app/inventory-app/models/location.model';
import { ProductsService } from '../../../../../../inventory-app-control/products.service';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit, OnDestroy {
  constructor(
    private _store: Store<fromAppStore.AppState>,
    private _productsService: ProductsService
  ) {}

  @Output('productFormSubmitted') productFormSubmitted =
    new EventEmitter<FormGroup>();

  private _userAuthSub: Subscription;
  private _locationStoreSub: Subscription;
  private _updateProductSub: Subscription;
  private _productFormModeSub: Subscription;

  user: User;
  userRole: string;
  userDept: string;

  bizLoading: boolean;
  locLoading: boolean;

  productForm: FormGroup;
  productFormMode: string = 'new';
  updateProduct: Product;

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

    this._userAuthSub = this._store
      .select('user')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.user = user;
        if (user) {
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
          this.userDept = user.userProfile.department;
        }
      });

    this._updateProductSub = this._productsService.$updateProduct.subscribe(
      (product) => {
        this.updateProduct = product;
      }
    );

    this._productFormModeSub = this._productsService.$productFormMode.subscribe(
      (mode) => {
        this.productFormMode = mode;
        this._initProductForm();
      }
    );

    this._userAuthSub = this._store
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

    this._locationStoreSub = this._store
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

  onDepartmentSelect($event: MatRadioChange) {
    this.productForm.get('department').setValue($event.value);
    console.log(this.productForm.value);
  }

  onProductNameInput(name: string) {
    this.productName = name;
  }

  onProductStatusSelect(checked: boolean) {
    checked
      ? (this.productStatusText = 'Active')
      : (this.productStatusText = 'Inactive');
    this.productStatus = checked;
    this.productForm.get('isActive').setValue(this.productStatus);

    // IN UPDATE MODE, SET FORM STATUS TO ENABLE SUBMIT BUTTON ON
    // PRODUCT STATUS CHANGE FROM ORIGINAL DOC
    if (
      this.productFormMode === 'update' &&
      !this.productForm.dirty &&
      this.productStatus !== this.updateProduct.isActive
    ) {
      this.productForm.markAsTouched();
      this.productForm.markAsDirty();
    } else {
      this.productForm.markAsPristine();
      this.productForm.markAsUntouched();
    }

    // IN NEW PRODUCT MODE, SET FORM STATUS TO ENABLE THE RESET BUTTON
    if (this.productFormMode === 'new') {
      this.productForm.markAsTouched();
      this.productForm.markAsDirty();
    }
    this.productForm.updateValueAndValidity();
    console.log(this.productForm.dirty);
    console.log(this.productForm.value.isActive);
  }

  onResetForm() {
    if (this.productFormMode === 'new') {
      this.productForm.reset();
      this.onProductStatusSelect(true);
    } else if (this.productFormMode === 'update') {
      this._initProductForm();
      this.onProductStatusSelect(this.updateProduct.isActive);
    }
  }

  onProductSubmit() {
    this.productForm.updateValueAndValidity();
    console.log(this.productForm.valid);
    console.log(this.productForm.value);
    this.productFormSubmitted.emit(this.productForm);
    this._initProductForm();
  }

  private _initProductForm() {
    let productDepartment = this.userDept === 'admin' ? null : this.userDept;
    let deptRequired = this.userDept === 'admin' ? Validators.required : null;

    if (this.productFormMode === 'new') {
      this.productForm = new FormGroup({
        _id: new FormControl(null),
        parentOrg: new FormControl(null),
        isActive: new FormControl(this.productStatus, Validators.required),
        department: new FormControl(productDepartment, deptRequired),
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
      this.productStatusText = this.updateProduct?.isActive
        ? 'Active'
        : 'Inactive';

      this.productForm = new FormGroup({
        _id: new FormControl(this.updateProduct?._id, Validators.required),
        parentOrg: new FormControl(
          this.updateProduct?.parentOrg,
          Validators.required
        ),
        isActive: new FormControl(
          this.updateProduct?.isActive,
          Validators.required
        ),
        department: new FormControl(this.updateProduct?.department),
        category: new FormControl(
          this.updateProduct?.category,
          Validators.required
        ),
        name: new FormControl(this.updateProduct?.name, Validators.required),
        unitSize: new FormControl(
          this.updateProduct?.unitSize,
          Validators.required
        ),
        unitMeasure: new FormControl(
          this.updateProduct?.unitMeasure,
          Validators.required
        ),
        unitsPerPack: new FormControl(
          this.updateProduct?.unitsPerPack,
          Validators.required
        ),
        packsPerCase: new FormControl(
          this.updateProduct?.packsPerCase,
          Validators.required
        ),
        casePrice: new FormControl(
          this.updateProduct?.casePrice,
          Validators.required
        ),
        par: new FormControl(this.updateProduct?.par, Validators.required),
      });
      console.log(this.updateProduct);
    }
  }

  ngOnDestroy(): void {
    this._userAuthSub.unsubscribe();
    this._locationStoreSub.unsubscribe();
    this._updateProductSub.unsubscribe();
    this._productFormModeSub.unsubscribe();
  }
}
