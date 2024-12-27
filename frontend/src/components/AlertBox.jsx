import React, { useState } from "react";

const AlertBox = ({ error, travelMode, handleTravelModeChange, map }) => {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="absolute top-[15%] left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-4 rounded-md shadow-lg transition duration-300 ease-in-out w-[90%] z-[500000]">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold">Oh snap! You got an error!</h3>
          <p>{error}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => map && handleTravelModeChange(travelMode)}
            className="bg-white text-red-500 px-3 py-1 rounded-md hover:bg-gray-100 transition duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertBox;
