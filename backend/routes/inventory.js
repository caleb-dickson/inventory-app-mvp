const express = require("express");

const InventoryController = require("../controllers/inventory");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();

// PRODUCTS
// Create a new product for business
router.post("/new-product", checkAuth, InventoryController.createProduct);
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
