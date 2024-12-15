const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const { createRide } = require("../controllers/ride.controller");
const { body } = require("express-validator");
const router = express.Router();

router.post(
  "/create",
  authUser,
  body("pickup")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Valid Pickup address is required"),
  body("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Valid destination address is required"),
  body("vehicleType")
    .isIn(["car", "bike", "moto"])
    .withMessage("Valid vehicle type is required"),
  createRide
);

module.exports = router;
