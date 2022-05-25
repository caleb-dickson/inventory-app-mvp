const mongoose = require("mongoose");

const businessSchema = mongoose.Schema({
  businessName: { type: String, required: true, unique: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  locations: [
    // ALL THE LOCATIONS OWNED BY THIS BUSINESS(OBJ) (AND OWNER(USER))
    {
      location: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Location",
      },
    },
  ],
});

businessSchema.methods.addLocationToBusiness = async function (newLocationId) {

  this.locations.push({ location: newLocationId });

  return this.save();
};

module.exports = mongoose.model("Business", businessSchema);
