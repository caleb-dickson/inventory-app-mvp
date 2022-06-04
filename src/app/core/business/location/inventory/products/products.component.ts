import { Component, OnInit } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../../app-store/app.reducer';
import * as LocationActions from '../../location-store/location.actions';
import { LocationState } from '../../location-store/location.reducer';

import { filter, Subscription } from 'rxjs';

import { Location } from '../../../business-control/location.model';
import { ProductCategories } from './models/product-categories';
import { UnitsCategories } from './models/units-list';
import { NgForm } from '@angular/forms';
import { Product } from '../../../business-control/product.model';
import { LocationService } from '../../location-control/location.service';
import { MatCheckbox } from '@angular/material/checkbox';

const defaultUnits: UnitsCategories = {
  categories: [
    {
      category: 'Per, unmeasured',
      units: ['ea', 'bunch(es)'],
    },
    {
      category: 'Weight',
      units: ['oz', 'lbs', 'grams', 'kg'],
    },
    {
      category: 'Volume',
      units: ['fl. oz', 'pints', 'quarts', 'gallons', 'ml', 'liters'],
    },
  ],
};

const defaultCategories: ProductCategories = {
  categories: [
    {
      name: 'Produce',
      subCategories: ['Herbs', 'Vegetables', 'Fruits'],
    },
    {
      name: 'Proteins',
      subCategories: ['Meat', 'Fish', 'Poultry', 'Plant Based/Beyond'],
    },
    {
      name: 'Dry Foods',
      subCategories: [
        'Spices',
        'Flours',
        'Oils',
        'Honey/Syrups',
        'Dried Fruits/Produce',
        'Other Dry Foods',
      ],
    },
    {
      name: 'Non-Food',
      subCategories: ['Paper Goods', 'Equipment, Consumable', 'Other Non Food'],
    },
  ],
};

// interface productSelection {
//   product: Product,
//   checked: boolean
// }

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

  userRole: string;

  locationState: LocationState;
  activeLocation: Location;

  productCategories: ProductCategories;
  defaultUnits: UnitsCategories;

  selectedProducts: Product[] = [];

  ngOnInit() {
    this.productCategories = defaultCategories;
    this.defaultUnits = defaultUnits;
    console.log(this.selectedProducts);

    // this.locationService.getActivatedLocation();

    this.locationStoreSub = this.store
      .select('location')
      .subscribe((locState) => {
        console.log(locState);
        this.locationState = locState;
        this.activeLocation = locState.activeLocation;
      });
  }

  onResetForm(form: NgForm) {
    form.reset();
  }

  onNewProductSubmit(newProductForm: NgForm) {
    console.log(newProductForm.value);

    if (!newProductForm.valid) {
      return;
    }

    this.store.dispatch(
      LocationActions.POSTCreateProductForLocationStart({
        product: {
          _id: null,
          parentOrg: this.activeLocation._id,
          category: newProductForm.value.category,
          name: newProductForm.value.name,
          unitSize: newProductForm.value.unitSize,
          unit: newProductForm.value.unit,
          packSize: newProductForm.value.packSize,
          packPrice: newProductForm.value.packPrice,
          par: newProductForm.value.par,
        },
        locationId: this.activeLocation._id,
      })
    );
    newProductForm.reset();
  }

  onProductSelect(checked: boolean, product: Product) {
    console.log(checked);
    console.log(product);
    let updatedSelection: Product[] = [];

    let productExists = this.selectedProducts.find(
      (arrProduct) => arrProduct === product
    );
    console.log('product?');
    console.log(productExists);

    if (checked === true && !productExists) {
      updatedSelection.push(product);
      this.selectedProducts = updatedSelection;
    } else if (checked === false && productExists) {
      updatedSelection = this.selectedProducts.filter(
        (arrProduct) => arrProduct !== product
      );
      this.selectedProducts = updatedSelection;
      console.log(this.selectedProducts);
    }
    console.log(this.selectedProducts);
    this.store.dispatch(
      LocationActions.ActivateProducts({
        products: this.selectedProducts,
      })
    );
    console.log(this.locationState.activeProducts);
  }

  onDeleteSelectedProducts() {

    this.selectedProducts = [];
  }
}
