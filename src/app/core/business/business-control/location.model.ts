import { User } from "src/app/auth/auth-control/user.model";
import { Inventory } from "../../inventory/inv-control/inventory.model";

export interface InventoryIds { inventory: string };
export interface Manager { manager: string | User | null };
export interface Staff { staffMember: string | User | null };

export class Location {
  public _id: string | null;
  public locationName: string;
  public parentBusiness: string;
  public managers: Manager[] | null;
  public staff: Staff[] | null;
  public inventoryData: InventoryIds[] | Inventory[] | null;
  // ^^^ AN ARRAY OF INVENTORY DOC IDS ASSIGNED TO THIS LOCATION

  constructor(
    _id: string | null,
    locationName: string,
    parentBusiness: string,
    managers: Manager[] | null,
    staff: Staff[] | null,
    inventoryData: InventoryIds[] | Inventory[] | null
  ) {
    this._id = _id,
    this.locationName = locationName;
    this.parentBusiness = parentBusiness;
    this.managers = managers;
    this.staff = staff;
    this.inventoryData = inventoryData;
  }
}
