const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  parentOrg: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // ref: "Business", REMOVED, MAY CAUSE BUGS, MAYBE NOT?
  },
  category: { type: String, required: true, default: "Uncategorized" },
  name: { type: String, required: true },
  unitSize: { type: Number, required: true },
  unit: {
    singular: { type: String, required: true },
    plural: { type: String, required: true },
  },
  packSize: { type: Number, required: true },
  packPrice: { type: Number, required: true, default: 0 },
  par: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Product", productSchema);
