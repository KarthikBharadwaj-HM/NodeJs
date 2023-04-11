const jwt = require("jsonwebtoken");
const users = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await users
      .findOne({
        _id: decoded._id,
        "tokens.token": token,
      })
      .exec();

    const isValidToken = user.tokens.find((item) => item.token === token);

    if (!user && !isValidToken) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = auth;
