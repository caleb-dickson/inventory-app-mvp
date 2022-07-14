import { createAction, props } from '@ngrx/store';

import { Inventory } from 'src/app/inventory-app/models/inventory.model';
import { Product } from 'src/app/inventory-app/models/product.model';
import { Location } from '../../../../models/location.model';

// GET
export const GETUserLocationsStart = createAction(
  '[Location] Fetch Locations Where User is Authorized START',
  props<{ userId: string, userRole: number }>()
);
export const GETUserLocationsSuccess = createAction(
  '[Location] Fetch Locations Where User is Authorized SUCCESS',
  props<{ locations: Location[] }>()
);

export const GETLocationInventoriesStart = createAction(
  '[Location] Fetch a List of Location Inventories START',
  props<{ locationId: string }>()
);
export const GETLocationInventoriesSuccess = createAction(
  '[Location] Fetch a List of Location Inventories SUCCESS',
  props<{ inventoryData: Inventory[], draft: Inventory }>()
);
export const GETLocationInventoriesNull = createAction(
  '[Location] Fetch a List of Location Inventories NULL Result'
);
//POST
export const POSTCreateProductForLocationStart = createAction(
  '[Location] Save a New Product to Location START',
  props<{ product: Product, locationId: string }>()
);
export const POSTCreateProductForLocationSuccess = createAction(
  '[Location] Save a New Product to Location SUCCESS'
);
export const POSTCreateInventoryForLocationStart = createAction(
  '[Location] Save a New Inventory to Location START',
  props<{ location: Location, inventory: Inventory }>()
);
export const POSTCreateInventoryForLocationSuccess = createAction(
  '[Location] Save a New Inventory to Location SUCCESS'
);
// PUT
export const PUTUpdateManagerLocationStart = createAction(
  '[Location] Fetch Locations Where User is Authorized START',
  props<{ updatedLocation: Location }>()
);
export const PUTUpdateManagerLocationSuccess = createAction(
  '[Location] Fetch Locations Where User is Authorized SUCCESS',
  props<{ locations: Location[] }>()
);
export const PUTUpdateInventoryForLocationStart = createAction(
  '[Location] Update an Existing Inventory at Location START',
  props<{ inventory: Inventory }>()
);
export const PUTUpdateInventoryForLocationSuccess = createAction(
  '[Location] Update an Existing Inventory at Location SUCCESS',
  props<{ updatedInventory: Inventory }>()
);
export const PUTUpdateProductForLocationStart = createAction(
  '[Location] Update an Existing Product at Location START',
  props<{ product: Product }>()
);
export const PUTUpdateProductForLocationSuccess = createAction(
  '[Location] Update an Existing Product at Location SUCCESS',
  props<{ updatedProduct: Product }>()
);

// DELETE - working
export const DELETEProductFromLocationStart = createAction(
  '[Location] Remove Products from Location START',
  props<{ product: Product[], locationId: string }>()
);
export const DELETEFromLocationSuccess = createAction(
  '[Location] Remove Products from Location SUCCESS'
);

// STATE ONLY
export const ActivateLocation = createAction(
  '[Location] Select a Location as Activated',
  props<{ location: Location }>()
);
export const ActivateProducts = createAction(
  '[Location] Select Products as Activated',
  props<{ products: Product[] }>()
);

// ERROR
export const LocationError = createAction(
  '[Location] Location Errors',
  props<{ errorMessage: string }>()
);

// CLEAR STATE
export const clearLocationState = createAction(
  '[Location] Clear Location State'
);
