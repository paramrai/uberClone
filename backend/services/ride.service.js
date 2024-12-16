const rideModel = require("../models/ride.model");
const { getDistanceTime } = require("./maps.service");
const crypto = require("crypto");

async function createRide(user, pickup, destination, vehicleType) {
  // throw error if something missing
  console.log(user, pickup, destination, vehicleType);
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("All fields are required");
  }

  const fare = await getFare(pickup, destination);
  const ride = await rideModel.create({
    user: user,
    pickup: pickup,
    destination: destination,
    otp: getOtp(6),
    fare: fare[vehicleType],
  });

  return ride;
}

const getFare = async (pickup, destination) => {
  if (!pickup || !destination) {
    throw new Error("All fields are required");
  }

  // calculate the fare
  const distanceTime = await getDistanceTime(pickup, destination);

  const baseFare = {
    moto: 20,
    auto: 30,
    car: 50,
  };

  const ratePerKm = {
    moto: 8,
    auto: 10,
    car: 15,
  };

  const ratePerMinutes = {
    moto: 1.5,
    auto: 2,
    car: 3,
  };

  const fare = {
    auto:
      baseFare.auto +
      (distanceTime.distance.value / 1000) * ratePerKm.auto +
      (distanceTime.duration.value / 60) * ratePerMinutes.auto,
    car:
      baseFare.car +
      (distanceTime.distance.value / 1000) * ratePerKm.car +
      (distanceTime.duration.value / 60) * ratePerMinutes.car,
    moto:
      baseFare.moto +
      (distanceTime.distance.value / 1000) * ratePerKm.moto +
      (distanceTime.duration.value / 60) * ratePerMinutes.moto,
  };

  return fare;
};

const getOtp = (num) => {
  const otp = crypto
    .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
    .toString();
  return otp;
};

module.exports = createRide;
module.exports = getFare;
