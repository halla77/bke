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

ingredientRouter.get("/", getAllIngredient);
ingredientRouter.get("/:id", getOneIngredient);
ingredientRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  creatIngredient
);
ingredientRouter.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateIngredient
);
ingredientRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteOneIngredient
);

module.exports = ingredientRouter;
