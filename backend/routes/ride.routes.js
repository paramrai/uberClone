const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const { createRide, getFare } = require("../controllers/ride.controller");
const { body, query } = require("express-validator");
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
    .isIn(["car", "auto", "moto"])
    .withMessage("Valid vehicle type is required"),
  createRide
);

router.get(
  "/get-fare",
  authUser,
  query("pickup")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Valid Pickup address is required"),
  query("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Valid destination address is required"),
  getFare
);

module.exports = router;
