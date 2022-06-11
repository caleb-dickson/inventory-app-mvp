const Location = require("../models/location");
const Inventory = require("../models/inventory");
const Product = require("../models/product");

exports.fetchUserLocations = async (req, res, next) => {
  // IDEA FOR FUTURE DEVELOPMENT??: LOOK FOR USER IN BOTH LISTS
  // IF USER IS FOUND IN A MANAGER LIST AND THEIR ROLE ISN'T
  // AS MANAGER, UPDATE USER ROLE TO MANAGER; "2"
  try {
    let userLocations;

    // IF USER IS A MANAGER
    if (+req.params.userRole === 2) {
      // LOOK FOR THIS USER'S ID IN ALL LOCATION'S MANAGERS LIST
      userLocations = await Location.find({
        "managers.manager": req.params.userId,
      })
        .populate({
          path: "productList.product",
          model: "Product",
        })
        .populate({
          path: "inventoryData.inventory",
          model: "Inventory",
        })
        .populate({
          path: "managers.manager",
          model: "User",
        })
        .populate({
          path: "staff.staffMember",
          model: "User",
        })
        .populate({
          path: "parentBusiness",
          model: "Business",
        });
      console.log(userLocations);
      console.log("||| ^^^ found locations here ^^^ |||");

      // IF USER IS NOT A MANAGER (JUNIOR STAFF)
    } else if (+req.params.userRole === 1) {
      // LOOK FOR THIS USER IN ALL LOCATION'S STAFF LIST
      userLocations = await Location.find({
        "staff.staffMember": req.params.userId,
      })
        .populate({
          path: "productList.product",
          model: "Product",
        })
        .populate({
          path: "inventoryData.inventory",
          model: "Inventory",
        })
        .populate({
          path: "managers.manager",
          model: "User",
        })
        .populate({
          path: "staff.staffMember",
          model: "User",
        })
        .populate({
          path: "parentBusiness",
          model: "Business",
        });
      console.log(userLocations);
      console.log("||| ^^^ found locations here ^^^ |||");
    }

    // IF USER WAS FOUND IN ANY LOCATION'S STAFF LIST
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

// UNFINISHED - WORKING
exports.createInventory = async (req, res, next) => {
  console.log(req.body);
  console.log("||| ^^^ req.body ^^^ |||");

  try {
    const parentLocation = await Location.findById(req.body.location._id);

    const inventory = new Inventory({
      parentLocation: req.body.location._id,
      dateStart: req.body.inventory.dateStart,
      dateEnd: req.body.inventory.dateEnd,
      department: req.body.inventory.department,
      isFinal: req.body.inventory.isFinal,
      inventory: req.body.inventory.inventory,
    });
    const newInventory = await inventory.save();
    console.log(newInventory);
    console.log("||| ^^^ saved inventory ^^^ |||");

    const modifiedLocation = await parentLocation.addNewInventory(newInventory);

    const updatedLocation = await Location.findById(parentLocation._id)
    .populate({
      path: "parentBusiness",
      model: "Business",
    })
      .populate({
        path: "productList.product",
        model: "Product",
      })
      .populate({
        path: "inventoryData.inventory",
        model: "Inventory",
      })
      .populate({
        path: "managers.manager",
        model: "User",
      })
      .populate({
        path: "staff.staffMember",
        model: "User",
      })

    res.status(201).json({
      message: "Inventory created successfully",
      newInventory: {
        inventory: newInventory._doc,
        inventoryId: newInventory._id,
      },
      updatedLocation: updatedLocation,
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
      parentOrg: req.body.product.parentOrg,
      isActive: req.body.product.isActive,
      department: req.body.product.department,
      category: req.body.product.category,
      name: req.body.product.name,
      unitSize: req.body.product.unitSize,
      unitMeasure: req.body.product.unitMeasure,
      unitsPerPack: req.body.product.unitsPerPack,
      packsPerCase: req.body.product.packsPerCase,
      casePrice: req.body.product.casePrice,
      par: req.body.product.par,
    });

    const newProduct = await product.save();
    console.log(newProduct);
    console.log("||| ^^^ new saved product here ^^^ |||");

    const locationToUpdate = await Location.findById(req.body.locationId);

    await locationToUpdate.addProductToList(newProduct);

    const populatedLocation = await Location.findById(req.body.locationId)
      .populate({
        path: "productList.product",
        model: "Product",
      })
      .populate({
        path: "inventoryData.inventory",
        model: "Inventory",
      });

    res.status(201).json({
      message:
        "||| " +
        newProduct.name +
        " successfully created and added to " +
        populatedLocation.locationName +
        " |||",
      updatedActiveLocation: populatedLocation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};
