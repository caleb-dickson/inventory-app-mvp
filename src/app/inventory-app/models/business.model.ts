import { Location } from './location.model';
import { BaseEntity } from './base.model';

export interface LocationIds {
  location: string;
}
/**
 * In future update, BusinessInventoryPeriod will be created in the `Business` doc
 * by user input in the `BusinessComponent`
 */
export const BusinessInventoryPeriod = 14;


export class Business extends BaseEntity {

  public businessName: string;
  public ownerId: string;
  public businessPhoto: string;
  public locations: Location[] | LocationIds[] | [] | null;

  constructor(
    businessName: string,
    ownerId: string,
    businessPhoto: string,
    locations: Location[] | LocationIds[] | [] | null
    ) {
      super();
      this.businessName = businessName;
      this.ownerId = ownerId;
      this.businessPhoto = businessPhoto;
      this.locations = locations;
    }

}
