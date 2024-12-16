const { validationResult } = require("express-validator");
const createRide = require("../services/ride.service");
const getFare = require("../services/ride.service");

module.exports.createRide = async (req, res) => {
  // validate the ride request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // code to create a ride with the provided data
  const { userId, pickup, destination, vehicleType } = req.body;

  // code to store the ride in the database
  try {
    const ride = await createRide(userId, pickup, destination, vehicleType);
    res.status(201).json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.getFare = async (req, res) => {
  // validate the fare request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // code to calculate the fare for the given ride
  const { pickup, destination } = req.query;

  try {
    const fare = await getFare(pickup, destination);
    res.status(200).json(fare);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
