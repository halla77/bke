const express = require("express");
const passport = require("passport");
const {
  getAllIngredient,
  getOneIngredient,
  creatIngredient,
  updateIngredient,
  deleteOneIngredient,
} = require("./ingredient.Controller");
const ingredientRouter = express.Router();

ingredientRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getAllIngredient
);
ingredientRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getOneIngredient
);
ingredientRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  creatIngredient
);
ingredientRouter.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  updateIngredient
);
ingredientRouter.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  deleteOneIngredient
);

module.exports = ingredientRouter;
