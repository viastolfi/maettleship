const express = require("express");
const app = express();
const http = require("http").Server(app);
const { createServer } = require("http");
const { Server } = require("socket.io");
const port = 8081;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://codefirst.iut.uca.fr/containers/vincentastolfi-maettleship",
    // or with an array of origins
    // origin: ["https://my-frontend.com", "https://my-other-frontend.com", "http://localhost:3000"],
    credentials: true
  }
});

app.use(express.static("public"));

http.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

module.exports = {
  io,
};
