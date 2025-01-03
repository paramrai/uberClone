const { validationResult } = require("express-validator");
const {
  getAdrressCoordinates,
  getDistanceTime,
  getAutoCompleteSuggestions,
} = require("../services/maps.service");

module.exports.getCoordinates = async function (req, res, next) {
  // code to get coordinates from Google Maps API
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { address } = req.query;

  try {
    const coordinates = await getAdrressCoordinates(address); // returns latitude and longitude
    return res.status(200).json(coordinates);
  } catch (error) {
    return res.status(400).json({ error: "Coordinates not found" });
  }
};

module.exports.getDistanceTime = async function (req, res) {
  // if error return it
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { origin, destination } = req.query;

  try {
    const distanceTime = await getDistanceTime(origin, destination);
    return res.status(200).json(distanceTime);
  } catch (error) {
    return res.status(400).json({ error: "Distance and time not found" });
  }
};

module.exports.getAutoCompleteSuggestions = async function (req, res) {
  // if error return it
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { input } = req.query;

  try {
    const autoCompleteSuggestions = await getAutoCompleteSuggestions(input);
    return res.status(200).json(autoCompleteSuggestions);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Auto complete suggestions not found" });
  }
};
