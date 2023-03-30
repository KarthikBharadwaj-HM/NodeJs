const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const userSchema = require("../models/user");

//access env variables
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const sample_mflix = process.env.SAMPLE_MFLIX;

//Connect to users DB
const connection = mongoose.createConnection(
  `mongodb+srv://${username}:${password}@mymongodbcluster.pgkf7on.mongodb.net/${sample_mflix}?retryWrites=true&w=majority`
);

const users = connection.model("User", userSchema);

connection.on("connected", () => {
  console.log("connected users DB");
});

//for route /users
router.get("/", async (req, res) => {
  try {
    const result = await users.find({});
    if (result) {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

//for route /users/:userId
router.get("/:userId", async (req, res) => {
  try {
    const result = await users.findById(req.params.userId).exec();
    if (result) {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
