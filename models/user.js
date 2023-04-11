const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator").default;

//access env variables
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const sample_mflix = process.env.SAMPLE_MFLIX;

//Connect to users DB
const connection = mongoose.createConnection(
  `mongodb+srv://${username}:${password}@mymongodbcluster.pgkf7on.mongodb.net/${sample_mflix}?retryWrites=true&w=majority`
);

connection.on("connected", () => {
  console.log("connected users DB");
});

connection.on("error", (err) => {
  console.log(`Database error ${err}`);
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // email should be unique for all users
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid !!");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    //We use array because user may login from different devices like Mobile or Laptop. So JWT will generate tokens with different timeStamp
    //So we need array to store multiple tokens for user.
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  { timestamps: true }
);

//Availabe under instance generated by model eg. user instance
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "auth1");
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

/**
 * User Login function.
 * @constructor
 * @param {string} email - User email
 * @param {string} password - User password
 */

//custom schema method to validate user availabe under model
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await users.findOne({ email }).exec();
  if (!user) {
    throw new Error("Unable to login !!");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login !!");
  }
  return user;
};

//before saving document to db
userSchema.pre("save", async function (next) {
  const user = this; //document we're about to save in db
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const users = (module.exports = connection.model("User", userSchema));

/**
 * In mongodb collections name will be plural form and lowerCase always.
 * For model method we need to pass fist param collections name in titleCase and singular form
 */
