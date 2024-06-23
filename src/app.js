require("dotenv").config();

const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const app = express();

// Init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Init database
require("./dbs/init.mongodb");

// Init routes
app.use("/", require("./routes"));

// Handle error

module.exports = app;
