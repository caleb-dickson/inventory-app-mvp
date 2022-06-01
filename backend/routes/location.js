const express = require("express");

const LocationController = require("../controllers/location");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();

// LOCATIONS
// Fetch all locations where iser is autorized
router.get(
  "/fetch-user-locations/:userId/:userRole",
  checkAuth,
  LocationController.fetchUserLocations
);

// PRODUCTS
// Create a new product for business
router.post("/new-product", checkAuth, LocationController.createProduct);
// Update product businesswide (parentOrg is the business)
// ================================ //

// Add a product to the Location's product list (pull data from the
// business product, create new copy witht the location as the parentOrg)
// ================================ //

// Fetch all products associated with parentOrg
// ================================ //

// INVENTORY
// Start new inventory
// ================================ //

// Update existing inventory
// ================================ //

// Fetch all inventories of the parentOrg
// ================================ //

module.exports = router;
