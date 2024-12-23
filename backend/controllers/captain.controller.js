const captainModel = require("../models/captain.model");
const { validationResult } = require("express-validator");

const bcrypt = require("bcrypt");
const blacklistTokenModel = require("../models/blacklistToken.model");
const { createCaptain } = require("../services/captain.service");

module.exports.registerCaptain = async function (req, res) {
  const errors = await validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, vehicle } = req.body;
  const { firstname, lastname } = fullname;
  const { color, plate, capacity, vehicleType } = vehicle;

  const isCaptainAlreadyExist = await captainModel.findOne({ email });

  if (isCaptainAlreadyExist) {
    return res.status(400).json({ message: "Captain already exists" });
  }

  const hashedPassword = await captainModel.hashPassword(password);

  // create a captain
  const captain = await createCaptain({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    color,
    plate,
    capacity,
    vehicleType,
  });

  const token = captain.generateAuthToken();

  return res.status(201).json({ token, captain });
};

module.exports.loginCaptain = async function (req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select("+password");

  if (!captain) {
    return res.status(404).json({ message: "invalid email or password" });
  }

  // is password matches
  const isMatch = captain.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  const token = captain.generateAuthToken();

  res.cookie("token", token);
  return res.status(200).json({ token, captain });
};

module.exports.getCaptainProfile = async function (req, res) {
  return res.status(200).json({ captain: req.captain });
};

module.exports.logoutCaptain = async function (req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  await blacklistTokenModel.create({ token });

  res.clearCookie("token");
  return res.status(200).json({ message: "Logout successfully" });
};
