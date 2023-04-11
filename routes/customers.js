const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const customerSchema = require("../models/customer");

//access env variables
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const sample_analytics = process.env.SAMPLE_ANALYTICS;

//Connect to customers DB
const connection = mongoose.createConnection(
  `mongodb+srv://${username}:${password}@mymongodbcluster.pgkf7on.mongodb.net/${sample_analytics}?retryWrites=true&w=majority`
);

const customers = connection.model("Customer", customerSchema);

connection.on("connected", () => {
  console.log("connected customers DB");
});

connection.on("error", (err) => {
  console.log(`Database error ${err}`);
});

router.route("/").get(async (req, res) => {
  if (req.query.page) {
    try {
      const page = req.query.page || 0;
      const maxBooksPerPage = 3;
      const pagination = {
        skip: page * maxBooksPerPage,
        limit: maxBooksPerPage,
      };

      const result = await customers
        .find({}, "name address", pagination)
        .exec();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error });
    }
  } else {
    try {
      const result = await customers.find({});
      if (result) {
        res.status(200).json(result);
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  }
});

router.get("/:customerId", async (req, res) => {
  try {
    const result = await customers.findById(req.params.customerId).exec();
    if (result) {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
