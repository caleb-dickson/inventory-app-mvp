interface Units {
  category?: string;
  units: string[];
}

export class UnitsCategories {
  public categories: Units[];

  constructor(categories: Units[]) {
    this.categories = categories;
  }
}
