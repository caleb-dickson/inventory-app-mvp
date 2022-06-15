import { Action, createReducer, on } from '@ngrx/store';
import * as LocationActions from './location.actions';

import { Inventory } from 'src/app/core/business/business-control/inventory.model';
import { Product } from 'src/app/core/business/business-control/product.model';
import { Location } from '../../business-control/location.model';

export interface LocationState {
  userLocations: Location[];
  activeLocation: Location;
  activeProducts: Product[];
  activeInventory: Inventory;
  locationError: string;
  loading: boolean;
}

const initialState: LocationState = {
  userLocations: [],
  activeLocation: null,
  activeProducts: [],
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

    // FETCH/READ
    // User's Locations
    on(LocationActions.GETUserLocationsStart, (state) => ({
      ...state,
      loading: true,
    })),
    on(LocationActions.GETUserLocationsSuccess, (state, action) => ({
      ...state,
      loading: false,
      userLocations: action.locations,
    })),
    // Location Populated Inventory List
    on(LocationActions.GETLocationInventoriesStart, (state) => ({
      ...state,
      loading: true,
    })),
    on(LocationActions.GETLocationInventoriesSuccess, (state) => ({
      ...state,
      loading: false,
    })),


    // UPDATE
    on(LocationActions.PUTUpdateManagerLocationStart, (state) => ({
      ...state,
      loading: true,
    })),
    on(LocationActions.PUTUpdateManagerLocationSuccess, (state, action) => ({
      ...state,
      loading: false,
      userLocations: action.locations,
    })),


    // CREATE
    on(LocationActions.POSTCreateProductForLocationStart, (state) => ({
      ...state,
      loading: true,
    })),
    on(LocationActions.POSTCreateProductForLocationSuccess, (state) => ({
      ...state,
      loading: false,
    })),
    on(LocationActions.POSTCreateInventoryForLocationStart, (state) => ({
      ...state,
      loading: true,
    })),
    on(LocationActions.POSTCreateInventoryForLocationSuccess, (state) => ({
      ...state,
      loading: false,
    })),


    // SELECT
    on(LocationActions.ActivateLocation, (state, action) => ({
      ...state,
      activeLocation: action.location,
    })),
    // on(LocationActions.ActivateInventory, (state, action) => ({
    //   ...state,
    //   activeInventory: action.inventory,
    // })),
    on(LocationActions.ActivateProducts, (state, action) => ({
      ...state,
      activeProducts: action.products,
    })),

    on(LocationActions.LocationError, (state, action) => ({
      ...state,
      locationError: action.errorMessage,
      loading: false,
    })),


    // CLEAR STATE ON LOGOUT
    on(LocationActions.clearLocationState, (state) => ({
      userLocations: [],
      activeLocation: null,
      activeProducts: [],
      activeInventory: null,
      locationError: null,
      loading: false,
    }))
  )(locationState, locationAction);
}
