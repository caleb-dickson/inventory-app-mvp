const express = require("express");

const BusinessController = require("../controllers/business");

const checkAuth = require("../middleware/check-auth");
const checkOwner = require("../middleware/check-role-owner");
const checkMgr = require("../middleware/check-role-mgr");

const router = express.Router();

// BUSINESS
// Create new business = DONE
router.post(
  "/create-business",
  checkAuth,
  checkOwner,
  BusinessController.createBusiness
);
// Update business name = DONE
router.put(
  "/update-business/",
  checkAuth,
  checkOwner,
  BusinessController.updateBusiness
);
// Fetch owner's business = DONE
router.get(
  "/fetch-business/:ownerId",
  checkAuth,
  checkOwner,
  BusinessController.getOwnersBusiness
);

// LOCATIONS
// Create new location = DONE
router.post(
  "/create-location",
  checkAuth,
  checkOwner,
  BusinessController.createLocation
);
// Fetch all locations docs for business = WORKING
router.get(
  "/fetch-business-locations/:businessId",
  checkAuth,
  checkOwner,
  BusinessController.getBusinessLocations
);

// Update one location = DONE
router.put(
  "/update-location",
  checkAuth,
  checkMgr,
  BusinessController.updateLocation
);
// Add managers to location = DONE
router.put(
  "/add-location-users",
  checkAuth,
  checkOwner,
  BusinessController.addUsersToLocation
);

// PRODUCTS
// Fetch all products docs for business = NEED?
// router.get(
//   "/fetch-products/:businessId",
//   checkAuth,
//   BusinessController.getProducts
// );

// INVENTORY
// Fetch all inventories for location = NEED
router.get(
  "/fetch-inventory/:locationId",
  checkAuth,
  checkMgr,
  BusinessController.getInventories
);

module.exports = router;
