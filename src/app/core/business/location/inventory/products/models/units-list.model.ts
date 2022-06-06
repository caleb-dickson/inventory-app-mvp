
interface Category {
  category: string;
  units: Unit[];
}

interface Unit {
  singular: string,
  plural: string
}

export const defaultUnits: UnitsCategories = {
  categories: [
    {
      category: 'Per, unmeasured',
      units: [
        { singular: 'peice', plural: 'peices' },
        { singular: 'bunch', plural: 'bunches' },
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
  ],
};

export class UnitsCategories {
  public categories: Category[];

  constructor(categories: Category[]) {
    this.categories = categories;
  }

}

