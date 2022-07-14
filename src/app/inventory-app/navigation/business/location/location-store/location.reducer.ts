import { Action, createReducer, on } from '@ngrx/store';
import * as LocationActions from './location.actions';

import { Inventory } from 'src/app/inventory-app/models/inventory.model';
import { Product } from 'src/app/inventory-app/models/product.model';
import { Location } from '../../../../models/location.model';
import { state } from '@angular/animations';

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

    // FETCH/READ
    // User's Locations
    on(LocationActions.GETUserLocationsStart, (state) => ({
      ...state,
      loading: true,
    })),
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
    on(LocationActions.GETLocationInventoriesStart, (state) => ({
      ...state,
      loading: true,
    })),
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
    on(LocationActions.PUTUpdateManagerLocationStart, (state) => ({
      ...state,
      loading: true,
    })),
    on(LocationActions.PUTUpdateManagerLocationSuccess, (state, action) => ({
      ...state,
      loading: false,
      locationError: null,
      userLocations: action.locations,
    })),
    on(LocationActions.PUTUpdateInventoryForLocationStart, (state) => ({
      ...state,
      loading: true,
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
    on(LocationActions.POSTCreateProductForLocationStart, (state) => ({
      ...state,
      loading: true,
    })),
    on(LocationActions.POSTCreateProductForLocationSuccess, (state) => ({
      ...state,
      loading: false,
      locationError: null,
    })),
    on(LocationActions.POSTCreateInventoryForLocationStart, (state) => ({
      ...state,
      loading: true,
    })),
    on(LocationActions.POSTCreateInventoryForLocationSuccess, (state) => ({
      ...state,
      loading: false,
      locationError: null,
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
      activeLocationInventories: [],
      activeInventory: null,
      locationError: null,
      loading: false,
    }))
  )(locationState, locationAction);
}
