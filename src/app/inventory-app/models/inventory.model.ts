import { BaseEntity } from './base.model';
import { Location } from './location.model';
import { Product } from './product.model';

export class Inventory extends BaseEntity {
  public department: string;
  public isFinal: boolean;
  public dateStart: string;
  public dateEnd: string;
  public value: number;
  public inventory: InventoryItem[];
  public location: string;

  constructor(
    department: string,
    isFinal: boolean,
    dateStart: string,
    dateEnd: string,
    value: number,
    inventory: InventoryItem[],
    location: string
    ) {
      super();
      this.department = department;
      this.isFinal = isFinal;
      this.dateStart = dateStart;
      this.dateEnd = dateEnd;
      this.value = value;
      this.inventory = inventory;
      this.location = location;
    }

  }

  export interface InventoryItem {
    product: Product;
    quantity: number;
  }
