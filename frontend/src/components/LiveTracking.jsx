import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LoadScript,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useLocation } from "react-router-dom";
import current from "../assets/car.png";
import pickup from "../assets/location.png";
import destination from "../assets/locationPin.png";
import { Button, ButtonGroup, ButtonToolbar, Spinner } from "react-bootstrap";
import AlertBox from "./AlertBox";

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
  const [walkingDirections, setWalkingDirections] = useState(null);
  const [heading, setHeading] = useState(null);
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState(initCenter);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (!directionsServiceRef.current || !pickupCoords || !currentPosition) {
      console.log("Direction service or positions not ready");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mode = google.maps.TravelMode[travelMode];

      // fetch direction current position to pickup position
      if (pickupCoords && currentPosition) {
        directionsServiceRef.current.route(
          {
            origin: currentPosition,
            destination: pickupCoords,
            travelMode: mode,
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              setDirections(result);
            } else {
              console.error(`Directions request failed: ${status}`);
              setError(`Directions request failed: ${status}`);
              setDirections(null);
            }
          }
        );
      }

      // fetch directions through pickup to destination
      if (pickupCoords && destinationCoords) {
        directionsServiceRef.current.route(
          {
            origin: pickupCoords,
            destination: destinationCoords,
            travelMode: mode,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setWalkingDirections(result);
            } else {
              console.error(`Error fetching directions: ${status}`);
              setError(`Error fetching directions: ${status}`);
            }
          }
        );
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      setError("Error fetching directions");
      setDirections(null);
      setWalkingDirections(null);
    } finally {
      setLoading(false);
    }
  }, [currentPosition, pickupCoords, destinationCoords, travelMode]);

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

  // get user current location
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
    if (
      currentPosition &&
      pickupCoords &&
      directionsServiceRef.current &&
      destinationCoords
    ) {
      fetchDirections();
    }
    return () => {
      if (watchPositionId.current) {
        navigator.geolocation.clearWatch(watchPositionId.current);
      }
    };
  }, [getCurrentLocation, currentPosition, pickupCoords, destinationCoords]);

  // handle on loaded map
  const handleLoad = useCallback(
    (map) => {
      map.setMapTypeId("terrain");
      setMap(map);
      mapRef.current = map;
      setIsLoaded(true);

      // on map load init directionService
      directionsServiceRef.current = new google.maps.DirectionsService();

      // Fetch directions once everything is loaded
      if (currentPosition && pickupCoords && destinationCoords) {
        fetchDirections();
      }
    },
    [currentPosition, fetchDirections, pickupCoords, destinationCoords]
  );

  // handle drive Mode
  // todo watch position
  // todo on drive mode on watch position
  // todo on map changes stop watch position
  // todo then add a recenter butn to go into driving mode again
  const handleDriveMode = () => {
    if (map) {
      map.setZoom(17);
      map.setHeading(heading);
      map.panTo(currentPosition);
    }
  };

  const handleTravelModeChange = useCallback(
    (mode) => {
      setTravelMode(mode);
      if (currentPosition && pickupCoords && destinationCoords) {
        fetchDirections();
      }
    },
    [currentPosition, pickupCoords, destinationCoords]
  );

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      className="relative"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        libraries={["geometry", "places", "visualization", "drawing"]}
        center={center}
        zoom={zoom}
        onLoad={handleLoad}
        options={{ streetViewControl: false }}
      >
        {currentPosition && (
          <Marker
            position={currentPosition}
            icon={{
              url: current,
              scaledSize: map && new window.google.maps.Size(70, 70),
              anchor: map && new window.google.maps.Point(50, 75),
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
            options={{
              suppressMarkers: true,
              preserveViewport: true,
              polylineOptions: {
                strokeColor: "#2666CF",
                strokeOpacity: 0.8,
                strokeWeight: 4,
              },
            }}
          />
        )}

        {walkingDirections && (
          <DirectionsRenderer
            directions={walkingDirections}
            options={{
              suppressMarkers: true,
              preserveViewport: true,
              polylineOptions: {
                strokeColor: "#000000",
                strokeOpacity: 1.0,
                strokeWeight: 4,
                icons: [
                  {
                    icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 4 },
                    offset: "0",
                    repeat: "20px",
                  },
                ],
              },
            }}
          />
        )}

        {error && (
          <div className="max-w-96 mx-auto">
            <AlertBox
              error={error}
              travelMode={travelMode}
              handleTravelModeChange={handleTravelModeChange}
              map={map}
            ></AlertBox>
          </div>
        )}

        <ButtonToolbar
          className="absolute bottom-[30%] right-[10px] bg-white rounded-sm shadow-sm z-50 "
          aria-label="Toolbar with button groups"
        >
          <ButtonGroup className="flex flex-col" aria-label="Travel mode group">
            <Button
              onClick={() => handleTravelModeChange("DRIVING")}
              className={`${
                travelMode === "DRIVING"
                  ? "border bottom-1 border-gray-500 border-collapse"
                  : ""
              } px-3 py-2 text-sm font-medium h-10 w-10 transition-all ease-in-out`}
            >
              {loading && travelMode === "DRIVING" ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "🚗"
              )}
            </Button>
            <Button
              variant={travelMode === "BICYCLING" ? "primary" : "light"}
              onClick={() => handleTravelModeChange("BICYCLING")}
              className={`${
                travelMode === "BICYCLING"
                  ? "border bottom-1 border-gray-500 border-collapse"
                  : ""
              } px-3 py-2 text-sm font-medium h-10 w-10 transition-all ease-in-out`}
            >
              {loading && travelMode === "BICYCLING" ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "🚲"
              )}
            </Button>
          </ButtonGroup>
        </ButtonToolbar>

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
