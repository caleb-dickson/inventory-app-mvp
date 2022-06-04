interface Category {
  name: string;
  subCategories: string[];
}

interface SubCategories {
  value: string,
  viewValue: string
}

export class ProductCategories {
  public categories: Category[];

  constructor(categories: Category[]) {
    this.categories = categories;
  }
}
