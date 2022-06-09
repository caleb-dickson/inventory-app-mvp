import { User } from "src/app/auth/auth-control/user.model";
import { Inventory } from "./inventory.model";
import { Product } from "./product.model";

export interface Manager { manager: string | User };
export interface Staff { staffMember: string | User };
export interface ProductList { product: Product };
export interface InventoryData { inventory: string | Inventory };

export class Location {
  public _id: string | null;
  public locationName: string;
  public parentBusiness: string;
  public managers: Manager[] | [];
  public staff: Staff[] | [];
  public productList: ProductList[] | [];
  public inventoryData: InventoryData[] | [];
  // ^^^ AN ARRAY OF INVENTORY DOC IDS ASSIGNED TO THIS LOCATION

  constructor(
    _id: string | null,
    locationName: string,
    parentBusiness: string,
    managers: Manager[] | [],
    staff: Staff[] | [],
    productList: ProductList[] | [],
    inventoryData: InventoryData[] | []
  ) {
    this._id = _id,
    this.locationName = locationName;
    this.parentBusiness = parentBusiness;
    this.managers = managers;
    this.staff = staff;
    this.productList = productList;
    this.inventoryData = inventoryData;
  }
}
