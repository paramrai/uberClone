const { default: axios } = require("axios");

module.exports.getAdrressCoordinates = async (address) => {
  // call google map api to get coordinates
  // return coordinates

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return location;
    } else {
      console.error("Google Maps API returned status:", response.data.status);
      throw new Error("Failed to fetch address coordinates.");
    }
  } catch (error) {
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  // call google map api to get distance and time
  // return distance and time
  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") {
        throw new Error("No route found between the given addresses.");
      }

      return response.data.rows[0].elements[0];
    } else {
      throw new Error("Failed to fetch distance and time.");
    }
  } catch (error) {
    throw error;
  }
};
