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

export const defaultCategories = new ProductCategories([
  {
    name: 'Produce',
    subCategories: ['Herbs', 'Vegetables', 'Fruits'],
  },
  {
    name: 'Proteins',
    subCategories: ['Beef', 'Pork', 'Fish', 'Poultry', 'Plant Based/Beyond'],
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
  {
    name: 'Liqours',
    subCategories: [
      'Whiskey, American',
      'Whisky, Scotch',
      'Cognac',
      'Tequila',
      'Vodka',
      'Liqueurs',
      'Other Liqours'
    ],
  },
  {
    name: 'Red Wines',
    subCategories: [
      'Pinot Noir',
      'Cabernet Sauvignon',
      'Merlot',
      'Sangiovese',
      'Malbec',
      'Beaujolais',
      'Tempranillo',
      'Other Red Wines'
    ],
  },
  {
    name: 'White Wines',
    subCategories: [
      'Chardonnay',
      'Sauvignon Blanc',
      'Riesling',
      'Pinot Gris',
      'Semillon',
      'Gewurztraminer',
      'Viognier',
      'Rosé Wines',
      'Other White Wines'
    ],
  },
]);
