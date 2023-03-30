const express = require("express");
require("dotenv").config();
const userRouter = require("./routes/users");
const customerRouter = require("./routes/customers");

//access env variables
const port = process.env.PORT;

//init app and middleware
const app = express();
app.use(express.json());
app.use("/users", userRouter); //go to file router.js if route matches /users or /users/nextPath
app.use("/customers", customerRouter);

app.listen(port, () => {
  console.log("app listening to port 3000");
});
