import { Inventory } from "../../inventory/inv-control/inventory.model";

export interface InventoryIds { inventory: string };
export interface ManagerEmails { managerEmail: string };
export interface StaffEmails { staffEmail: string };

export class Location {
  public _id: string | null;
  public locationName: string;
  public parentBusiness: string;
  public managers: ManagerEmails[] | null;
  public staff: StaffEmails[] | null;
  public inventoryData: InventoryIds[] | Inventory[] | null;
  // ^^^ AN ARRAY OF INVENTORY DOC IDS ASSIGNED TO THIS LOCATION

  constructor(
    _id: string | null,
    locationName: string,
    parentBusiness: string,
    managers: ManagerEmails[] | null,
    staff: StaffEmails[] | null,
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
