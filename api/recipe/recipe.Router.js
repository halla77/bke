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

recipeRouter.get("/", getAllRecipes);
recipeRouter.get("/:id", getOneRecipe);
recipeRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  creatRecipe
);
recipeRouter.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateRecipe
);
recipeRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteOneRecipe
);
module.exports = recipeRouter;
