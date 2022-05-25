import { Product } from "./product.model";

export class Inventory {
  public _id: string;
  public dateStart: string; // MUST BE PREDICTABLE PER PERIOD
  public dateEnd: string; // MUST BE PREDICTABLE PER PERIOD
  public type: string; // BOH OR FOH or ...
  public inventory: [
      {
        product: string | Product; // PRODUCT DOC ID
        quantity: number;
      }
    ];

  constructor(
    _id: string,
    dateStart: string,
    dateEnd: string,
    type: string,
    inventory: [ { product: string | Product, quantity: number } ],
  ) {
    this._id = _id;
    this.dateStart = dateStart;
    this.dateEnd = dateEnd;
    this.type = type;
    this.inventory = inventory;
  }
}
