import { OnInit } from '@angular/core';
import { Product } from './product.model';

export interface InventoryItem {
  product: Product; // Product ObjectId or a populated Product
  quantity: number;
}

export class Inventory {
  public _id: string | null;
  public parentLocation: string | Location | null;
  public dateStart: string; // MUST BE PREDICTABLE PER PERIOD
  public dateEnd: string; // MUST BE PREDICTABLE PER PERIOD
  public department: string; // BOH OR FOH or ...
  public isFinal: boolean;
  public inventory: InventoryItem[];
  public value: number;

  constructor(
    _id: string | null,
    parentLocation: string | Location | null,
    dateStart: string,
    dateEnd: string,
    department: string,
    isFinal: boolean,
    inventory: InventoryItem[],
    value: number
  ) {
    this._id = _id;
    this.parentLocation = parentLocation;
    this.dateStart = dateStart;
    this.dateEnd = dateEnd;
    this.department = department;
    this.isFinal = isFinal;
    this.inventory = inventory;
    this.value = value;
  }

}
