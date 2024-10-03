const express = require("express");
const usersRouter = express.Router();
const {
  signup,
  signin,
  getUsers,
  signout,
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
usersRouter.post("/signout", signout);
usersRouter.get("/", getUsers);
usersRouter.put(
  "/:id",
  updateUser,
  passport.authenticate("jwt", { session: false })
);
// usersRouter.delete(
//   "/:id",
//   deleteUser,
//   passport.authenticate("jwt", { session: false })
// );
usersRouter.get("/:id", getOneUser);
module.exports = usersRouter;
