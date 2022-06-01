const Location = require("../models/location");
const Inventory = require("../models/inventory");
const Product = require("../models/product");

// NONE OF THIS IS REAL YET, BOILERPLATE
// NONE OF THIS IS REAL YET, BOILERPLATE
// NONE OF THIS IS REAL YET, BOILERPLATE

exports.fetchUserLocations = async (req, res, next) => {
  // FUTURE DEVELOPMENT???: LOOK FOR USER IN BOTH LISTS
  // IF USER IS FOUND IN A MANAGER LIST AND THEIR ROLE ISN'T
  // AS MANAGER, UPDATE USER ROLE TO "2"
  try {
    let userLocations;

    // IF USER IS A MANAGER
    if (+req.params.userRole === 2) {
      // LOOK FOR THIS USER'S ID IN ALL LOCATION'S MANAGERS LIST
      userLocations = await Location.find({
        "managers.manager": req.params.userId
      })
        .populate({
          path: "productList.product",
          model: "Product",
        })
        .populate({
          path: "inventoryData.inventory",
          model: "Inventory",
        });
      console.log(userLocations);
      console.log("||| ^^^ found locations here ^^^ |||");

      // IF USER IS NOT A MANAGER (JUNIOR STAFF)
    } else if (+req.params.userRole === 1) {
      // LOOK FOR THIS USER IN ALL LOCATION'S STAFF LIST
      userLocations = await Location.find({
        "staff.staffMember": req.params.userId
      })
        .populate({
          path: "productList.product",
          model: "Product",
        })
        .populate({
          path: "inventoryData.inventory",
          model: "Inventory",
        });
      console.log(userLocations);
      console.log("||| ^^^ found locations here ^^^ |||");
    }

    // IF USER WAS FOUND IN ANY LOCATION
    if (userLocations) {
      // RESPOND WITH ALL LOCATIONS (with populated product and inventory lists)
      // WHERE USER WAS FOUND
      res.status(200).json({ fetchedLocations: userLocations });
    }
    // IF USER WAS NOT FOUND IN ANY LOCATION
    if (!userLocations) {
      // RESPOND WITH AN ERROR MESSAGE
      res.status(404).json({
        message:
          "No authorized locations found. Ask the account owner for access.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};

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
