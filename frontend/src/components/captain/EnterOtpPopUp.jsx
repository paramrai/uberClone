import axios from "axios";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../../context/CaptainContext";

const EnterOtpPopUp = (props) => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const captain = useContext(CaptainDataContext);

  const [error, setError] = useState(null);

  const submitHander = async (e) => {
    e.preventDefault();
    console.log("otpEnter", captain && captain);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid OTP");
      return;
    }

    try {
      // start the ride
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/start-ride`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("captain-token")}`,
          },
          params: {
            rideId: props.ride._id,
            otp,
            captain,
          },
        }
      );

      if (response.status === 200) {
        // start riding
        // set captain reached at pickup
        props.setArrivedAtPickup(true);
        props.setEnterOtpPopupPanel(false);
        console.log("Captain started driving");
        setError(null);
      }
    } catch (error) {
      setError("Invalid Otp");
    }
  };

  return (
    <div className="relative">
      {error && <ShowAlert error={error} />}
      <h5
        className="text-center absolute top-0 right-2 cursor-pointer"
        onClick={() => {
          props.setEnterOtpPopupPanel(false);
        }}
      >
        <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-xl font-semibold mt-4">
        Enter Otp to Start this ride
      </h3>
      <div className="flex flex-wrap items-center justify-between p-3 border-2 border-yellow-400 rounded-lg mt-2">
        <div className="flex flex-wrap items-center gap-3 ">
          <img
            className="h-12 rounded-full object-cover w-12"
            src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"
            alt=""
          />
          <h2 className="text-lg font-medium">
            {props.ride?.user.fullname.firstname +
              " " +
              props.ride?.user.fullname.lastname}
          </h2>
        </div>
        <h5 className="text-lg font-semibold">{`${(
          props.ride?.distance.value / 1000
        ).toFixed(2)} KM`}</h5>
      </div>
      <div className="flex justify-between flex-col items-center">
        <div className="w-full mt-1">
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="ri-map-pin-user-fill"></i>
            <div>
              <h3 className="text-lg font-medium">562/11-A</h3>
              <p className="text-sm -mt-1 text-gray-600">
                {props.ride?.pickup}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className="text-lg font-medium">562/11-A</h3>
              <p className="text-sm -mt-1 text-gray-600">
                {props.ride?.destination}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3">
            <i className="ri-currency-line"></i>
            <div>
              <h3 className="text-lg font-medium">₹{props.ride?.fare}</h3>
              <p className="text-sm -mt-1 text-gray-600">Cash Cash</p>
            </div>
          </div>
        </div>
        <div className="mt-6 w-full">
          <form
            onSubmit={(e) => {
              submitHander(e);
            }}
          >
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              className="bg-[#eee] px-6 py-4 font-mono text-lg rounded-lg w-full"
              placeholder="Enter OTP"
            />
            <button
              type="submit"
              className="w-full mt-5 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg"
            >
              Start Ride
            </button>
          </form>
          <button
            onClick={() => {
              props.setEnterOtpPopupPanel(false);
            }}
            className="w-full mt-2 bg-red-600 text-lg text-white font-semibold p-3 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterOtpPopUp;
