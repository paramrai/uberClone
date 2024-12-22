import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CaptainDetails from "../components/CaptainDetails";
import RidePopup from "../components/RidePopup";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SocketContext } from "../context/SocketContext";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext";
import LiveTracking from "../components/LiveTracking";

const CaptainHome = () => {
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);

  const ridePopupPanelRef = useRef(null);
  const confirmRidePopupPanelRef = useRef(null);
  const [ride, setRide] = useState(null);

  useGSAP(
    function () {
      if (ridePopupPanel) {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(100%)",
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

  useEffect(() => {
    if (!captain?._id) return;

    socket.emit("join", {
      userId: captain._id,
      userType: "captain",
    });

    // Wait for successful connection
    socket.on("join-success", async (data) => {
      updateCaptain(data.captain);
    });

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          socket.emit("update-location-captain", {
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
    updateLocation();

    // Cleanup function
    return () => {
      clearInterval(locationInterval);
      socket.off("new-ride");
      socket.off("join-success");
    };
  }, [captain?.id, socket]);

  useEffect(() => {
    if (!socket) return;

    // Handler function for new ride events
    const handleNewRide = (data) => {
      console.log("New ride received:", data);

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

  async function confirmRide() {
    await axios.post(
      `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
      {
        rideId: ride._id,
        captainId: captain._id,
      },
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem("captain-token")}`,
        },
      }
    );

    setRidePopupPanel(false);
    setConfirmRidePopupPanel(true);
  }

  return (
    <div className="max-w-96 mx-auto">
      <div className="h-screen">
        <div className="fixed p-6 top-0 flex items-center justify-between w-screen max-w-96">
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
          ref={ridePopupPanelRef}
          className="fixed w-full z-10 bottom-0 translate-y-0 bg-white px-3 py-10 pt-12 max-w-96"
        >
          <RidePopup
            ride={ride}
            confirmRide={confirmRide}
            setRidePopupPanel={setRidePopupPanel}
            setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          />
        </div>

        {/* ========= confirm ride pop up ======== */}
        <div
          ref={confirmRidePopupPanelRef}
          className="fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white max-w-96"
        >
          <ConfirmRidePopUp
            ride={ride}
            setConfirmRidePopupPanel={setConfirmRidePopupPanel}
            setRidePopupPanel={setRidePopupPanel}
          />
        </div>
      </div>
    </div>
  );
};

export default CaptainHome;
