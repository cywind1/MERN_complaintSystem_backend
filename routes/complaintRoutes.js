const express = require("express");
const router = express.Router();
const complaintsController = require("../controllers/complaintsController");

router
  .route("/")
  .get(complaintsController.getAllComplaints)
  .post(complaintsController.createNewComplaint)
  .patch(complaintsController.updateComplaint)
  .delete(complaintsController.deleteComplaint);

module.exports = router;
