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

  // Fix:typo Changed "connnection" to "connection"
  io.on("connection", function (socket) {
    console.log(`Client connected ${socket.id}`);

    socket.on("join", async (data) => {
      try {
        const { userId, userType } = data;

        // Handle user/captain socket connection
        if (userType === "user") {
          const user = await userModel
            .findByIdAndUpdate(userId, {
              socketId: socket.id,
              isOnline: true,
            })
            .lean();
          socket.emit("join-success", {
            user: { ...user, socketId: socket.id },
          });
          console.log(`User is Connnected to ${socket.id}`);
        } else if (userType === "captain") {
          const captain = await captainModel
            .findByIdAndUpdate(
              userId,
              {
                socketId: socket.id,
                status: "active",
              },
              { new: true }
            )
            .lean();

          socket.emit("join-success", {
            captain: { ...captain, socketId: socket.id },
          });
          console.log(`Captain is Connnected to ${socket.id}`);
        }
      } catch (error) {
        console.error("Error in join event:", error);
        socket.emit("error", { message: "Failed to join" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Remove socketId on disconnect
      try {
        await Promise.all([
          userModel.updateOne(
            { socketId: socket.id },
            { socketId: null, isOnline: false }
          ),
          captainModel.updateOne(
            { socketId: socket.id },
            { socketId: null, status: "inactive" }
          ),
        ]);
      } catch (error) {
        console.error("Error in disconnect:", error);
      }
    });

    // update captain location
    socket.on("update-captain-location", async (data) => {
      try {
        const { userId, location } = data;
        if (!userId || !location.ltd || !location.lng) {
          return socket.emit("error", { message: "Invalid location data" });
        }

        await captainModel.findByIdAndUpdate(userId, {
          location: { lng: location.lng, ltd: location.ltd },
        });
        console.log(`Captain location updated for ${socket.id}`);
      } catch (error) {
        console.error("Error updating location:", error);
        socket.emit("error", { message: "Failed to update location" });
      }
    });

    // Error handling
    socket.on("error", (error) => {
      console.error("Socket error:", error);
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
