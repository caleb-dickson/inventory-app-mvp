export const defaultCategories: ProductCategories = {
  categories: [
    {
      name: 'Produce',
      subCategories: ['Herbs', 'Vegetables', 'Fruits'],
    },
    {
      name: 'Proteins',
      subCategories: ['Meat', 'Fish', 'Poultry', 'Plant Based/Beyond'],
    },
    {
      name: 'Dry Foods',
      subCategories: [
        'Spices',
        'Flours',
        'Oils',
        'Honey/Syrups',
        'Dried Fruits/Produce',
        'Other Dry Foods',
      ],
    },
    {
      name: 'Non-Food',
      subCategories: ['Paper Goods', 'Equipment, Consumables', 'Other Non Food'],
    },
  ],
};

interface Category {
  name: string;
  subCategories: string[];
}

export class ProductCategories {
  public categories: Category[];

  constructor(categories: Category[]) {
    this.categories = categories;
  }
}
