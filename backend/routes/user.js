const express = require("express");

const UserController = require("../controllers/user");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.post("/signup", UserController.signup);

router.post("/login", UserController.login);

// Fetch all locations where user is authorized
router.get("/fetch-user-locations/:userId/:userRole", checkAuth, UserController.getUserLocations)



module.exports = router;
