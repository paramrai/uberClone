const express = require("express");
const { authUser, authCaptain } = require("../middlewares/auth.middleware");
const {
  createRide,
  getFare,
  startRide,
  endRide,
  acceptRideRequest,
} = require("../controllers/ride.controller");
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

router.post(
  "/acceptRideRequest",
  authUser,
  body("rideId").isMongoId().withMessage("invalid ride id"),
  acceptRideRequest
);

router.get(
  "/start-ride",
  authCaptain,
  query("rideId").isMongoId().withMessage("Invalid ride id"),
  query("otp")
    .isString()
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid otp id"),
  startRide
);

router.post(
  "/end-ride",
  authCaptain,
  body("rideId").isMongoId().withMessage("Invalid ride id"),
  endRide
);

module.exports = router;
