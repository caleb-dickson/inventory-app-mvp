import { Injectable } from '@angular/core';

import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';
import * as LocationActions from '../navigation/business/location/location-store/location.actions';
import * as BusinessActions from '../navigation/business/business-store/business.actions';

import { Location } from '../models/location.model';
import { LocationState } from '../navigation/business/location/location-store/location.reducer';
import { BusinessState } from '../navigation/business/business-store/business.reducer';
import { Product } from '../models/product.model';
import { Inventory } from '../models/inventory.model';
import { Business } from '../models/business.model';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private _businessStoreSub: Subscription;
  private _locationStoreSub: Subscription;

  businessState: BusinessState;
  locationState: LocationState;

  constructor(private _store: Store<fromAppStore.AppState>) {
    this._locationStoreSub = this._store
      .select('location')
      .subscribe((locState) => {
        this.locationState = locState;
      });

    this._businessStoreSub = this._store
      .select('business')
      .subscribe((bizState) => {
        this.businessState = bizState;
      });
  }

  activateLocation(activatedLocation: Location) {
    if (!activatedLocation) {
      return;
    }

    localStorage.removeItem('inventoryData');

    localStorage.setItem(
      'activatedLocation',
      JSON.stringify(activatedLocation)
    );
    this._store.dispatch(
      LocationActions.ActivateLocation({
        location: activatedLocation,
      })
    );
  }

  getLocations(userId: string, userStringRole: string, userNumberRole: number) {
    const userLocations: Location[] = JSON.parse(
      localStorage.getItem('userLocations')
    );

    const businessLocations: Location[] = JSON.parse(
      localStorage.getItem('businessLocations')
    );

    if (userStringRole === 'owner') {
      const storedBusiness: Business = JSON.parse(
        localStorage.getItem('storedBusiness')
      );

      if (businessLocations) {
        console.log(
          '%cBusiness Locations',
          `font-size: 1rem;
              color: lightgreen;`,
          businessLocations
        );
        this._store.dispatch(
          BusinessActions.GETBusinessLocationsSuccess({
            locations: businessLocations,
          })
        ),
          this._store.dispatch(
            LocationActions.GETUserLocationsSuccess({
              locations: businessLocations,
            })
          );
      } else if (!businessLocations) {
        console.log(storedBusiness);
        console.warn('||| Fetching locations from DB |||');
        this._store.dispatch(
          BusinessActions.GETBusinessLocationsStart({
            businessId: storedBusiness.id,
          })
        );
      } else {
        this._store.dispatch(
          BusinessActions.BusinessError({ errorMessage: 'No locations found.' })
        );
      }
    } else if (userStringRole !== 'owner') {
      if (userLocations) {
        console.log(userLocations);
        console.warn('||| userLocations found in local storage |||');
        this._store.dispatch(
          LocationActions.GETUserLocationsSuccess({
            locations: userLocations,
          })
        );
      } else if (!userLocations) {
        console.warn('||| Fetching userLocations from DB |||');
        console.log(userId);
        this._store.dispatch(
          LocationActions.GETUserLocationsStart({
            userId: userId,
            userRole: userNumberRole,
          })
        );
      } else {
        this._store.dispatch(
          LocationActions.LocationError({
            errorMessage: 'No user locations found.',
          })
        );
      }
    }
  }

  getActivatedLocation() {
    const activatedLocation: Location = JSON.parse(
      localStorage.getItem('activatedLocation')
    );

    if (activatedLocation) {
      console.warn(
        '||| Found active location: ' + activatedLocation.name + ' |||'
      );
      console.log(activatedLocation);
      return this._store.dispatch(
        LocationActions.ActivateLocation({
          location: activatedLocation,
        })
      );
    } else {
      console.warn('||| No active location found. |||');
    }
  }

  selectProducts(
    checked: boolean,
    activeProducts: Product[],
    product: Product
  ) {
    // EMPTY TYPED ARRAY FOR THE FILTER
    let updatedSelection: Product[] = [];

    // CHECK IF SELECTED PRODUCT IS ALREADY IN selectedProducts
    let productExists = activeProducts.find(
      (arrProduct) => arrProduct === product
    );

    // IF ADDING PRODUCTS AND PRODUCT IS NOT ALREADY ADDED
    // ADD TO THE LIST
    if (checked === true && !productExists) {
      activeProducts.push(product);
    }
    // IF REMOVING PRODUCTS AND PRODUCT IS IN THE LIST
    // FILTER OUT THAT PRODUCT
    if (checked === false && productExists) {
      updatedSelection = activeProducts.filter(
        (arrProduct) => arrProduct !== product
      );
      // UPDATE THE LIST
      activeProducts = [...updatedSelection];
    }
    // SEND THE LIST TO THE STORE
    this._store.dispatch(
      LocationActions.ActivateProducts({
        products: [...activeProducts],
      })
    );
  }
}
