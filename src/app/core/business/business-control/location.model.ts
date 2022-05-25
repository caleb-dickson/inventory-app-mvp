export interface InventoryIds { inventory: string };

export class Location {
  public _id: string | null;
  public locationName: string;
  public parentBusiness: string;
  public inventoryData: object[];
  // ^^^ AN ARRAY OF INVENTORY DOC IDS ASSIGNED TO THIS LOCATION

  constructor(
    _id: string | null,
    locationName: string,
    parentBusiness: string,
    inventoryData: object[]
  ) {
    this._id = _id,
    this.locationName = locationName;
    this.parentBusiness = parentBusiness;
    this.inventoryData = inventoryData;
  }
}
