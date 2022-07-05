import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from 'src/app/core/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  $inventoryProducts = new BehaviorSubject<Product[]>(null);

  constructor() { }

  setInventoryProducts(filteredProducts: Product[]) {
    this.$inventoryProducts.next(filteredProducts);
  }

}
