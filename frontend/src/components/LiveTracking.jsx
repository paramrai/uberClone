import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
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
import AlertBox from "./captain/AlertBox";
import { CaptainDataContext } from "../context/CaptainContext";
import { UserDataContext } from "../context/UserContext";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const initCenter = {
  lat: 29.442321,
  lng: 74.750543,
};

const LiveTracking = ({
  pickupAddress,
  destinationAddress,
  arrivedAtPickup,
  setArrivedAtPickup,
}) => {
  const { captain } = useContext(CaptainDataContext);
  const { user } = useContext(UserDataContext);

  // map related
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(13);
  const [heading, setHeading] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [travelMode, setTravelMode] = useState("DRIVING");

  const [isDriveMode, setIsDriveMode] = useState(false);
  const isManualControl = useRef(false);

  // postion related
  const [currentPosition, setCurrentPosition] = useState(initCenter);
  const [pickupDirections, setPickupDirections] = useState(null);
  const [destinationDirections, setDestinationDirections] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [lastKnownPosition, setLastKnownPosition] = useState(null);
  const watchPositionId = useRef(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // get captain current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    setLoading(true);
    const success = (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      setCurrentPosition({ lat, lng });
      setLastKnownPosition({ lat, lng });
      setLoading(false);
    };

    const error = (error) => {
      console.error("Error getting location:", error);
      setLoading(false);
    };
    navigator.geolocation.getCurrentPosition(success, error);
  }, []);

  useEffect(() => {
    currentPosition && getCurrentLocation();
  }, []);

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

  //  Watch position for updating location
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    console.log("Watching position");

    if (isDriveMode) {
      watchPositionId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude: lat, longitude: lng, heading } = position.coords;
          const newPosition = { lat, lng };

          // Calculate heading if not provided
          if (!heading && lastKnownPosition) {
            const calculatedHeading = caclculateHeading(
              lastKnownPosition,
              newPosition
            );
            setHeading(calculatedHeading);
          } else {
            setHeading(heading || 0);
          }

          setCurrentPosition(newPosition);
          setLastKnownPosition(newPosition);
          if (map && isDriveMode && !isManualControl) {
            setZoom(17);
            map.setZoom(17);
            map.panTo(newPosition);
            map.setHeading(heading);
          }
        },
        (error) => console.error("Error watching position:", error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      if (watchPositionId.current) {
        navigator.geolocation.clearWatch(watchPositionId.current);
        watchPositionId.current = null;
      }
    }

    return () => {
      if (watchPositionId.current) {
        navigator.geolocation.clearWatch(watchPositionId.current);
        watchPositionId.current = null;
      }
    };
  }, [map, isDriveMode]);

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
              setPickupDirections(result);
            } else {
              console.error(`Directions request failed: ${status}`);
              setError(`Directions request failed: ${status}`);
              setPickupDirections(null);
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
              setDestinationDirections(result);
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
      setPickupDirections(null);
      setDestinationDirections(null);
    } finally {
      setLoading(false);
    }
  }, [currentPosition, pickupCoords, destinationCoords, travelMode]);

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
  }, [currentPosition, pickupCoords, destinationCoords]);

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

  // Add debounce utility
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // drive mode effect
  useEffect(() => {
    console.log("Drive mode effect running", { isDriveMode, map });

    if (isDriveMode && !map && !isManualControl.current) return;

    let isMounted = true;

    const debouncedUpdateMap = debounce(() => {
      if (!isMounted) return;
      map && map.setZoom(17);
      map && map.panTo(currentPosition);
      map && map.setHeading(heading);
    }, 100);

    // Initial update
    debouncedUpdateMap();

    if (map && window.google && window.google.maps) {
      const zoomListener = map.addListener("zoom_changed", () => {
        if (isDriveMode && !isManualControl.current) {
          debouncedUpdateMap();
        }
      });

      const centerListener = map.addListener("center_changed", () => {
        if (isDriveMode && !isManualControl.current) {
          debouncedUpdateMap();
        }
      });

      return () => {
        if (map && window.google && google.maps && google.maps.event) {
          isMounted = false;
          google.maps.event.removeListener(zoomListener);
          google.maps.event.removeListener(centerListener);
        }
      };
    }
  }, [isDriveMode, map, currentPosition, heading, isManualControl]);

  const handleDriveMode = useCallback(() => {
    setIsDriveMode(true);
    isManualControl.current = false;

    if (!watchPositionId.current) {
      watchPosition();
    }
  }, [watchPosition]);

  // add map event listeners
  const handleMapDrag = useCallback(() => {
    setIsDriveMode(false);
    isManualControl.current = true;
    console.log(
      "map is dragged",
      "isDriveMode",
      isDriveMode,
      "isManualControl",
      isManualControl
    );
  }, [watchPosition]);

  const handleTravelModeChange = useCallback(
    (mode) => {
      setTravelMode(mode);
      if (currentPosition && pickupCoords && destinationCoords) {
        fetchDirections();
      }
    },
    [currentPosition, pickupCoords, destinationCoords]
  );

  if (loading) return <div>loading...</div>;

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      className="relative"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        libraries={["geometry", "places", "visualization", "drawing"]}
        center={currentPosition}
        zoom={zoom}
        onLoad={handleLoad}
        onDragStart={handleMapDrag}
        onZoomChanged={handleMapDrag}
        options={{
          gestureHandling: "greedy",
          zoomControl: !isDriveMode,
          streetViewControl: false,
        }}
      >
        {captain &&
          currentPosition &&
          map &&
          window.google &&
          window.google.maps && (
            <Marker
              position={currentPosition}
              icon={{
                url: current,
                scaledSize: new window.google.maps.Size(70, 70),
                anchor: new window.google.maps.Point(50, 75),
              }}
            />
          )}

        {user.email &&
          currentPosition &&
          map &&
          window.google &&
          window.google.maps && (
            <Marker
              position={currentPosition}
              icon={{
                url: pickup,
                scaledSize: new window.google.maps.Size(50, 50),
                anchor: new window.google.maps.Point(25, 50),
              }}
            />
          )}

        {pickupCoords && map && window.google && window.google.maps && (
          <Marker
            position={pickupCoords}
            icon={{
              url: pickup,
              scaledSize: new window.google.maps.Size(50, 50),
              anchor: new window.google.maps.Point(25, 50),
            }}
          />
        )}

        {destinationCoords && map && window.google && window.google.maps && (
          <Marker
            position={destinationCoords}
            icon={{
              url: destination,
              scaledSize: new window.google.maps.Size(50, 50),
              anchor: new window.google.maps.Point(25, 50),
            }}
          />
        )}
        {!arrivedAtPickup && pickupDirections && (
          <DirectionsRenderer
            options={{
              suppressMarkers: true,
            }}
            directions={pickupDirections}
          />
        )}
        {arrivedAtPickup && destinationDirections && (
          <DirectionsRenderer
            options={{
              polylineOptions: {
                strokeColor: "rgb(29 99 161)",
                strokeWeight: 5,
                strokeOpacity: 0.7,
              },
              suppressMarkers: true,
            }}
            directions={destinationDirections}
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

        {location === "/captain-home" ||
          (location === "/captain-riding" && (
            <ButtonToolbar
              className="absolute bottom-[30%] right-[10px] bg-white rounded-sm shadow-sm z-50 "
              aria-label="Toolbar with button groups"
            >
              <ButtonGroup
                className="flex flex-col"
                aria-label="Travel mode group"
              >
                <Button
                  onClick={() => handleTravelModeChange("DRIVING")}
                  className={`${
                    travelMode === "DRIVING"
                      ? "border bottom-1 border-gray-500 border-collapse"
                      : ""
                  } px-3 py-2 text-sm font-medium h-10 w-10 transition-all ease-in-out`}
                >
                  🚗
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
                  🚲
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          ))}

        {arrivedAtPickup && location === "/captain-riding" && (
          <button
            onClick={handleDriveMode}
            className="bg-white font-semibold no-b rounded-sm shadow-2xl py-2 px-4 w-[35%] absolute left-[50%] translate-x-[-50%]  bottom-4 mx-auto inline-block"
          >
            Drive
          </button>
        )}

        {!arrivedAtPickup && location === "/captain-riding" && (
          <button
            onClick={handleDriveMode}
            className="bg-white font-semibold no-b rounded-sm shadow-2xl py-2 px-4 w-[35%] absolute left-[50%] translate-x-[-50%]  bottom-4 mx-auto inline-block"
          >
            Navigate
          </button>
        )}

        {(location === "/home" || location === "/captain-home") && (
          <button
            onClick={handleDriveMode}
            className="bg-white font-semibold rounded-sm shadow-2xl py-2 px-4 w-[35%] absolute left-[50%] translate-x-[-50%]  bottom-4 mx-auto inline-block"
          >
            Recenter
          </button>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default LiveTracking;
