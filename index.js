const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const port = 8081;
const io = require("socket.io")(http);

app.use(express.static("public"));

http.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

module.exports = {
  io,
};
