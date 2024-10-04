const express = require("express");
const usersRouter = express.Router();
const {
  signup,
  signin,
  getUsers,

  updateUser,
  getOneUser,
} = require("./users.controllers");
const passport = require("passport");

usersRouter.post("/signup", signup);
usersRouter.post(
  "/signin",
  passport.authenticate("local", { session: false }),
  signin
);

usersRouter.get("/", getUsers);
usersRouter.put(
  "/:id",
  updateUser,
  passport.authenticate("jwt", { session: false })
);

usersRouter.get("/:id", getOneUser);
module.exports = usersRouter;
