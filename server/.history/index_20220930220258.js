const express = require("express");
const app = express();
const PORT = 4000;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//New imports
const http = require("http").Server(app);
const cors = require("cors");
app.use(cors());

// socket

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });
});

// routes
app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

// server listen
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
