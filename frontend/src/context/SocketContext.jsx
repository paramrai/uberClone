import React from "react";
import { useEffect } from "react";
import { createContext } from "react";
import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from the server");
    });
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
