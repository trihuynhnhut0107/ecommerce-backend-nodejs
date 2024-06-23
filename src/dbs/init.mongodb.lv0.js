"use strict";

const mongoose = require("mongoose");
const { c } = require("tar");

const connectString = "mongodb://localhost:27017/hlv-tactical-board";
mongoose
  .connect(connectString)
  .then((_) => console.log("DB Connected"))
  .catch((err) => console.log(err));

// dev
if (1 === 0) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}
module.exports = mongoose;
