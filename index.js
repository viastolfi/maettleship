const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 8081;

app.use(express.static("public"));

require('./app')(io);

http.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

module.exports = {
  io,
};
