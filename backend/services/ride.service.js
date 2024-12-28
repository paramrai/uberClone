const rideModel = require("../models/ride.model");
const mapService = require("./maps.service");
const crypto = require("crypto");

async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  const baseFare = {
    auto: 30,
    car: 50,
    moto: 20,
  };

  const perKmRate = {
    auto: 10,
    car: 15,
    moto: 8,
  };

  const perMinuteRate = {
    auto: 2,
    car: 3,
    moto: 1.5,
  };

  const fare = {
    auto: Math.round(
      baseFare.auto +
        (distanceTime.distance.value / 1000) * perKmRate.auto +
        (distanceTime.duration.value / 60) * perMinuteRate.auto
    ),
    car: Math.round(
      baseFare.car +
        (distanceTime.distance.value / 1000) * perKmRate.car +
        (distanceTime.duration.value / 60) * perMinuteRate.car
    ),
    moto: Math.round(
      baseFare.moto +
        (distanceTime.distance.value / 1000) * perKmRate.moto +
        (distanceTime.duration.value / 60) * perMinuteRate.moto
    ),
  };

  return fare;
}

module.exports.getFare = getFare;

function getOtp(num) {
  function generateOtp(num) {
    const otp = crypto
      .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
      .toString();
    return otp;
  }
  return generateOtp(num);
}

module.exports.createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
  time,
  distance,
}) => {
  if (!user || !pickup || !destination || !vehicleType || !time || !distance) {
    throw new Error("All fields are required");
  }

  const fare = await getFare(pickup, destination);

  const ride = await rideModel.create({
    user,
    pickup,
    destination,
    otp: getOtp(6),
    fare: fare[vehicleType],
    time,
    distance,
  });

  return ride;
};

module.exports.acceptRideRequest = async ({ rideId, captain }) => {
  if (!rideId) throw new Error("rideId is required");
  const acceptedRide = await rideModel
    .findByIdAndUpdate(
      {
        _id: rideId,
      },
      {
        status: "accepted",
        captain: captain._id,
      },
      {
        new: true,
      }
    )
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!acceptedRide) throw new Error("No such ride");
  return acceptedRide;
};

module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) throw new Error("Ride Id and otp is required");

  const ride = await rideModel.findOne({
    _id: rideId,
    otp,
  });

  if (!ride) throw new Error("No such ride found check the otp");

  // if (ride.status !== "accepted") throw new Error("Ride is not accepted");

  const onGoingRide = await rideModel
    .findByIdAndUpdate(
      {
        _id: rideId,
      },
      {
        status: "ongoing",
        captain: captain._id,
      },
      { new: true }
    )
    .populate("user")
    .populate("captain");

  onGoingRide && console.log("Ride is started by captain");

  return onGoingRide;
};

module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) throw new Error("Ride id is required");
  const ride = await rideModel
    .findOne({
      _id: rideId,
      captain: captain._id,
    })
    .populate("user")
    .populate("captain");

  if (!ride) throw new Error("No such ride found");

  if (ride.status !== "ongoing") {
    throw new Error("Ride is not ongoing");
  }

  const completedRide = await rideModel.findByIdAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "completed",
    }
  );

  console.log("Ride is completed", { completedRide });

  return ride;
};
