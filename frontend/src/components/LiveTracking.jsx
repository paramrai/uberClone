import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LoadScript,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useLocation } from "react-router-dom";
import icon from "../assets/location.png";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const initCenter = {
  lat: 29.442321,
  lng: 74.750543,
};

const destination = { lat: 28.7041, lng: 77.1025 };

const LiveTracking = () => {
  const [currentPosition, setCurrentPosition] = useState(initCenter);
  const [directions, setDirections] = useState(null);
  const [heading, setHeading] = useState(null);
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(14);
  const [center, setCenter] = useState(initCenter);
  const [isLoaded, setIsLoaded] = useState(false);

  const [lastKnownPosition, setLastKnownPosition] = useState(null);
  const watchPositionId = useRef(null);

  // refs
  const geometryLoaded = useRef(false);
  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const location = useLocation().pathname;

  // fetching direction
  const fetchDirections = useCallback(async () => {
    if (!directionsServiceRef.current || !currentPosition || !destination) {
      console.log("Direction service or positions not ready");
      return;
    }

    try {
      directionsServiceRef.current.route(
        {
          origin: currentPosition,
          destination: destination,
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

  // todo setCurrentPosition
  // todo setHeading use

  // todo onload directionServiceRef
  const handleLoad = useCallback(
    (map) => {
      map.setMapTypeId("satellite");
      setMap(map);
      mapRef.current = map;
      setIsLoaded(true);

      // on map load init directionService
      directionsServiceRef.current = new google.maps.DirectionsService();

      // Fetch directions once everything is loaded
      if (currentPosition && destination) {
        fetchDirections();
      }
    },
    [currentPosition, fetchDirections]
  );

  // todo handle drive mode
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
              url: icon,
              scaledSize: new window.google.maps.Size(50, 50),
              anchor: new window.google.maps.Point(25, 50),
            }}
          />
        )}
        {directions && <DirectionsRenderer directions={directions} />}

        <button
          onClick={handleDriveMode}
          className="bg-white font-semibold rounded-sm shadow-2xl py-2 px-4 w-[35%] absolute left-[50%] translate-x-[-50%]  bottom-4 mx-auto inline-block"
        >
          {location === "/captain-home" ? "Navigate" : "Drive"}
        </button>
      </GoogleMap>
    </LoadScript>
  );
};

export default LiveTracking;
