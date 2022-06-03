import { Action, createReducer, on } from '@ngrx/store';
import * as LocationActions from './location.actions';

import { Inventory } from 'src/app/core/business/business-control/inventory.model';
import { Product } from 'src/app/core/business/business-control/product.model';
import { Location } from '../../business-control/location.model';

export interface LocationState {
  userLocations: Location[];
  activeLocation: Location;
  activeProduct: Product;
  activeInventory: Inventory;
  locationError: string;
  loading: boolean;
}

const initialState: LocationState = {
  userLocations: [],
  activeLocation: null,
  activeProduct: null,
  activeInventory: null,
  locationError: null,
  loading: false,
};

export function locationReducer(
  locationState: LocationState | undefined,
  locationAction: Action
) {
  return createReducer(
    initialState,

    on(LocationActions.GETUserLocationsStart, (state, action) => ({
      ...state,
      loading: true,
    })),
    on(LocationActions.GETUserLocationsSuccess, (state, action) => ({
      ...state,
      loading: false,
      userLocations: action.locations,
    })),
    on(LocationActions.PUTUpdateManagerLocationStart, (state) => ({
      ...state,
      loading: true,
    })),
    on(LocationActions.PUTUpdateManagerLocationSuccess, (state, action) => ({
      ...state,
      loading: false,
      userLocations: action.locations,
    })),




    on(LocationActions.POSTCreateProductForLocationStart, (state) => ({
      ...state,
      loading: true,
    })),
    on(
      LocationActions.POSTCreateProductForLocationSuccess,
      (state, action) => ({
        ...state,
        loading: false,
        userLocations: action.locations,
      })
    ),
    on(LocationActions.POSTCreateInventoryForLocationStart, (state) => ({
      ...state,
      loading: true,
    })),
    on(
      LocationActions.POSTCreateInventoryForLocationSuccess,
      (state, action) => ({
        ...state,
        loading: false,
        userLocations: action.locations,
      })
    ),




    on(LocationActions.ActivateLocation, (state, action) => ({
      ...state,
      activeLocation: action.location,
    })),
    on(LocationActions.ActivateInventory, (state, action) => ({
      ...state,
      activeInventory: action.inventory,
    })),
    on(LocationActions.ActivateProduct, (state, action) => ({
      ...state,
      activeProduct: action.product,
    })),




    on(LocationActions.LocationError, (state, action) => ({
      ...state,
      locationError: action.errorMessage,
      loading: false,
    }))



  )(locationState, locationAction);
}