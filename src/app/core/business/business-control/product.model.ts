export class Product {
  public _id: string | null;
  public parentOrg: string;
  public category: string;
  public name: string;
  public unitSize: number;
  public unit: string;
  public packSize: number;
  public packPrice: number;
  public par: number;

  constructor(
    _id: string | null,
    parentOrg: string,
    category: string,
    name: string,
    unitSize: number,
    unit: string,
    packSize: number,
    packPrice: number,
    par: number,
  ) {
    this._id = _id;
    this.parentOrg = parentOrg;
    this.category = category;
    this.name = name;
    this.unitSize = unitSize;
    this.unit = unit;
    this.packSize = packSize;
    this.packPrice = packPrice;
    this.par = par;
  }
}
