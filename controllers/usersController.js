const User = require("../models/User");
const Complaint = require("../models/Complaint");
// handling exceptions inside of async express routes and passing them to your express error handlers.
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // -password = not returning password
  // .lean() = tells Mongoose to skip hydrating the result documents, makes queries faster
  const users = await User.find().select("-password").lean();
  // if (!users) ->  res.json(users);
  // if empty array -> return msg
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // 12.3 No role check
  // if (!username || !password || !Array.isArray(roles) || !roles.length) {
  //confirm data
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 12.1 check for duplicate, collation : check case sensitivity
  // const duplicate = await User.findOne({ username }).lean().exec();
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // hash password = for security
  // Hashing turns password into a short string of letters and/or numbers using an encryption algorithm
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds
  // const userObject = { username, password: hashedPwd, roles };
  // role check
  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPwd }
      : { username, password: hashedPwd, roles };
  // create and store new user
  const user = await User.create(userObject);

  if (user) {
    // created, backtick when ${}
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;
  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // 12.1 check for duplicate
  // const duplicate = await User.findOne({ username }).lean().exec();
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // allow updated to the original user
  // _id field is always the first field in the documents in MongoDB
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // put input value to database
  user.username = username;
  user.roles = roles;
  user.active = active;

  // matched password
  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();
  res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  // id is only the required info for deleting data
  // req.body = required info
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  // const complaint = await Complaint.findOne({ user: id }).lean().exec();
  // // if complaint assigned to user, not delete
  // if (complaint) {
  //   return res.status(400).json({ message: "User has assigned complaints" });
  // }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();
  const reply = `Username ${result.username} with ID ${result._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
