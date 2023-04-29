const express = require("express");
const router = express.Router();
const complaintsController = require("../controllers/complaintsController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router
  .route("/")
  .get(complaintsController.getAllComplaints)
  .post(complaintsController.createNewComplaint)
  .patch(complaintsController.updateComplaint)
  .delete(complaintsController.deleteComplaint);

module.exports = router;
