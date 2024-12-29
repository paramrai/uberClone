import React from "react";

const ShowAlert = ({ error, dismissAlert }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-semibold mb-4">Error</h2>
        <p className="mb-4">{error}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={dismissAlert}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Dismiss
          </button>
          <button
            onClick={dismissAlert}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowAlert;
