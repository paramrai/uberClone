const { validationResult } = require("express-validator");
const { createUser } = require("../services/user.service.js");
const userModel = require("../models/user.model.js");

module.exports.registerUser = async function (req, res) {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password } = req.body;

  const hashPassword = await userModel.hashPassword(password);
  const user = await createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashPassword,
  });

  const token = await user.generateAuthToken();
  res.status(201).json({ user, token });
};
