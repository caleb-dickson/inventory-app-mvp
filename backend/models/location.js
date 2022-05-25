const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  locationName: { type: String, required: true },
  parentBusiness: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Business",
  },
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

locationSchema.methods.updateLocation = async function (locationUpdateData) {
  this.locationName = locationUpdateData.locationName;
  this.parentBusiness = locationUpdateData.parentBusiness;
  this.productList = locationUpdateData.productList;
  this.inventoryData = locationUpdateData.inventoryData;

  return this.save();
};

locationSchema.methods.addProductToList = async function (newProduct) {

  this.productList.push({ product: newProduct })

  return this.save();
};

locationSchema.methods.addInventory = async function (newInventory) {

  this.inventoryData.push({ inventory: newInventory })

  return this.save();
};


module.exports = mongoose.model("Location", locationSchema);
