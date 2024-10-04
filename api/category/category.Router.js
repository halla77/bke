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

categorysRouter.get("/", getAllCategory);
categorysRouter.get("/:id", getOneCategory);
categorysRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  creatCategory
);
categorysRouter.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateCategory
);
categorysRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteOneCategory
);

module.exports = categorysRouter;
