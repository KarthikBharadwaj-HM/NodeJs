const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const multer = require("multer");
const users = require("../models/user");
const auth = require("../middleware/auth");

//mention Where to store the files
const upload = multer({
  limits: { fileSize: 1000000 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png)$/)) {
      cb(new Error("Please upload .jpg or .png image"));
      return;
    }
    cb(null, true);
  },
});

//find and delete me with auth token
router
  .route("/me")
  .get(auth, async (req, res) => {
    // console.log("/me route");
    res.status(200).json(req.user);
  })
  .delete(auth, async (req, res) => {
    try {
      if (req.user._id) {
        await users.deleteOne(req.user._id);
        res.status(200).send("Deleted successfully !!");
      } else {
        res.status(500).send("Could not delete !!");
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//upload images using multer
router
  .route("/me/avatar")
  .post(
    auth,
    upload.single("avatar"),
    async (req, res, next) => {
      req.user.avatar = req.file.buffer;
      await req.user.save();
      res.send("Image uploaded successfully !!");
    },
    (error, req, res, next) => {
      res.status(400).json({ error: error.message });
    }
  )
  .delete(auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send("Image deleted successfully !!");
  });

router.get("/:id/avatar", async (req, res) => {
  try {
    const result = await users.findById(req.params.id).exec();

    if (!result || !result.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/jpg");
    res.send(result.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

//create and read
router
  .route("/")
  .post(async (req, res) => {
    try {
      const user = await users.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      res.status(200).json("user added successfully !!");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .get(auth, async (req, res) => {
    if (req.query.name) {
      try {
        const result = await users.where("name").equals(req.query.name);
        if (!result) {
          throw new Error("Nothing found !!");
        }
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      try {
        const result = await users.find({});
        if (result) {
          res.status(200).json(result);
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  });

//update, delete and get specific user
router
  .route("/:userId")
  .patch(async (req, res) => {
    const fields = Object.keys(req.body);
    const allowedFields = ["name", "email", "password"];
    const isValidUpdates = fields.every((field) =>
      allowedFields.includes(field)
    );

    if (!isValidUpdates) {
      return res.status(400).json({ error: "Invalid updates !!" });
    }

    if (
      req.params.userId &&
      mongoose.Types.ObjectId.isValid(req.params.userId)
    ) {
      try {
        // await users.updateOne({ _id: req.params.userId }, { $set: updates });
        const document = await users.findById(req.params.userId).exec();

        fields.forEach((updates) => {
          document[updates] = req.body[updates];
        });

        await document.save();

        res.status(200).json("Updated user successfully !!");
      } catch (error) {
        res.status(500).send("User update is failed");
      }
    } else {
      res.status(500).send("Id is not valid!!");
    }
  })
  .delete(async (req, res) => {
    if (
      req.params.userId &&
      mongoose.Types.ObjectId.isValid(req.params.userId)
    ) {
      try {
        await users.deleteOne({ _id: req.params.userId });
        res
          .status(200)
          .send(`User with id ${req.params.userId} deleted successfully !!`);
      } catch (error) {
        res.status(500).send("Failed to delete user !!");
      }
    } else {
      res.status(500).send("user id is not valid !!");
    }
  })
  .get(async (req, res) => {
    try {
      const result = await users.findById(req.params.userId).exec();
      if (result) {
        res.status(200).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//user login
router.post("/login", async (req, res) => {
  try {
    const authenticatedUser = await users.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await authenticatedUser.generateAuthToken();
    res.status(200).json({ user: authenticatedUser, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    if (!req.user || !req.token) {
      throw new Error("Login attempt failed !!");
    }
    const filteredTokens = req.user.tokens.filter(
      (item) => item.token != req.token
    );
    req.user.tokens = filteredTokens;
    await req.user.save();
    res.status(200).send("logged out successfully !!");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
