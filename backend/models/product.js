const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  parentOrg: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // ref: "Business", REMOVED, MAY CAUSE BUGS?
  },
  isActive: { type: Boolean, required: true, default: true },
  department: { type: String, required: true },
  category: { type: String, required: true },
  name: { type: String, required: true },
  unitSize: { type: Number, required: true },
  unitMeasure: {
    singular: { type: String, required: true },
    plural: { type: String, required: true },
  },
  unitsPerPack: { type: Number, required: true },
  packsPerCase: { type: Number, required: true },
  casePrice: { type: Number, required: true },
  par: { type: Number, required: true },
});

module.exports = mongoose.model("Product", productSchema);
