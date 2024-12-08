const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/user.controller");
const { authUser } = require("../middlewares/auth.middleware");

// register
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.registerUser
);

// login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email or password is incorrect"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Email or password is incorrect"),
  ],
  userController.loginUser
);

// go to profile
router.get("/profile", authUser, userController.getUserProfile);

// logout
router.get("/logout", authUser, userController.logoutUser);
module.exports = router;
