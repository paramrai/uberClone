import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LiveTracking from "../../components/LiveTracking";
import FinishRide from "../../components/captain/FinishRide";
import EnterOtpPopUp from "../../components/captain/EnterOtpPopUp";

import current from "../../assets/car.png";
import pickup from "../../assets/location.png";
import destination from "../../assets/locationPin.png";
import InfoAlert from "../../components/captain/InfoAlert";
import { updateHeight } from "../user/Home";

const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const [enterOtpPopupPanel, setEnterOtpPopupPanel] = useState(false);
  const [arrivedAtPickup, setArrivedAtPickup] = useState(null);

  // current rideData
  const location = useLocation();
  const rideData = location.state?.ride;

  // refs
  const finishRidePanelRef = useRef(null);
  const enterOtpPopupPanelRef = useRef(null);
  const infoRef = useRef(null);
  const screenRef = useRef(null);

  useEffect(() => {
    updateHeight(finishRidePanelRef);
    updateHeight(enterOtpPopupPanelRef);
    updateHeight(screenRef);

    // Add event listener to update height on window resize
    window.addEventListener("resize", () => {
      updateHeight(finishRidePanelRef);
      updateHeight(enterOtpPopupPanelRef);
      updateHeight(screenRef);
    });

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", () => {
        updateHeight(finishRidePanelRef);
        updateHeight(enterOtpPopupPanelRef);
        updateHeight(screenRef);
      });
    };
  }, []);

  useGSAP(
    function () {
      if (finishRidePanel) {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(0)",
          display: "block",
        });
      } else {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(100%)",
          display: "none",
        });
      }
    },
    [finishRidePanel]
  );

  useGSAP(
    function () {
      if (enterOtpPopupPanel) {
        gsap.to(enterOtpPopupPanelRef.current, {
          transform: "translateY(0)",
          display: "block",
        });
      } else {
        gsap.to(enterOtpPopupPanelRef.current, {
          transform: "translateY(100%)",
          display: "none",
        });
      }
    },
    [enterOtpPopupPanel]
  );

  return (
    <div
      ref={screenRef}
      className="h-screen relative flex flex-col justify-end overflow-x-hidden overflow-y-auto"
    >
      {arrivedAtPickup && (
        <div
          ref={infoRef}
          className="fixed top-[20%] left-[50%] translate-x-[-50%] w-[80%] z-50 flex items-center justify-center"
        >
          <InfoAlert infoRef={infoRef} />
        </div>
      )}
      <Link
        to="/captain-home"
        className=" h-10 w-10 z-10 bg-white flex items-center justify-center rounded-sm absolute top-[65px] right-[10px]"
      >
        <i className="text-lg font-medium ri-logout-box-r-line"></i>
      </Link>

      {arrivedAtPickup ? (
        <div
          className="h-1/5 p-6 flex items-center justify-center xxs:justify-between relative bg-yellow-400 pt-10"
          onClick={() => {
            setFinishRidePanel(true);
            console.log(finishRidePanel);
          }}
        >
          <h5
            className="p-1 text-center w-full absolute left-0 top-0"
            onClick={() => {}}
          >
            <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
          </h5>
          <div className="text-xl font-semibold hidden xxs:flex flex-col justify-center gap-1">
            <div className="flex items-center h-7 p-2">
              <img src={pickup} alt="pickup" className="w-7 h-7 inline-block" />
              <span className="text-sm">is pickup Point</span>
            </div>
            <div className="flex items-center h-7 p-2">
              <img
                src={destination}
                alt="pickup"
                className="w-7 h-7 inline-block"
              />
              <span className="text-sm">is destination Point</span>
            </div>
          </div>
          <button className=" bg-green-600 text-white font-semibold p-3 px-10 rounded-lg ">
            Complete Ride
          </button>
        </div>
      ) : (
        <div
          className="h-1/5 p-6 flex items-center gap-10 justify-center relative bg-yellow-400 pt-10"
          onClick={() => {
            setEnterOtpPopupPanel(true);
          }}
        >
          <h5
            className="p-1 text-center w-[90%] absolute top-0"
            onClick={() => {}}
          >
            <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
          </h5>
          <h4 className="text-xl font-semibold hidden xs:block">
            Distance :<br />
            {`${rideData?.distance.text}`}
          </h4>
          <button className=" bg-green-600 text-white font-semibold p-3 px-10 rounded-lg">
            Enter Otp
          </button>
        </div>
      )}
      {/* ======== finishRidePanel modal References ===== */}
      <div
        ref={finishRidePanelRef}
        className="absolute w-full z-[656565] bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
      >
        <FinishRide ride={rideData} setFinishRidePanel={setFinishRidePanel} />
      </div>

      {/* ========= Enter otp pop up ======== */}
      <div
        ref={enterOtpPopupPanelRef}
        className="fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-12 overflow-y-auto"
      >
        <EnterOtpPopUp
          setArrivedAtPickup={setArrivedAtPickup}
          ride={rideData}
          setEnterOtpPopupPanel={setEnterOtpPopupPanel}
        />
      </div>

      <div className="h-[80%] absolute w-[100vw] top-0 ">
        <LiveTracking
          arrivedAtPickup={arrivedAtPickup}
          setArrivedAtPickup={setArrivedAtPickup}
          pickupAddress={rideData?.pickup}
          destinationAddress={rideData?.destination}
        />
      </div>
    </div>
  );
};

export default CaptainRiding;
