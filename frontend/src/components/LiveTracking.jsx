import React, { useState, useEffect, useCallback } from "react";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 29.442321,
  lng: 74.750543,
};

const LiveTracking = () => {
  const [currentPosition, setCurrentPosition] = useState(center);

  // Fetch user's current position
  useEffect(() => {
    const handleSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({
        lat: latitude,
        lng: longitude,
      });
    };

    const handleError = (error) => {
      console.error(error);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!currentPosition) {
    return <div>Loading map...</div>;
  }

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={14}
      >
        {currentPosition && <Marker position={currentPosition} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default LiveTracking;
