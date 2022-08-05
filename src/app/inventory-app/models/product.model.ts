import { BaseEntity } from "./base.model";

export class Product extends BaseEntity {
  public name: string;
  public department: string;
  public category: string;
  public isActive: boolean;
  public unitSize: number;
  public unitSingular: string;
  public unitPlural: string;
  public unitsPerPack: number;
  public packsPerCase: number;
  public casePrice: number;
  public par: number;
  public photo: string;
  public location: string;

  constructor(
    isActive: boolean,
    department: string,
    category: string,
    name: string,
    unitSize: number,
    unitSingular: string,
    unitPlural: string,
    unitsPerPack: number,
    packsPerCase: number,
    casePrice: number,
    par: number,
    photo: string,
    location: string
  ) {
    super();
    this.isActive = isActive;
    this.department = department;
    this.category = category;
    this.name = name;
    this.unitSize = unitSize;
    this.unitSingular = unitSingular;
    this.unitPlural = unitPlural;
    this.unitsPerPack = unitsPerPack;
    this.packsPerCase = packsPerCase;
    this.casePrice = casePrice;
    this.par = par;
    this.photo = photo;
    this.location = location;
  }
}

export interface Unit {
  singular: string;
  plural: string;
}
