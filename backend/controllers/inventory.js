const Inventory = require("../models/inventory");
const Product = require("../models/product");

// NONE OF THIS IS REAL YET, BOILERPLATE
// NONE OF THIS IS REAL YET, BOILERPLATE
// NONE OF THIS IS REAL YET, BOILERPLATE

exports.createInventory = async (req, res, next) => {
  try {
    const inventory = new Inventory({
      dateStart: req.body.dateStart,
      dateEnd: req.body.dateEnd,
      type: req.body.type,
      inventory: [],
    });

    const newInventory = await inventory.save();
    console.log(newInventory);

    res.status(201).json({
      message: "Inventory created successfully",
      inventory: {
        ...newInventory._doc,
        id: newInventory._id,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = new Product({
      category: req.body.category,
      name: req.body.name,
      unitSize: req.body.unitSize,
      unit: req.body.unit,
      packSize: req.body.packSize,
      packPrice: req.body.packPrice,
      par: req.body.par,
    });

    const newProduct = await product.save();
    console.log(newProduct);

    res.status(201).json({
      message: "Product created successfully",
      product: {
        ...newProduct._doc,
        id: newProduct._id,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};
