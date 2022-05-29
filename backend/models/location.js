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
        ref: "User"
      },
    },
  ],
  staff: [
    {
      staffMember: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User"
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

// TO ADD A LIST OF MANAGERS TO A LOCATION BY EMAIL
locationSchema.methods.addManagers = async function (managerEmails) {
  let newManagers = [];

  let foundManagers = await User.find({
    email: { $in: managerEmails },
  });
  console.log(foundManagers);
  console.log("||| found managers here ^^^ |||");

  foundManagers.forEach(manager => {
    newManagers.push({ manager: manager._id })
  });

  // NEW ARRAY OF CURRENT MANAGERS
  let currentManagers = [...this.managers];

  let updatedManagers = currentManagers.concat(newManagers);

  this.managers = updatedManagers;

  // FIND AND RETURN ANY MANAGER USERS WITH MATCHING EMAILS QUERY

  return this.save();
};

locationSchema.methods.addStaff = async function (newStaffList) {
  let staffList = [...this.staff];
  let newStaff = staffList.concat(newStaffList);

  this.staff = newStaff;

  return this.save();
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
