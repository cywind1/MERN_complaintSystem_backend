const express = require("express");
// express.Router() = mini app returned
const router = express.Router();
const path = require("path");

// ^ = start, $ = end, ? = optional
router.get("^/$|index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

module.exports = router;
