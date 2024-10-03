const express = require("express");
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
ingredientRouter.post("/", creatIngredient);
ingredientRouter.put("/:id", updateIngredient);
ingredientRouter.delete("/:id", deleteOneIngredient);

module.exports = ingredientRouter;
