const express = require("express");
const app = express();
const path = require("path");
const { Server } = require("socket.io");
const { createServer } = require("node:http");

const server = createServer(app);
const io = new Server(server);

app.use(express.static("public"));

server.listen(8081, () => {
  console.log("server running ! ");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

module.exports = {
  io,
};
