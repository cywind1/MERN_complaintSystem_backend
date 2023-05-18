require("dotenv").config();
const express = require("express");
// express() = app object returned = main app
const app = express();
const path = require("path");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
// 2.1
const { logger, logEvents } = require("./middleware/logger");
// 2.2
const errorHandler = require("./middleware/errorHandler");
// 2.3
const cookieParser = require("cookie-parser");
// 2.4.1
const cors = require("cors");
// 2.4.2
const corsOptions = require("./config/corsOptions");

const PORT = process.env.PORT || 3500;

// 3
connectDB();

// development
console.log(process.env.NODE_ENV);

// 2.1
app.use(logger);
// 2.2
app.use(errorHandler);
//2.3 - BUG if no ()
app.use(cookieParser());
// 2.4
app.use(cors(corsOptions));

// DEBUG: TypeError: Cannot destructure property 'username' of 'req.body' as it is undefined.
// https://www.geeksforgeeks.org/express-js-express-json-function/
// express.json() = built-in middleware = parses incoming requests with JSON payloads, return object
app.use(express.json());

// express.static = serve static assets, e.g. css / images
app.use("/", express.static(path.join(__dirname, "/public")));

// server.js -> root.js -> index.html -> style.css
app.use("/", require("./routes/root"));

// 8.2
app.use("/auth", require("./routes/authRoutes"));
// 4.1 User
app.use("/users", require("./routes/userRoutes"));
// 4.2 Complaint
app.use("/complaints", require("./routes/complaintRoutes"));

app.all("*", (req, res) => {
  // res.sendStatus(404) also works (latest version)but without css
  // https://www.geeksforgeeks.org/express-js-res-status-function/
  res.status(404);
  // https://www.geeksforgeeks.org/express-js-req-accepts-function/
  // req.accepts(type) = return string, check if specified content types are acceptable
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});

// DEBUG:
// app.post("/complaints", async (req, res) => {
//   try {
//     const { user, title, text } = req.body;
//     console.log("Before create: ", { user, title, text });
//     const complaint = await Complaint.create({ user, title, text });
//     console.log("Hihi");
//     console.log("Complaint created:", complaint);
//     res.send(complaint);
//     console.log("Response sent");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error creating complaint");
//   }
// });

// DEBUG: check if the request is reaching the server
// app.post("/complaints", async (req, res) => {
//   console.log("Post request received for creating a new complaint");
// });

// DEBUG: check if the request body is being parsed correctly
// app.post("/complaints", async (req, res) => {
//   console.log("Request body:", req.body);
// });
