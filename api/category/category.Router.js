const express = require("express");
const passport = require("passport");
const {
  getAllCategory,
  getOneCategory,
  creatCategory,
  updateCategory,
  deleteOneCategory,
} = require("./category.Controller");
const categorysRouter = express.Router();

categorysRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getAllCategory
);
categorysRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getOneCategory
);
categorysRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  creatCategory
);
categorysRouter.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  updateCategory
);
categorysRouter.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  deleteOneCategory
);

module.exports = categorysRouter;
