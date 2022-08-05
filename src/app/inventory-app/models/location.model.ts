import { User } from "src/app/users/user.model";
import { BaseEntity } from "./base.model";
import { Inventory } from "./inventory.model";
import { Product } from "./product.model";

// export interface Manager { manager: string | User };
// export interface Staff { staffMember: string | User };
// export interface ProductList { product: Product };
// export interface InventoryData { inventory: string | Inventory };

export class Location extends BaseEntity {
  public name: string;
  public photo: string;
  public business: string;
  public managers: User[] | [];
  public staff: User[] | [];
  public inventories: Inventory[] | [];
  public products: Product[] | [];

  constructor(
    name: string,
    business: string,
    managers: User[] | [],
    staff: User[] | [],
    products: Product[] | [],
    inventories: Inventory[] | []
  ) {
    super();
    this.name = name;
    this.business = business;
    this.managers = managers;
    this.staff = staff;
    this.products = products;
    this.inventories = inventories;
  }
}
