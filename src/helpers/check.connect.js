"use strict";

const mongoose = require("mongoose");

const os = require("os");
const process = require("process");

const _SECONDS = 5000;

// count Connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of connection: ${numConnection}`);
};

// check overload

const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    // Example maximum number of connection based on number of cores
    const maxConnection = numCores * 5;

    console.log(`Active connections: ${numConnection}`);
    console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

    if (numConnection > maxConnection) {
      console.log(`Connection overload detected!`);
      // notify.send(...)
    }
  }, _SECONDS); // Monitor every 5 secs
};

module.exports = {
  countConnect,
  checkOverload,
};
