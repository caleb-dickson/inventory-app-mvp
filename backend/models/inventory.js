const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema({
  dateStart: { type: String, required: true },
  dateEnd: { type: String, required: true },
  department: { type: String, required: true }, // BOH OR FOH or ...
  isFinal: { type: Boolean, required: true },
  inventory: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Product",
      },
      quantity: { type: Number, required: false },
    },
  ],
});

module.exports = mongoose.model("Inventory", inventorySchema);
