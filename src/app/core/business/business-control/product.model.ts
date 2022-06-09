export interface Unit { singular: string, plural: string }

export class Product {
  public _id: string | null;
  public parentOrg: string;
  public department: string;
  public category: string;
  public name: string;
  public unitSize: number;
  public unitMeasure: Unit;
  public unitsPerPack: number;
  public packsPerCase: number;
  public casePrice: number;
  public par: number;

  constructor(
    _id: string | null,
    parentOrg: string,
    department: string,
    category: string,
    name: string,
    unitSize: number,
    unitMeasure: Unit,
    unitsPerPack: number,
    packsPerCase: number,
    casePrice: number,
    par: number
  ) {
    this._id = _id;
    this.parentOrg = parentOrg;
    this.department = department;
    this.category = category;
    this.name = name;
    this.unitSize = unitSize;
    this.unitMeasure = unitMeasure;
    this.unitsPerPack = unitsPerPack;
    this.packsPerCase = packsPerCase;
    this.casePrice = casePrice;
    this.par = par;
  }
}
