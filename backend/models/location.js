const mongoose = require("mongoose");
const User = require("./user");

const locationSchema = mongoose.Schema({
  locationName: { type: String, required: true },
  parentBusiness: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Business",
  },
  managers: [
    {
      manager: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User",
      },
    },
  ],
  staff: [
    {
      staffMember: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User",
      },
    },
  ],
  productList: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Product",
      },
    },
  ],
  inventoryData: [
    {
      inventory: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Inventory",
      },
    },
  ],
});

// USED TO UPDATE SIMPLE LOCATION DATA AND RETURN THE LATEST FROM DB
locationSchema.methods.updateLocation = async function (locationUpdateData) {
  this.locationName = locationUpdateData.locationName;
  this.parentBusiness = locationUpdateData.parentBusiness;
  this.productList = locationUpdateData.productList;
  this.inventoryData = locationUpdateData.inventoryData;

  return this.save();
};

// TO ADD A LIST OF AUTHORIZED MANAGERS (User Refs) TO A LOCATION BY EMAIL
locationSchema.methods.addManagers = async function (managerEmails) {
  const currentManagers = this.managers
  let newManagers = [];

  // FIND AND RETURN ANY MANAGER USERS WITH MATCHING EMAILS QUERY
  let foundManagers = await User.find({
    email: { $in: managerEmails },
  });
  console.log(foundManagers);
  console.log("||| found managers here ^^^ |||");

  foundManagers.forEach((manager) => {
    newManagers.push({ manager: manager._id });
  });

  // IF NEW MANAGERS WERE FOUND AND ADDED
  if (newManagers.length > currentManagers.length) {

    // NEW ARRAY OF CURRENT MANAGERS
    let currentManagers = [...this.managers];

    let updatedManagers = currentManagers.concat(newManagers);

    this.managers = updatedManagers;

    return this.save();
    // IF NO MANAGERS WERE ADDED
  } else if (newManagers.length <= currentManagers.length) {
    return 'Not found.'
  }
};

// ADD A LIST OF AUTHORIZED JUNIOR STAFF (User Refs) TO A LOCATION BY EMAIL
locationSchema.methods.addStaff = async function (emails) {
  const currentStaff = this.staff
  let newStaff = [];

  // FIND AND RETURN ANY MANAGER USERS WITH MATCHING EMAILS QUERY
  let foundStaff = await User.find({
    email: { $in: emails },
  });
  console.log(foundStaff);
  console.log("||| found staff here ^^^ |||");

  foundStaff.forEach((staffUser) => {
    newStaff.push({ staffMember: staffUser._id });
  });

  // IF NEW MANAGERS WERE FOUND AND ADDED
  if (newStaff.length > currentStaff.length) {

    // NEW ARRAY OF CURRENT MANAGERS
    let currentStaff = [...this.managers];

    let updatedStaff = currentStaff.concat(newStaff);

    this.managers = updatedStaff;

    return this.save();
    // IF NO STAFF MEMBERS WERE ADDED
  } else if (newStaff.length <= currentStaff.length) {
    return 'Not found.'
  }
};


locationSchema.methods.addProductToList = async function (newProduct) {
  this.productList.push({ product: newProduct });
  return this.save();
};

locationSchema.methods.addInventory = async function (newInventory) {
  this.inventoryData.push({ inventory: newInventory });
  return this.save();
};

module.exports = mongoose.model("Location", locationSchema);
