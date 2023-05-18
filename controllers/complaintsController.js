const Complaint = require("../models/Complaint");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc Get all complaints
// @route GET /complaints
// @access Private
const getAllComplaints = asyncHandler(async (req, res) => {
  // Get all complaints from MongoDB
  const complaints = await Complaint.find().lean();

  // If no complaints
  if (!complaints?.length) {
    return res.status(400).json({ message: "No complaints found" });
  }

  const complaintsWithUser = await Promise.all(
    complaints.map(async (complaint) => {
      // if (!complaint.user) {
      //   throw new Error("No user found for complaint");
      // }
      const user = await User.findById(complaint.user).lean().exec();
      // DEBUG: 11_complaint-with-users
      // console.log("Complaint:", complaint);
      // console.log("User:", user);

      // optional: for debugging
      if (!user) {
        throw new Error(`User with id ${complaint.user} not found`);
      }
      // optional: for debugging
      if (!user.username) {
        throw new Error(`Username not defined for user with id ${user._id}`);
      }
      return { ...complaint, username: user.username };
    })
  );

  res.json(complaintsWithUser);
});

// Add username to each complaint before sending the response
// See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
// You could also do this with a for...of loop
// ---------------
//   const complaintsWithUser = await Promise.all(
//     complaints.map(async (complaint) => {
//       const user = await User.findById(complaint.user).lean().exec();
//       return { ...complaint, username: user.username };
//     })
//   );

//   res.json(complaintsWithUser);
// });

// @desc Create new complaint
// @route POST /complaints
// @access Private
const createNewComplaint = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;
  // Confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate title
  // const duplicate = await Complaint.findOne({ title }).lean().exec();
  // 12.1 collation : check case sensitivity
  const duplicate = await Complaint.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate complaint title" });
  }

  // Create and store the new user
  try {
    const complaintObject = { user, title, text };
    const complaint = await Complaint.create(complaintObject);
    // handle successful creation of complaint
    if (complaint) {
      // Created
      return res.status(201).json({ message: "New complaint created" });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid complaint data received" });
    }
  } catch (error) {
    console.error(error);
    // handle error
  }
});

// @desc Update a complaint
// @route PATCH /complaints
// @access Private
const updateComplaint = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  // Confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm complaint exists to update
  const complaint = await Complaint.findById(id).exec();

  if (!complaint) {
    return res.status(400).json({ message: "Complaint not found" });
  }

  // Check for duplicate title
  // const duplicate = await Complaint.findOne({ title }).lean().exec();
  const duplicate = await Complaint.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original complaint
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate complaint title" });
  }

  complaint.user = user;
  complaint.title = title;
  complaint.text = text;
  complaint.completed = completed;

  const updatedComplaint = await complaint.save();

  res.json(`'${updatedComplaint.title}' updated`);
});

// @desc Delete a complaint
// @route DELETE /complaints
// @access Private
const deleteComplaint = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Complaint ID required" });
  }

  // Confirm complaint exists to delete
  const complaint = await Complaint.findById(id).exec();

  if (!complaint) {
    return res.status(400).json({ message: "Complaint not found" });
  }

  const result = await complaint.deleteOne();

  const reply = `Complaint '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllComplaints,
  createNewComplaint,
  updateComplaint,
  deleteComplaint,
};
