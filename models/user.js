const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = userSchema;

// module.exports = model("User", userSchema)

/**
 * In mongodb collections name will be plural form and lowerCase always.
 * For model method we need to pass fist param collections name in titleCase and singular form
 */
