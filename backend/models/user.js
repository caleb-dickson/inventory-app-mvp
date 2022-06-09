const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  userProfile: {
    role: { type: Number, required: true },
    department: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    themePref: { type: String, required: true, default: "theme-dark" }
  }
});

userSchema.methods.ownerAddBusiness = function (newBusiness) {

  this.userProfile.business = newBusiness._id;

  return this.save();
};

module.exports = mongoose.model("User", userSchema);
