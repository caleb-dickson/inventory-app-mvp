interface Category {
  category: string;
  units: Unit[];
}

interface Unit {
  // LIKELY WILL GO AWAY AND SIMPLY ADD 's' TO UNIT
  singular: string;
  plural: string;
}

export class UnitsCategories {
  public categories: Category[];

  constructor(categories: Category[]) {
    this.categories = categories;
  }
}

export const defaultUnits = new UnitsCategories([
  {
    category: 'Per Item, unmeasured',
    units: [
      { singular: 'each', plural: 'each' },
      { singular: 'piece', plural: 'pieces' },
      { singular: 'bunch', plural: 'bunches' }, // BUNCHES IS SO FAR THE
      // ONLY OUTLIER, NEEDED FOR BUNCHES OF GREENS/HERBS ETC. COMMON USAGE
    ],
  },
  {
    category: 'Weight',
    units: [
      { singular: 'ounce', plural: 'ounces' },
      { singular: 'pound', plural: 'pounds' },
      { singular: 'gram', plural: 'grams' },
      { singular: 'kilogram', plural: 'kilograms' },
    ],
  },
  {
    category: 'Volume',
    units: [
      { singular: 'fluid ounces', plural: 'fluid ounce' },
      { singular: 'pint', plural: 'pints' },
      { singular: 'quart', plural: 'quarts' },
      { singular: 'gallon', plural: 'gallons' },
      { singular: 'milliliter', plural: 'milliliters' },
      { singular: 'liter', plural: 'liters' },
    ],
  },
]);
