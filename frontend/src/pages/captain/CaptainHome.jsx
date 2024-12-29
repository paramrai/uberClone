import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AcceptRidePopup from "../../components/captain/AcceptRidePopup";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SocketContext } from "../../context/SocketContext";
import axios from "axios";
import { CaptainDataContext } from "../../context/CaptainContext";
import LiveTracking from "../../components/LiveTracking";
import CaptainDetails from "../../components/captain/CaptainDetails";

const CaptainHome = () => {
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);

  const ridePopupPanelRef = useRef(null);
  const confirmRidePopupPanelRef = useRef(null);
  const [ride, setRide] = useState(null);
  const navigate = useNavigate();
  const screenRef = useRef(null);

  useGSAP(
    function () {
      if (ridePopupPanel) {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(0)",
          display: "block",
        });
      } else {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(100%)",
          display: "none",
        });
      }
    },
    [ridePopupPanel]
  );

  useGSAP(
    function () {
      if (confirmRidePopupPanel) {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmRidePopupPanel]
  );

  const { socket } = useContext(SocketContext);
  const { captain, updateCaptain } = useContext(CaptainDataContext);

  // Wait for successful connection
  useEffect(() => {
    captain &&
      socket.emit("join", { userType: "captain", userId: captain._id });

    socket.on("join-success", (data) => {
      data &&
        console.log(
          `Captain joined from front with socketId: ${data.captain.socketId}`
        );
      data && updateCaptain(data.captain);
    });

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          socket.emit("update-captain-location", {
            userId: captain._id,
            location: {
              ltd: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        });
      }
    };

    const locationInterval = setInterval(updateLocation, 10000);
    captain && updateLocation();

    // Cleanup function
    return () => {
      clearInterval(locationInterval);
      socket.off("join-success");
    };
  }, [captain?.id, socket]);

  useEffect(() => {
    if (!socket) return;

    // Handler function for new ride events
    const handleNewRide = (data) => {
      // Validate ride data
      if (!data) {
        console.error("Invalid ride data received");
        return;
      }

      // Update ride state first
      setRide(data);

      // Small delay to ensure state is updated before animation
      setTimeout(() => {
        setRidePopupPanel(true);
      }, 100);
    };

    // Set up event listener
    socket.on("new-ride", handleNewRide);

    // Cleanup function
    return () => {
      socket.off("new-ride", handleNewRide);
    };
  }, [socket]);

  async function acceptRide() {
    try {
      captain && console.log(captain);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/acceptRideRequest`,
        {
          rideId: ride._id,
          captain: captain && captain,
        },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("captain-token")}`,
          },
        }
      );

      if (response.status === 200) {
        setRidePopupPanel(false);
        console.log(response.data);
        navigate("/captain-riding", { state: { ride: response.data } });
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <div className="fixed p-6 top-0 flex items-center justify-between w-screen">
        <img
          className="w-16"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt=""
        />
        <Link
          to="/captain-home"
          className="h-10 w-10 bg-white flex items-center justify-center rounded-full"
        >
          <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>
      <div className="h-3/5">
        <LiveTracking />
      </div>

      {/* ========= captain details ======== */}
      <div className="h-2/5 p-6 z-[11]">
        <CaptainDetails />
      </div>

      {/* ========= ride pop up ======== */}
      <div
        style={{
          overflowY: "scroll",
          overflowX: "hidden",
          scrollbarWidth: "none",
        }}
        ref={ridePopupPanelRef}
        className="absolute w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12 "
      >
        <AcceptRidePopup
          ride={ride}
          acceptRide={acceptRide}
          setRidePopupPanel={setRidePopupPanel}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
        />
      </div>
    </div>
  );
};

export default CaptainHome;
