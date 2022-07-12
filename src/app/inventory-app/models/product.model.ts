import { BaseEntity } from "./base.model";

export class Product extends BaseEntity {
  public parentOrg: string;
  public isActive: boolean;
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
    parentOrg: string,
    isActive: boolean,
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
    super();
    this.parentOrg = parentOrg;
    this.isActive = isActive;
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

export interface Unit {
  singular: string;
  plural: string;
}
