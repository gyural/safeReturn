const express = require("express");
const route = express.Router();
const { imgGen } = require("../Controllers/imgGenController");

route.get("/", imgGen);

module.exports = route;
