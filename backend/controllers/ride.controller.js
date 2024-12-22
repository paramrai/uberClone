const rideModel = require("../models/ride.model");
const {
  getAddressCoordinate,
  getCaptainInRadius,
} = require("../services/maps.service");
const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const { sendMessageToSocketId } = require("../socket");

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user, pickup, destination, vehicleType } = req.body;

  try {
    // create a ride store in database
    const ride = await rideService.createRide({
      user: user._id,
      pickup,
      destination,
      vehicleType,
    });

    // get the pickup coordinates
    const pickupCoordinates = await getAddressCoordinate(pickup);

    // get the nearby captains within 2 km of the pickup location
    const captainsInRadius = await getCaptainInRadius(
      pickupCoordinates.ltd,
      pickupCoordinates.lng,
      2
    );

    if (captainsInRadius.length === 0) {
      return res.status(404).json({ message: "No nearby captains found" });
    }

    // ride with user details
    ride.otp = "";
    const rideWithUser = await rideModel
      .findOne({ _id: ride._id })
      .populate("user");

    // send the ride to captains
    captainsInRadius.map((captain) => {
      console.log({ captainAvailable: [captain.socketId] });
      sendMessageToSocketId(captain.socketId, {
        event: "new-ride",
        data: rideWithUser,
      });
    });
    res.status(201).json({
      message: "Ride with user created successfully and sent to captains",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.confirmRide({
      rideId,
      captain: req.captain,
    });
    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });
    return res.status(200).json(ride);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.startRide = async (req, res) => {
  // show errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });

    // send message to socket id
    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.endRide = async (req, res) => {
  // show errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.endRide({
      rideId,
      captain: req.captain,
    });

    // send message to socket id
    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-ended",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};
