const { validationResult } = require("express-validator");
const { createUser } = require("../services/user.service.js");
const userModel = require("../models/user.model.js");
const blacklistTokenModel = require("../models/blacklistToken.model.js");

// Register a user
module.exports.registerUser = async function (req, res) {
  // Validate the user credentials
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password } = req.body;

  // if user already exists
  if (await userModel.findOne({ email })) {
    return res.status(400).json({ msg: "Email already exists" });
  }

  // Hash the password before saving to the database
  const hashPassword = await userModel.hashPassword(password);
  const user = await createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashPassword,
  });

  // Generate and send the JWT token to the client
  const token = await user.generateAuthToken();
  return res.status(201).json({ user, token });
};

// Login a user by their email and password
module.exports.loginUser = async function (req, res, next) {
  // Validate the user credentials
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select(`+password`);

  // if user not exist
  if (!user) {
    return res.status(401).json({ msg: "Invalid email or password" });
  }

  // Check if the password matches the hashed password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ msg: "Invalid email or password" });
  }

  // Generate and send the JWT token to the client
  const token = await user.generateAuthToken();

  res.cookie("token", token);
  res.json({ user, token });
};

module.exports.getUserProfile = async function (req, res, next) {
  return res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res, next) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];

  await blacklistTokenModel.create({ token });
  return res.status(200).json({ message: "Logged Out Successfully" });
};
