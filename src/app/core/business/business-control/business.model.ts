import { Location } from "./location.model";

export interface LocationIds { location: string };
export const BusinessInventoryPeriod = 14;


export class Business {
  public _id: string | null;
  public businessName: string;
  public ownerId: string;
  // ^^^ BUSINESS OWNER USER DOC ID
  public locations: Location[] | LocationIds[] | [] | null;
  // ^^^ LOCATION DOC IDS 'OWNED' BY THIS BUSINESS


  constructor(
    _id: string | null,
    businessName: string,
    ownerId: string,
    locations: Location[] | LocationIds[] | [] | null
  ) {
    this._id = _id;
    this.businessName = businessName;
    this.ownerId = ownerId;
    this.locations = locations;
  }


}
