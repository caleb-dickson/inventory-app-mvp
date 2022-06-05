const Business = require("../models/business");
const Location = require("../models/location");
const User = require("../models/user");

// CREATE NEW BUSINESS
exports.createBusiness = async (req, res, next) => {
  try {
    // DEFINE THE NEW BUSINESS
    const business = new Business({
      businessName: req.body.businessName,
      ownerId: req.body.ownerId,
      locations: [],
    });

    try {
      // CUSTOM "UNIQUE BUSINESS" VALIDATOR. EACH OWNER ACCOUNT ONLY
      // HAS ONE BUSINESS PER ACCOUNT
      // THE BUSINESS IS THE CONTAINER AND MANAGER FOR MOST APP OPERATIONS
      const checkOnlyOwnersBusiness = await Business.findOne({
        ownerId: req.body.ownerId,
      });
      console.log("||| checking business is only owners business |||");
      console.log(checkOnlyOwnersBusiness);
      if (checkOnlyOwnersBusiness) {
        // IF THE USER ALREADY HAS A BUSINESS, RETURN ERROR 422
        res.status(422).json({
          message:
            "Invalid submit. If you're sure this is an error, please contact tech support via the help section.",
        });
      }
    } catch (error) {
      // CATCH AND RETURN UNEXPECTED ERRORS
      console.log(error);
      if (!res.headersSent) {
        res.status(500).json({
          message: error,
        });
      }
    }

    // IF NO EXISTING BUSINESS WAS FOUND, SAVE THE DEFINED BUSINESS
    const newBusiness = await business.save();
    console.log("||| newBusiness |||");
    console.log(newBusiness);

    // PULL THE USER (OWNER) DOC FROM DB
    const ownerUser = await User.findById(req.body.ownerId);
    console.log("||| ownerUser |||");
    console.log(ownerUser);

    // ADD THE NEW BUSINESS TO THE USERPROFILE
    const updatedOwner = await ownerUser.ownerAddBusiness(newBusiness);
    console.log("||| updatedOwner |||");
    console.log(updatedOwner);

    // SEND BACK THE DATA TO THE CLIENT
    res.status(201).json({
      message: "Business created successfully",
      business: {
        ...newBusiness._doc,
      },
      businessId: newBusiness._id,
      updatedUser: updatedOwner,
      updatedUserId: updatedOwner._id,
    });
  } catch (error) {
    // CATCH AND RETURN UNEXPECTED ERRORS
    console.log(error);
    if (!res.headersSent) {
      res.status(500).json({
        message: error._message,
      });
    }
  }
};
// CREATE NEW BUSINESS /// END

// FETCH OWNER'S BUSINESS AND POPULATE ALL LOCATIONS ASSOCIATED
exports.getOwnersBusiness = async (req, res, next) => {
  try {
    const foundBusiness = await Business.findOne({
      ownerId: req.params.ownerId,
    }).populate({
      path: "locations.location",
      populate: { path: "managers.manager" },
      model: "Location",
    });

    if (foundBusiness && foundBusiness._id) {
      console.log("||| found and populated? |||");
      console.log(foundBusiness.locations);
      res.status(200).json({
        message: "Owner's business found.",
        business: foundBusiness,
        businessId: foundBusiness._id,
      });
    }
    if (!foundBusiness) {
      res.status(404).json({
        message: "Owner has no business yet.",
      });
    }
  } catch (error) {
    // CATCH AND RETURN UNEXPECTED ERRORS
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};
// FETCH OWNER'S BUSINESS AND POPULATE ALL LOCATIONS ASSOCIATED /// END

// EDIT/UPDATE BUSINESS (businessName)
exports.updateBusiness = async (req, res, next) => {
  try {
    let business = await Business.findByIdAndUpdate(req.body.businessId, {
      businessName: req.body.updatedBusinessName,
    });

    business = await Business.findById(req.body.businessId).populate({
      path: "locations.location",
      model: "Location",
    });

    console.log("||| updated, populated? business |||");
    console.log(business);

    res.status(200).json({
      message: "Business name updated successfully",
    });
  } catch (error) {
    // CATCH AND RETURN UNEXPECTED ERRORS
    console.log(error);
    if (!res.headersSent) {
      res.status(500).json({
        message: error,
      });
    }
  }
};
// EDIT/UPDATE BUSINESS (businessName) /// END

// CREATE NEW LOCATION
exports.createLocation = async (req, res, next) => {
  try {
    // DEFINE THE NEW LOCATION
    const newLocation = new Location({
      locationName: req.body.locationName,
      parentBusiness: req.body.parentBusiness,
      inventoryData: [],
    });

    // SAVE NEW LOCATION TO THE DB
    const savedLocation = await newLocation.save();
    console.log(savedLocation);

    // RETRIEVE THE PARENT BUSINESS DOC
    const parentBusiness = await Business.findById(req.body.parentBusiness);
    console.log("||| Parent Business findById |||");
    console.log(parentBusiness);

    // PULL ALL LOCATIONS INTO THE PARENT BUSINESS IN DB
    await parentBusiness.addLocationToBusiness(savedLocation._id);

    const updatedBusiness = await parentBusiness.populate({
      path: "locations.location",
      model: "Location",
    });
    console.log(updatedBusiness.locations);

    res.status(201).json({
      message: "Location created successfully",
      location: {
        createdLoc: savedLocation._doc,
        id: savedLocation._id,
      },
      updatedBusiness: {
        business: updatedBusiness._doc,
        id: updatedBusiness._id,
      },
    });
  } catch (error) {
    // CATCH AND RETURN UNEXPECTED ERRORS
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};
// CREATE NEW LOCATION /// END

// EDIT/UPDATE LOCATION (locationName)
exports.updateLocation = async (req, res, next) => {
  console.log("||| req.body |||");
  console.log(req.body);
  try {
    const foundLocation = await Location.findById(
      req.body.locationUpdateData._id
    );
    console.log("||| found location |||");
    console.log(foundLocation);

    const updatedLocation = await foundLocation.updateLocation(
      req.body.locationUpdateData
    );

    console.log("||| updated? location |||");
    console.log(updatedLocation);

    res.status(200).json({
      message: "Location name updated successfully",
    });
  } catch (error) {
    // CATCH AND RETURN UNEXPECTED ERRORS
    console.log(error);
    if (!res.headersSent) {
      res.status(500).json({
        message: error._message,
      });
    }
  }
};
// EDIT/UPDATE LOCATION (locationName) /// END

exports.addUsersToLocation = async (req, res, next) => {
  try {
    console.log(req.body);
    console.log("||| ^^^ req.body ^^^ |||");
    const locationForAdd = await Location.findById(req.body.location);

    // FOR managers
    if (req.body.role === 'manager') {
      const updatedLocation = await locationForAdd.addManagers(
        req.body.emails
      );
      console.log(updatedLocation);
      console.log("||| ^^^ updated location here ^^^ |||");
      if (updatedLocation === "Not found.") {
        res.status(404).json({
          message: "Couldn't find a manager. Are all users signed up as Manager?",
        });
      } else {
        res.status(200).json({
          message: "Manager was found and added to the location.",
          businessId: locationForAdd.parentBusiness
        });
      }

      // FOR staff
    } else if (req.body.role === 'staff') {
      const updatedLocation = await locationForAdd.addStaff(
        req.body.emails
      );
      console.log("||| ^^^ updated location here ^^^ |||");
      console.log(updatedLocation);
      if (updatedLocation === "Not found.") {
        res.status(404).json({
          message: "Couldn't find a staff member. Are all users signed up as Staff?",
        });
      } else {
        res.status(200).json({
          message: "Staff member was found and added to the location.",
          businessId: locationForAdd.parentBusiness
        });
      }
    }

  } catch (error) {
    // CATCH AND RETURN UNEXPECTED ERRORS
    console.log(error);
    if (!res.headersSent) {
      res.status(500).json({
        message: error,
      });
    }
  }
};

exports.getBusinessLocations = async (req, res, next) => {
  try {
    console.log(req.params.businessId);
    console.log("||| ^^^ req.params.businessId ^^^ |||");

    const bizLocations = await Location.find({
      parentBusiness: req.params.businessId,
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
        path: "productList.product",
        model: "Product",
      })
      .populate({
        path: "inventoryData.inventory",
        model: "Inventory",
      })
    console.log(bizLocations);
    console.log("||| ^^^ found locations here ^^^ |||");

    if (bizLocations) {
      res.status(200).json({ fetchedLocations: bizLocations });
    }
    if (!bizLocations) {
      res.status(404).json({ message: "No locations were found" });
    }
  } catch (error) {
    // CATCH AND RETURN UNEXPECTED ERRORS
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const businessId = req.params.businessId;
  } catch (error) {
    // CATCH AND RETURN UNEXPECTED ERRORS
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};

exports.getInventories = async (req, res, next) => {
  try {
    const locationId = req.params.locationId;
  } catch (error) {
    // CATCH AND RETURN UNEXPECTED ERRORS
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};
