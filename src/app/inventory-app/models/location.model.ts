import { User } from "src/app/users/user.model";
import { BaseEntity } from "./base.model";
import { Inventory } from "./inventory.model";
import { Product } from "./product.model";

export interface Manager { manager: string | User };
export interface Staff { staffMember: string | User };
export interface ProductList { product: Product };
export interface InventoryData { inventory: string | Inventory };

export class Location extends BaseEntity {
  public locationName: string;
  public parentBusiness: string;
  public managers: Manager[] | [];
  public staff: Staff[] | [];
  public productList: ProductList[] | [];
  public inventoryData: InventoryData[] | [];

  constructor(
    locationName: string,
    parentBusiness: string,
    managers: Manager[] | [],
    staff: Staff[] | [],
    productList: ProductList[] | [],
    inventoryData: InventoryData[] | []
  ) {
    super();
    this.locationName = locationName;
    this.parentBusiness = parentBusiness;
    this.managers = managers;
    this.staff = staff;
    this.productList = productList;
    this.inventoryData = inventoryData;
  }
}
