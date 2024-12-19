import React, { useContext, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import WaitingForDriver from "../components/WaitingForDriver";
import LookingForDriver from "../components/LookingForDriver";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import { SocketContext } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

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

  // refs
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const vehicleFoundRef = useRef(null);

  const submitHandler = (e) => {
    e.preventDefault();
  };

  const { user } = useContext(UserDataContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      socket.emit("join", { userType: "user", userId: user._id });
      console.log({ user });
    }
  }, [user]);

  socket.emit("ride-confirmed", (ride) => {
    setVehicleFound(false);
    setWaitingForDriver(true);
    setRide(ride);
  });

  socket.emit("ride-started", (ride) => {
    setWaitingForDriver(false);
    navigate("/riding");
  });

  useGSAP(
    function () {
      if (panelOpen) {
        gsap.to(panelRef.current, {
          height: "70%",
          padding: "24px",
          overflow: "scroll",
          scrollbarWidth: "0",
          scrollbarColor: "transparent transparent",
        });

        gsap.to(panelCloseRef.current, {
          opacity: 1,
        });
      } else {
        gsap.to(panelRef.current, {
          height: 0,
          padding: 0,
        });
        gsap.to(panelCloseRef.current, {
          opacity: 0,
        });
      }
    },
    [panelOpen]
  );

  useGSAP(
    function () {
      if (vehiclePanel) {
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehiclePanelRef.current, {
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
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmRidePanel]
  );

  useGSAP(
    function () {
      if (vehicleFound) {
        gsap.to(vehicleFoundRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehicleFoundRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [vehicleFound]
  );

  useGSAP(
    function () {
      if (waitingForDriver) {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(0%)",
        });
      } else {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [waitingForDriver]
  );

  const handlePickupChange = async (e) => {
    setPickup(e.target.value);
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
    }
  };

  const handleDestinationChange = async (e) => {
    setDestination(e.target.value);
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
    } catch (e) {
      console.log(e);
    }
  };

  const findTrip = async () => {
    setVehiclePanel(true);
    setPanelOpen(false);

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
      response.status === 200 && setFare(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createRide = async () => {
    // create ride
    try {
      const token = localStorage.getItem("token");
      await axios.post(
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
      setConfirmRidePanel(true);
      setPanelOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden max-w-96 mx-auto">
      <img
        className="w-16 absolute left-5 top-5"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt=""
      />

      {/* image for temporary use  */}
      <div className="h-screen w-screen">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt=""
        />
      </div>

      {/* find a trip from input  */}
      <div className=" flex flex-col justify-end h-screen absolute top-0 w-full">
        <div className="h-[30%] p-3 bg-white relative">
          <h5
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false);
            }}
            className="absolute opacity-0 right-6 top-4 text-2xl cursor-pointer"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>

          <h4 className="text-2xl font-semibold">Find a trip</h4>
          <form
            className="relative py-2"
            onSubmit={(e) => {
              submitHandler(e);
            }}
          >
            <div className="line absolute h-16 w-1 top-[35%] left-5 bg-gray-700 rounded-full"></div>
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
          <button
            onClick={findTrip}
            className="bg-black text-white px-4 py-2 rounded-lg mt-3 w-full"
          >
            Find Trip
          </button>
        </div>

        {/* LocationSearchPanel */}
        <div ref={panelRef} className="bg-white h-0 pt-20">
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
        className="fixed w-96 mx-auto z-10 bottom-0 bg-white translate-y-full  px-3 py-10 pt-12"
      >
        <VehiclePanel
          selectVehicle={setVehicleType}
          fare={fare}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehiclePanel={setVehiclePanel}
        />
      </div>

      {/* Confirm Ride modal */}
      <div
        ref={confirmRidePanelRef}
        className="fixed w-96 mx-auto z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12"
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
        className="fixed w-96 mx-auto z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12"
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
        className="fixed w-96 mx-auto z-10 bottom-0 px-3 py-6 bg-white"
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
