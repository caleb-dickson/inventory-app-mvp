import { createAction, props } from '@ngrx/store';

import { Inventory } from 'src/app/core/business/business-control/inventory.model';
import { Product } from 'src/app/core/business/business-control/product.model';
import { Location } from '../../business-control/location.model';


export const GETUserLocationsStart = createAction(
  '[Location] Fetch Locations Where User is Authorized START',
  props<{ userId: string, userRole: number }>()
);
export const GETUserLocationsSuccess = createAction(
  '[Location] Fetch Locations Where User is Authorized SUCCESS',
  props<{ locations: Location[] }>()
);


export const PUTUpdateManagerLocationStart = createAction(
  '[Location] Fetch Locations Where User is Authorized START',
  props<{ updatedLocation: Location }>()
);
export const PUTUpdateManagerLocationSuccess = createAction(
  '[Location] Fetch Locations Where User is Authorized SUCCESS',
  props<{ locations: Location[] }>()
);




export const POSTCreateProductForLocationStart = createAction(
  '[Location] Save a New Product to Location START',
  props<{ product: Product, locationId: string }>()
);
export const POSTCreateProductForLocationSuccess = createAction(
  '[Location] Save a New Product to Location SUCCESS'
);
export const DELETERemoveProductFromLocationStart = createAction(
  '[Location] Remove Products from Location START',
  props<{ product: Product[], locationId: string }>()
);
export const DELETERemoveProductFromLocationSuccess = createAction(
  '[Location] Remove Products from Location SUCCESS'
);



export const POSTCreateInventoryForLocationStart = createAction(
  '[Location] Save a New Inventory to Location START',
  props<{ inventory: Inventory }>()
);
export const POSTCreateInventoryForLocationSuccess = createAction(
  '[Location] Save a New Inventory to Location SUCCESS',
  props<{ locations: Location[] }>()
);




export const ActivateLocation = createAction(
  '[Location] Select a Location as Activated',
  props<{ location: Location }>()
);
export const ActivateInventory = createAction(
  '[Location] Select an Inventory as Activated',
  props<{ inventory: Inventory }>()
);
export const ActivateProducts = createAction(
  '[Location] Select Products as Activated',
  props<{ products: Product[] }>()
);




export const LocationError = createAction(
  '[Location] Location Errors',
  props<{ errorMessage: string }>()
);
