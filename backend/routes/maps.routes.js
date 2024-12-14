const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const { getCoordinates } = require("../controllers/maps.controller");
const { query } = require("express-validator");
const router = express.Router();

router.get(
  "/get-coordinates",
  query("address").isString().isLength({ min: 3 }),
  authUser,
  getCoordinates
);

module.exports = router;
