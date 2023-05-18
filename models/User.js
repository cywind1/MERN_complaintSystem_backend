const mongoose = require("mongoose");

// User -> userRoutes -> usersController
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  //12.2 change format, [] from outside, to inside (with element)
  roles: {
    type: [String],
    default: ["Customer"],
  },

  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("User", userSchema);
