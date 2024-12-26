import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LoadScript,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useLocation } from "react-router-dom";
import current from "../assets/pin.png";
import pickup from "../assets/location.png";
import destination from "../assets/locationPin.png";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const initCenter = {
  lat: 29.442321,
  lng: 74.750543,
};

const LiveTracking = ({ pickupAddress, destinationAddress }) => {
  const [currentPosition, setCurrentPosition] = useState(initCenter);
  const [directions, setDirections] = useState(null);
  const [heading, setHeading] = useState(null);
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(14);
  const [center, setCenter] = useState(initCenter);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  const [lastKnownPosition, setLastKnownPosition] = useState(null);
  const watchPositionId = useRef(null);

  // refs
  const geometryLoaded = useRef(false);
  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const location = useLocation().pathname;

  // convert to jeocode
  useEffect(() => {
    const geocodeAddress = async () => {
      if (!pickupAddress || !destinationAddress) {
        console.log("Addresses not provided");
        return;
      }

      const geocoder = new window.google.maps.Geocoder();

      // Geocode pickup address
      const pickupResult = await new Promise((resolve, reject) => {
        geocoder.geocode(
          {
            address: pickupAddress,
            region: "IN", // Add region for better results
          },
          (results, status) => {
            if (status === "OK" && results[0]) {
              resolve(results[0].geometry.location);
            } else {
              reject(status);
            }
          }
        );
      });

      setPickupCoords({
        lat: pickupResult.lat(),
        lng: pickupResult.lng(),
      });

      // Geocode destination address
      const destResult = await new Promise((resolve, reject) => {
        geocoder.geocode(
          {
            address: destinationAddress,
            region: "IN",
          },
          (results, status) => {
            if (status === "OK" && results[0]) {
              resolve(results[0].geometry.location);
            } else {
              reject(status);
            }
          }
        );
      });

      setDestinationCoords({
        lat: destResult.lat(),
        lng: destResult.lng(),
      });
    };

    if (
      map &&
      window.google &&
      window.google.maps &&
      pickupAddress &&
      destinationAddress
    ) {
      geocodeAddress();
    }
  }, [map, pickupAddress, destinationAddress]);

  useEffect(() => {
    if (pickupCoords !== null) {
      console.log("Pickup", pickupCoords);
      console.log("destination", destinationCoords);
    }
  }, []);

  // fetching direction
  const fetchDirections = useCallback(async () => {
    if (
      !directionsServiceRef.current ||
      !pickupAddress ||
      !destinationAddress
    ) {
      console.log("Direction service or positions not ready");
      return;
    }

    try {
      directionsServiceRef.current.route(
        {
          origin: currentPosition,
          destination: pickupAddress,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`Directions request failed: ${status}`);
            setDirections(null);
          }
        }
      );
    } catch (error) {
      console.error("Error fetching directions:", error);
      setDirections(null);
    }
  }, [currentPosition]);

  const caclculateHeading = useCallback(
    (startPos, endPos) => {
      if (
        !isLoaded ||
        !window.google ||
        !window.google.maps ||
        !window.google.maps.geometry
      ) {
        console.log("Google Maps Geometry library not loaded");
        return 0;
      }

      // Log only once when geometry is first loaded
      if (!geometryLoaded.current) {
        console.log("Google Maps Geometry library is loaded");
        geometryLoaded.current = true;
      }

      return google.maps.geometry.spherical.computeHeading(
        new google.maps.LatLng(startPos.lat, startPos.lng),
        new google.maps.LatLng(endPos.lat, endPos.lng)
      );
    },
    [isLoaded]
  );

  // todo getCurrentLocation
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    const success = (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      setCurrentPosition({ lat, lng });
      setCenter({ lat, lng });
      // setLastKnownPosition({ lat, lng });
    };

    const error = (error) => console.error("Error getting location:", error);

    // Get initial position
    navigator.geolocation.getCurrentPosition(success, error);

    // Watch position for updates
    // watchPositionId.current = navigator.geolocation.watchPosition(
    //   (position) => {
    //     const { latitude: lat, longitude: lng, heading } = position.coords;
    //     const newPosition = { lat, lng };

    //     // Calculate heading if not provided
    //     if (!heading && lastKnownPosition) {
    //       const calculatedHeading = caclculateHeading(
    //         lastKnownPosition,
    //         newPosition
    //       );
    //       setHeading(calculatedHeading);
    //     } else {
    //       setHeading(heading || 0);
    //     }

    //     setCurrentPosition(newPosition);
    //     setLastKnownPosition(newPosition);
    //     if (map) map.panTo(newPosition);
    //   },
    //   (error) => console.error("Error watching position:", error),
    //   {
    //     enableHighAccuracy: true,
    //     timeout: 5000,
    //     maximumAge: 0,
    //   }
    // );
  }, [
    map,
    //  lastKnownPosition
  ]);

  // Add useEffect for cleanup
  useEffect(() => {
    getCurrentLocation();
    return () => {
      if (watchPositionId.current) {
        navigator.geolocation.clearWatch(watchPositionId.current);
      }
    };
  }, [getCurrentLocation]);

  // handle on loaded map
  const handleLoad = useCallback(
    (map) => {
      map.setMapTypeId("satellite");
      setMap(map);
      mapRef.current = map;
      setIsLoaded(true);

      // on map load init directionService
      directionsServiceRef.current = new google.maps.DirectionsService();

      // Fetch directions once everything is loaded
      if (currentPosition && pickupAddress && destinationAddress) {
        fetchDirections();
      }
    },
    [currentPosition, fetchDirections]
  );

  // handle drive Mode
  const handleDriveMode = () => {
    if (map) {
      map.setZoom(18);
      map.setHeading(heading);
      map.panTo(currentPosition);
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      className="relative"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        library={["geometry"]}
        center={center}
        zoom={zoom}
        onLoad={handleLoad}
      >
        {currentPosition && (
          <Marker
            position={currentPosition}
            icon={{
              url: current,
              scaledSize: map && new window.google.maps.Size(50, 50),
              anchor: map && new window.google.maps.Point(25, 50),
            }}
          />
        )}

        {pickupCoords && (
          <Marker
            position={pickupCoords}
            icon={{
              url: pickup,
              scaledSize: map && new window.google.maps.Size(50, 50),
              anchor: map && new window.google.maps.Point(25, 50),
            }}
          />
        )}

        {destinationCoords && (
          <Marker
            position={destinationCoords}
            icon={{
              url: destination,
              scaledSize: map && new window.google.maps.Size(50, 50),
              anchor: map && new window.google.maps.Point(25, 50),
            }}
          />
        )}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{ suppressMarkers: true }}
          />
        )}

        {location === "/captain-riding" && (
          <button
            onClick={handleDriveMode}
            className="bg-white font-semibold no-b rounded-sm shadow-2xl py-2 px-4 w-[35%] absolute left-[50%] translate-x-[-50%]  bottom-4 mx-auto inline-block"
          >
            Drive
          </button>
        )}

        {location === "/home" ||
          (location === "/captain-home" && (
            <button
              onClick={handleDriveMode}
              className="bg-white font-semibold rounded-sm shadow-2xl py-2 px-4 w-[35%] absolute left-[50%] translate-x-[-50%]  bottom-4 mx-auto inline-block"
            >
              Recenter
            </button>
          ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default LiveTracking;
