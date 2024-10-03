const express = require("express");
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
recipeRouter.post("/", creatRecipe);
recipeRouter.put("/:id", updateRecipe);
recipeRouter.delete("/:id", deleteOneRecipe);
module.exports = recipeRouter;
