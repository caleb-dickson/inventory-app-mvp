// REMOVE THIS ON DEPLOYMENT
const nodemon = require("../../nodemon.json");

const Location = require("../models/location");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
// const sendGridTransport = require("nodemailer-sendgrid-transport");
const sendGridMail = require("@sendgrid/mail");

// ON DEPLOYMENT, SWITCH TO "process.env.SENDGRID_API_KEY"
sendGridMail.setApiKey(nodemon.env.SENDGRID_API_KEY);

const User = require("../models/user");

// CREATE NEW USER
exports.signup = async (req, res, next) => {
  // REMOVE THIS CONSOLE.LOG ON DEPLOYMENT
  console.log(req.body);

  try {
    const hash = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      password: hash,
      userProfile: {
        role: req.body.userProfile.role,
        department: req.body.userProfile.department,
        firstName: req.body.userProfile.firstName,
        lastName: req.body.userProfile.lastName,
        phoneNumber: req.body.userProfile.phoneNumber,
        themePref: req.body.userProfile.themePref,
        businessId: req.body.userProfile.businessId,
        location: req.body.userProfile.location,
      },
    });

    // CUSTOM "UNIQUE EMAIL" VALIDATOR
    try {
      const checkEmailUnique = await User.findOne({ email: req.body.email });
      console.log("||| checking email unique |||");
      console.log(checkEmailUnique);
      if (checkEmailUnique && checkEmailUnique.email) {
        res.status(422).json({
          message:
            "Email already in use. Please sign in or create your account with a different email.",
        });
      }
    } catch (error) {
      console.log(error);
      if (!res.headersSent) {
        res.status(500).json({
          message: "Signup failed! Please try again.",
          message: error,
        });
      }
    }
    // CUSTOM "UNIQUE EMAIL" VALIDATOR // END

    const newUser = await user.save();

    sendGridMail.send({
      to: req.body.email,
      from: "info@calebdickson.com",
      subject: "Welcome to InventoryApp!",
      html: `<style>
      main {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
          Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      }
      .title {
        color: #363636;
      }
    </style>
    <script defer></script>
    <main>
      <body>
        <h1 class="title">You have successfully signed up for "Inventory App"</h1>
        <p>Welcome!</p>
        <p>Click <a href="http://localhost:4200">here</a> to confirm your email</p>
      </body>
    </main>`,
    });

    res.status(201).json({
      message: "Signup successful! Check your email.",
      result: newUser,
    });
  } catch (error) {
    console.log(error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Signup failed! Please try again.",
        message: error,
      });
    }
  }
};
// CREATE NEW USER /// END

// USER LOGIN
exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(422).json({
        message: "Login failed. User not found.",
      });
    } else if (user) {
      const bcryptRes = await bcrypt.compare(req.body.password, user.password);
      if (!bcryptRes) {
        res.status(401).json({
          message: "Login failed. Password incorrect.",
        });
      }
    }

    const userToken = jwt.sign(
      {
        email: user.email,
        userId: user._id,
        userRole: user.userProfile.role,
      },
      process.env.JWT_KEY,
      { expiresIn: "4h" }
    );

    res.status(200).json({
      token: userToken,
      expiresIn: 14400,
      user: user,
      userId: user._id,
    });
  } catch (error) {
    console.log(error);
    if (!res.headersSent) {
      return res.status(500).json({
        message: error,
      });
    }
  }
};
// USER LOGIN /// END

// ||| Unfinished Unfinished Unfinished Unfinished Unfinished |||
// FETCH ALL LOCATIONS WHERE USER IS AUTHORIZED
exports.getUserLocations = async (req, res, next) => {
  try {
    if (+req.params.userRole === 2) {
      const userLocations = await Location.find({ manager: req.params.userId });
    }
    if (+req.params.userRole === 1) {
      const userLocations = await Location.find({
        staffMember: req.params.userId,
      });
    }
    console.log(userLocations);
    console.log("||| ^^^ userLocations here ^^^");

    if (userLocations) {
      res.status(200).json({ fetchedLocations: userLocations });
    }
    if (!userLocations) {
      res
        .status(404)
        .json({ message: "No authorized locations were found for this user." });
    }
  } catch (error) {
    // CATCH AND RETURN UNEXPECTED ERRORS
    console.log(error);
    res.status(500).json({
      message: error._message,
    });
  }
};
// FETCH ALL LOCATIONS WHERE USER IS AUTHORIZED /// END
