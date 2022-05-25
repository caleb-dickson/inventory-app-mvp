const Business = require("../models/business");
const Location = require("../models/location");
const User = require("../models/user");


// CREATE NEW BUSINESS
exports.createBusiness = async (req, res, next) => {
  try {
    const business = new Business({
      businessName: req.body.businessName,
      ownerId: req.body.ownerId,
      locations: [],
    });

    try {
      // CUSTOM "UNIQUE BUSINESS" VALIDATOR. EACH OWNER ACCOUNT ONLY
      // HAS ONE BUSINESS PER ACCOUNT
      // THE BUSINESS IS THE CONTAINER AND MANAGER FOR ALL APP OPERATIONS
      const checkOnlyOwnersBusiness = await Business.findOne({
        ownerId: req.body.ownerId,
      });
      console.log("||| checking business is only owners business |||");
      console.log(checkOnlyOwnersBusiness);
      if (checkOnlyOwnersBusiness) {
        res.status(422).json({
          message:
            "Invalid submit. If you're sure this is an error, please contact tech support via the help section.",
        });
      }
    } catch (error) {
      console.log(error);
      if (!res.headersSent) {
        res.status(500).json({
          message: error,
        });
      }
    }

    const newBusiness = await business.save();
    console.log("||| newBusiness |||");
    console.log(newBusiness);

    const ownerUser = await User.findById(req.body.ownerId);
    console.log("||| ownerUser |||");
    console.log(ownerUser);

    const updatedOwner = await ownerUser.ownerAddBusiness(newBusiness);
    console.log("||| updatedOwner |||");
    console.log(updatedOwner);

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
    console.log(error);
    if (!res.headersSent) {
      res.status(500).json({
        message: error._message,
      });
    }
  }
};
// CREATE NEW BUSINESS ///

// FETCH OWNER'S BUSINESS AND POPULATE ALL LOCATIONS ASSOCIATED
exports.getOwnersBusiness = async (req, res, next) => {
  try {
    const foundBusiness = await Business.findOne({
      ownerId: req.params.ownerId,
    }).populate({ path: "locations.location", model: "Location" });

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
        message: "Owner has no businesses yet.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};
// FETCH OWNER'S BUSINESS AND POPULATE ALL LOCATIONS ASSOCIATED ///

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
    console.log(error);
    if (!res.headersSent) {
      res.status(500).json({
        message: error,
      });
    }
  }
};
// EDIT/UPDATE BUSINESS (businessName) ///

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
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};
// CREATE NEW LOCATION

// EDIT/UPDATE LOCATION (locationName)
exports.updateLocation = async (req, res, next) => {
  console.log("||| req.body |||");
  console.log(req.body);
  try {
    const foundLocation = await Location.findById(req.body.locationUpdateData._id);
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
    console.log(error);
    if (!res.headersSent) {
      res.status(500).json({
        message: error._message,
      });
    }
  }
};
// EDIT/UPDATE LOCATION (locationName) ///


exports.getLocations = async (req, res, next) => {
  try {
    const parentBiz = req.params.parentId;
  } catch (error) {
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
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};
