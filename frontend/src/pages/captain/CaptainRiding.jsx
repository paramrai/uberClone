import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LiveTracking from "../../components/LiveTracking";
import FinishRide from "../../components/captain/FinishRide";
import EnterOtpPopUp from "../../components/captain/EnterOtpPopUp";

// temporarily used for testing to show captain reacheda t pickup

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

  useGSAP(
    function () {
      if (finishRidePanel) {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(100%)",
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
        });
      } else {
        gsap.to(enterOtpPopupPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [enterOtpPopupPanel]
  );

  return (
    <div className="h-screen relative max-w-96 mx-auto flex flex-col justify-end">
      <Link
        to="/captain-home"
        className=" h-10 w-10 z-10 bg-white flex items-center justify-center rounded-sm absolute top-[65px] right-[10px]"
      >
        <i className="text-lg font-medium ri-logout-box-r-line"></i>
      </Link>

      {arrivedAtPickup ? (
        <div
          className="h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10"
          onClick={() => {
            setFinishRidePanel(true);
          }}
        >
          <h5
            className="p-1 text-center w-[90%] absolute top-0"
            onClick={() => {}}
          >
            <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
          </h5>
          <h4 className="text-xl font-semibold">
            Distance :<br />
            {`${rideData?.distance.text}`}
          </h4>
          <button className=" bg-green-600 text-white font-semibold p-3 px-10 rounded-lg">
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
          <h4 className="text-xl font-semibold">
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
        className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12 max-w-96"
      >
        <FinishRide ride={rideData} setFinishRidePanel={setFinishRidePanel} />
      </div>

      {/* ========= confirm ride pop up ======== */}
      <div
        ref={enterOtpPopupPanelRef}
        className="fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white max-w-96"
      >
        <EnterOtpPopUp
          setArrivedAtPickup={setArrivedAtPickup}
          ride={rideData}
          setEnterOtpPopupPanel={setEnterOtpPopupPanel}
        />
      </div>

      <div className="h-[80%] fixed w-screen top-0 max-w-96">
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
