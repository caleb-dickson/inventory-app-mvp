const express = require("express");

const BusinessController = require("../controllers/business");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();

// BUSINESS
// Create new business (owner user only) = DONE
router.post("/create-business", checkAuth, BusinessController.createBusiness);
// Update business name = DONE
router.put("/update-business/", checkAuth, BusinessController.updateBusiness);
// Fetch owner's business = DONE
router.get("/fetch-business/:ownerId", checkAuth, BusinessController.getOwnersBusiness);


// LOCATIONS
// Create new location (owner only) = DONE
router.post("/create-location", checkAuth, BusinessController.createLocation);
// Fetch all locations docs for business = NEED
router.get("/fetch-locations/:parentId", checkAuth, BusinessController.getLocations);
// Update one location = DONE
router.put("/update-location/", checkAuth, BusinessController.updateLocation);



// PRODUCTS
// Fetch all products docs for business = NEED
router.get("/fetch-products/:businessId", checkAuth, BusinessController.getProducts);



// INVENTORY
// Fetch all inventories for location = NEED
router.get("/fetch-inventory/:locationId", checkAuth, BusinessController.getInventories);



module.exports = router;
