const app = require("./src/app");

const PORT = process.env.PORT || 3055;

const server = app.listen(PORT, () => {
  console.log(`Server running on port:${PORT}`);
});

// process.on("SIGNINT", () => {
//   server.close(() => {
//     console.log("Server closed");
//   });
//   // notify.send(ping...)
// });
