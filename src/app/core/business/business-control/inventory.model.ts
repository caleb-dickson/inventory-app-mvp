import { Product } from './product.model';

export interface InventoryItem {
  product: string | Product; // Product ObjectId or a populated Product
  quantity: number;
}

export class Inventory {
  public _id: string| null;
  public dateStart: string; // MUST BE PREDICTABLE PER PERIOD
  public dateEnd: string; // MUST BE PREDICTABLE PER PERIOD
  public department: string; // BOH OR FOH or ...
  public isFinal: boolean;
  public inventory: InventoryItem[]

  constructor(
    _id: string | null,
    dateStart: string,
    dateEnd: string,
    department: string,
    isFinal: boolean,
    inventory: InventoryItem[]
  ) {
    this._id = _id;
    this.dateStart = dateStart;
    this.dateEnd = dateEnd;
    this.department = department;
    this.isFinal = isFinal;
    this.inventory = inventory;
  }
}
