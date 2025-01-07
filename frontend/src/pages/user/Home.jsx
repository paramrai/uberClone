import React, { useContext, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import LocationSearchPanel from "../../components/user/LocationSearchPanel";
import VehiclePanel from "../../components/user/VehiclePanel";
import ConfirmRide from "../../components/user/ConfirmRide";
import WaitingForDriver from "../../components/user/WaitingForDriver";
import LookingForDriver from "../../components/user/LookingForDriver";
import axios from "axios";
import { UserDataContext } from "../../context/UserContext";
import { SocketContext } from "../../context/SocketContext";
import { useNavigate } from "react-router-dom";
import LiveTracking from "../../components/LiveTracking";
import ShowAlert from "../../components/ShowAlert";

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeField, setActiveField] = useState("");
  const [vehicleType, setVehicleType] = useState(null);
  const [fare, setFare] = useState("");
  const [ride, setRide] = useState(null);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  // refs
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const liveTrackingRef = useRef(null);

  const submitHandler = (e) => {
    e.preventDefault();
  };

  const { user, updateUser } = useContext(UserDataContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      socket.emit("join", { userType: "user", userId: user._id });
    }

    socket.on("join-success", (data) => {
      data &&
        console.log(
          `user joined from front with socketId: ${data.user.socketId}`
        );
      data && updateUser(data.user);
    });
  }, [user?._id]);

  useEffect(() => {
    if (error) {
      setShowAlert(true);
    }
  }, [error]);

  const dismissAlert = () => {
    setShowAlert(false);
    setError(null);
  };

  socket.on("ride-accepted", (acceptedRide) => {
    console.log("Ride accepted: ", acceptedRide);
    setVehicleFound(false);
    setWaitingForDriver(true);
    setRide(acceptedRide);
  });

  socket.on("ride-started", (ride) => {
    setWaitingForDriver(false);
    navigate("/riding", { state: { ride } });
  });

  const handlePickupChange = async (e) => {
    setPickup(e.target.value);
    if (e.target.value.length < 3) {
      return;
    }
    const token = localStorage.getItem("token");
    // fetch suggestions
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
          params: {
            input: e.target.value,
          },
        }
      );

      response.status === 200 && setPickupSuggestions(response.data);
    } catch (error) {
      console.error(error);
      setError(
        error.response.data.message ||
          error.response.data.error ||
          error.message
      );
    }
  };

  const handleDestinationChange = async (e) => {
    setDestination(e.target.value);
    if (e.target.value.length < 3) {
      return;
    }
    const token = localStorage.getItem("token");
    // fetch suggestions
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
          params: {
            input: e.target.value,
          },
        }
      );
      response.status === 200 && setDestinationSuggestions(response.data);
    } catch (error) {
      console.error(error);
      setError(
        error.response.data.message ||
          error.response.data.error ||
          error.message
      );
    }
  };

  const findTrip = async () => {
    if (!pickup || !destination) {
      setError("Please enter pickup or destination address.");
      return;
    }

    if (pickup.length < 3 || destination.length < 3) {
      setError("Pickup or destination should be at least 3 characters");
      return;
    }

    setLoading(true);
    // fetch vehicle options
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
          params: {
            pickup,
            destination,
          },
        }
      );

      if (response.status === 200) {
        setFare(response.data);
        setVehiclePanel(true);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      if (
        error.response.data.message ===
        "Cannot read properties of undefined (reading 'value')"
      ) {
        setError("Please enter a valid pickup or destination address.");
        return;
      }

      setError(
        error.response.data.message ||
          error.response.data.error ||
          error.message
      );
    }
  };

  const createRide = async () => {
    // create ride
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/create`,
        {
          user,
          pickup,
          destination,
          vehicleType,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setConfirmRidePanel(false);
      setPanelOpen(false);
      setRide(response.data);
    } catch (error) {
      console.error(error);
      setError(
        error.response.data.message ||
          error.response.data.error ||
          error.message
      );
    }
  };

  useGSAP(
    function () {
      if (panelOpen) {
        gsap.to(panelRef.current, {
          height: "100%",
        });
        gsap.to(panelCloseRef.current, {
          opacity: 1,
        });
        gsap.to(liveTrackingRef.current, {
          opacity: 0,
          height: "0%",
        });
      } else {
        gsap.to(panelRef.current, {
          height: "0%",
        });
        gsap.to(panelCloseRef.current, {
          opacity: 0,
        });
        gsap.to(liveTrackingRef.current, {
          opacity: 1,
          height: "80%",
        });
      }
    },
    [panelOpen]
  );

  useGSAP(
    function () {
      if (vehiclePanel) {
        gsap.to(vehiclePanelRef.current, {
          display: "block",
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehiclePanelRef.current, {
          display: "none",
          transform: "translateY(100%)",
        });
      }
    },
    [vehiclePanel]
  );

  useGSAP(
    function () {
      if (confirmRidePanel) {
        gsap.to(confirmRidePanelRef.current, {
          display: "block",
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePanelRef.current, {
          display: "none",
          transform: "translateY(200%)",
        });
      }
    },
    [confirmRidePanel]
  );

  useGSAP(
    function () {
      if (vehicleFound) {
        gsap.to(vehicleFoundRef.current, {
          display: "block",
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehicleFoundRef.current, {
          display: "none",
          transform: "translateY(300%)",
        });
      }
    },
    [vehicleFound]
  );

  useGSAP(
    function () {
      if (waitingForDriver) {
        gsap.to(waitingForDriverRef.current, {
          display: "block",
          transform: "translateY(0)",
        });
      } else {
        gsap.to(waitingForDriverRef.current, {
          display: "none",
          transform: "translateY(400%)",
        });
      }
    },
    [waitingForDriver]
  );

  return (
    <div className="relative w-screen h-screen overflow-x-hidden">
      {showAlert && <ShowAlert error={error} dismissAlert={dismissAlert} />}
      <div className="flex flex-col justify-end items-center h-screen absolute top-0 w-full">
        <div className="h-[80%] w-full" ref={liveTrackingRef}>
          <LiveTracking />
        </div>
        <div className="h-[20%] w-full p-3 bg-white relative">
          <h5
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false);
            }}
            className="absolute opacity-0 right-6 top-4 text-2xl cursor-pointer"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>

          <h4 className="text-2xl font-semibold p-2">Find a trip</h4>
          <form
            className="relative px-2 bg-white w-full"
            onSubmit={(e) => {
              submitHandler(e);
            }}
          >
            <div className="line absolute h-16 w-1 top-[35%] left-10 bg-gray-700 rounded-full"></div>
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("pickup");
              }}
              value={pickup}
              onChange={handlePickupChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-5"
              type="text"
              placeholder="Add a pick-up location"
            />
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("destination");
              }}
              value={destination}
              onChange={handleDestinationChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full  mt-3"
              type="text"
              placeholder="Enter your destination"
            />
          </form>

          <div className="bg-white pt-2">
            <button
              onClick={findTrip}
              className="relative bg-black text-white px-4 py-2 rounded-sm mt-3 w-full"
            >
              {loading ? "Loading..." : "Find Trip"}
            </button>
          </div>
        </div>

        {/* LocationSearchPanel */}
        <div ref={panelRef} className="h-0 pt-20 overflow-y-auto w-full">
          <LocationSearchPanel
            suggestions={
              activeField === "pickup"
                ? pickupSuggestions
                : destinationSuggestions
            }
            setPickup={setPickup}
            setDestination={setDestination}
            activeField={activeField}
            setPanelOpen={setPanelOpen}
            setVehiclePanel={setVehiclePanel}
          />
        </div>
      </div>

      {/* Vehicle Panel */}
      <div
        ref={vehiclePanelRef}
        className="fixed w-full h-screen z-11 bottom-0 bg-white translate-y-[100%]  px-3 py-10 pt-12 overflow-y-auto"
      >
        <VehiclePanel
          time={ride?.duration?.text}
          selectVehicle={setVehicleType}
          fare={fare}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehiclePanel={setVehiclePanel}
        />
      </div>

      {/* Confirm Ride modal */}
      <div
        ref={confirmRidePanelRef}
        className="fixed w-full h-screen z-10 bottom-0 translate-y-[200%] bg-white px-3 py-6 pt-12 overflow-y-auto"
      >
        <ConfirmRide
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehicleFound={setVehicleFound}
        />
      </div>

      {/* Looking for driver modal */}
      <div
        ref={vehicleFoundRef}
        className="fixed w-full h-screen z-9 bottom-0 translate-y-[300%] bg-white px-3 py-6 pt-12 overflow-y-auto"
      >
        <LookingForDriver
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setVehicleFound={setVehicleFound}
        />
      </div>

      {/* Waiting for driver modal */}
      <div
        ref={waitingForDriverRef}
        className="fixed w-full h-screen z-8 bottom-0 translate-y-[400%] px-3 py-6 bg-white overflow-y-auto"
      >
        <WaitingForDriver
          ride={ride}
          setVehicleFound={setVehicleFound}
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}
        />
      </div>
    </div>
  );
};

export default Home;
