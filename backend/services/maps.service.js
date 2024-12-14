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
