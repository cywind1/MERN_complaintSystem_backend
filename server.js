const express = require("express");
// express() = app object returned = main app
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3500;

// express.static = serve static assets, e.g. css / images
app.use("/", express.static(path.join(__dirname, "/public")));

// server.js -> root.js -> index.html -> style.css
app.use("/", require("./routes/root"));

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
