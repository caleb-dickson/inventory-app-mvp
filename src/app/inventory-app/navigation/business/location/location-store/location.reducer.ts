import { Action, createReducer, on } from '@ngrx/store';
import * as LocationActions from './location.actions';

import { Inventory } from 'src/app/inventory-app/models/inventory.model';
import { Product } from 'src/app/inventory-app/models/product.model';
import { Location } from '../../../../models/location.model';

export interface LocationState {
  userLocations: Location[];
  activeLocation: Location;
  activeProducts: Product[];
  activeLocationInventories: Inventory[];
  activeInventory: Inventory;
  locationError: string;
  loading: boolean;
}

const initialState: LocationState = {
  userLocations: [],
  activeLocation: null,
  activeProducts: [],
  activeLocationInventories: [],
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

    on(
      LocationActions.LoadStart,
      LocationActions.GETUserLocationsStart,
      LocationActions.GETLocationInventoriesStart,
      LocationActions.PUTUpdateManagerLocationStart,
      LocationActions.PUTUpdateInventoryForLocationStart,
      LocationActions.POSTCreateProductForLocationStart,
      LocationActions.POSTCreateInventoryForLocationStart,
      LocationActions.POSTDeleteProductsFromLocationStart,
      (state) => ({
      ...state,
      loading: true
    })),
    on(
      LocationActions.LoadStop,
      (state) => ({
      ...state,
      loading: false
    })),

    // FETCH/READ
    // User's Locations
    on(LocationActions.GETUserLocationsSuccess, (state, action) => ({
      ...state,
      loading: false,
      locationError: null,
      userLocations: action.locations,
      activeLocation:
        action.locations.length === 1
          ? action.locations[0]
          : state.activeLocation,
    })),
    // Location Populated Inventory List
    on(LocationActions.GETLocationInventoriesSuccess, (state, action) => ({
      ...state,
      loading: false,
      locationError: null,
      activeLocationInventories: [...action.inventoryData],
      activeInventory: action.draft,
    })),
    on(LocationActions.GETLocationInventoriesNull, (state) => ({
      ...state,
      loading: false,
      activeLocationInventories: [],
      activeInventory: null,
    })),

    // UPDATE
    on(LocationActions.PUTUpdateManagerLocationSuccess, (state, action) => ({
      ...state,
      loading: false,
      locationError: null,
      userLocations: action.locations,
    })),

    on(
      LocationActions.PUTUpdateInventoryForLocationSuccess,
      (state, action) => ({
        ...state,
        loading: false,
        locationError: null,
        activeInventory: action.updatedInventory.isFinal
          ? null
          : action.updatedInventory,
      })
    ),

    // CREATE
    on(LocationActions.POSTCreateProductForLocationSuccess, (state) => ({
      ...state,
      loading: false,
      locationError: null,
    })),
    on(LocationActions.POSTCreateInventoryForLocationSuccess, (state) => ({
      ...state,
      loading: false,
      locationError: null,
    })),


    on(LocationActions.POSTDeleteProductsFromLocationSuccess, (state) => ({
      ...state,
      loading: false,
    })),

    // SELECT
    on(LocationActions.ActivateLocation, (state, action) => ({
      ...state,
      activeLocation: action.location,
    })),
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
    on(LocationActions.clearLocationState, () => ({
      userLocations: [],
      activeLocation: null,
      activeProducts: [],
      activeLocationInventories: [],
      activeInventory: null,
      locationError: null,
      loading: false,
    }))
  )(locationState, locationAction);
}
