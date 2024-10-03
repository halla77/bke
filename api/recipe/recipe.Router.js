const express = require("express");
const passport = require("passport");
const {
  getAllRecipes,
  getOneRecipe,
  creatRecipe,
  updateRecipe,
  deleteOneRecipe,
} = require("./recipe.Controller");
const recipeRouter = express.Router();

recipeRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getAllRecipes
);
recipeRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getOneRecipe
);
recipeRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  creatRecipe
);
recipeRouter.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  updateRecipe
);
recipeRouter.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  deleteOneRecipe
);
module.exports = recipeRouter;
