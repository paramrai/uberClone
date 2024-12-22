const socketIo = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connnection", function (socket) {
    console.log(`Client connected ${socket.id}`);

    socket.on("join", async (data) => {
      const { userId, userType } = data;

      console.log(`User ${userId} joined as ${userType}`);

      // Handle user/captain socket connection
      if (userType === "user") {
        await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
      } else if (userType === "captain") {
        await captainModel.findByIdAndUpdate(userId, {
          socketId: socket.id,
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Remove socketId on disconnect
      await userModel.updateOne({ socketId: socket.id }, { socketId: null });
      await captainModel.updateOne({ socketId: socket.id }, { socketId: null });
    });

    socket.on("update-captain-location", async (data) => {
      const { userId, location } = data;
      if (!userId || !location.ltd || !location.lng) {
        return socket.emit("error", { message: "Invalid location data" });
      }

      await captainModel.findByIdAndUpdate(userId, {
        location: { lng: location.lng, ltd: location.ltd },
      });
    });
  });
}

function sendMessageToSocketId(socketId, messageObject) {
  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket io not initialized");
  }
}

module.exports = { initializeSocket, sendMessageToSocketId };
