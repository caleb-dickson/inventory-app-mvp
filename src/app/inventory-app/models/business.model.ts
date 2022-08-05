import { Location } from './location.model';
import { BaseEntity } from './base.model';

// export interface LocationIds {
//   location: string;
// }

export class Business extends BaseEntity {

  public name: string;
  public photo: string;
  public owner: string;
  public inventoryDueDates: Date[] | null;
  public inventoryPeriod: number;
  public businesslocations: Location[] | [] | null;

  constructor(
    name: string,
    photo: string,
    owner: string,
    inventoryDueDates: Date[] | null,
    inventoryPeriod: number,
    businesslocations: Location[] | [] | null
    ) {
      super();
      this.name = name;
      this.photo = photo;
      this.owner = owner;
      this.inventoryDueDates = inventoryDueDates;
      this.inventoryPeriod = inventoryPeriod;
      this.businesslocations = businesslocations;
    }

}
