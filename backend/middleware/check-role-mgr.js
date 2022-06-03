const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {
      email: decodedToken.email,
      userId: decodedToken.userId,
      userRole: decodedToken.userRole,
    };
    console.log(req.userData);
    console.log("||| checkAuth here ^^^ |||");
    if (+req.userData.userRole > 1) {
      next();
    } else {
      res.status(403).json({
        message:
          "Access not authorized. This feature requires elevated permissions.",
      });
    }
  } catch (error) {
    res.status(401).json({ message: "Not authenticated! Log in." });
  }
};
