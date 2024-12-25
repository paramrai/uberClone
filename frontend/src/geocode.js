import axios from "axios";

export const getCoordinates = async (address) => {
  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/geocode/json",
    {
      params: {
        address,
        key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      },
    }
  );

  if (response.data.status === "OK") {
    const { lat, lng } = response.data.results[0].geometry.location;
    return { lat, lng };
  } else {
    throw new Error("Error fetching coordinates");
  }
};
