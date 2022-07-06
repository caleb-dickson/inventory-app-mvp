import { Location } from './location.model';

export interface LocationIds {
  location: string;
}
/**
 * In future update, this will be created in the `Business` doc
 * by user input in the `BusinessComponent`
 */
export const BusinessInventoryPeriod = 14;

/**
 * View at: {@link Business}
 *
 * `Constructor`
 * ```
 * (_id: string | null,
 * businessName: string,
 * ownerId: string,
 * businessPhoto: string,
 * locations: Location[] | LocationIds[] | [] | null)
 *
 * ```
 */
export class Business {
  public _id: string | null;
  public businessName: string;
  public ownerId: string;
  public businessPhoto: string;
  // ^^^ BUSINESS OWNER USER DOC ID
  public locations: Location[] | LocationIds[] | [] | null;
  // ^^^ LOCATION DOC IDS 'OWNED' BY THIS BUSINESS

  constructor(
    _id: string | null,
    businessName: string,
    ownerId: string,
    businessPhoto: string,
    locations: Location[] | LocationIds[] | [] | null
  ) {
    this._id = _id;
    this.businessName = businessName;
    this.ownerId = ownerId;
    this.businessPhoto = businessPhoto;
    this.locations = locations;
  }
}
