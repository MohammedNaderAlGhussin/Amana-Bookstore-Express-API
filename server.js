const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome" });
});
app.get("/hi", (req, res) => {
  res.json({ success: true, message: "Hi" });
});

app.listen(port, () => {
  console.log("The server is running on port ", port);
});
