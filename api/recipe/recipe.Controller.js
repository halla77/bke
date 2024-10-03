const Recipe = require("../../models/Recipe");
const Ingredient = require("../../models/Ingredient");
const Category = require("../../models/Category");
const getAllRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find()
      .populate("categorys")
      .populate("ingredients");
    return res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};
const getOneRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("categorys")
      .populate("ingredients");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    return res.status(200).json(recipe);
  } catch (error) {
    next(error);
  }
};

const creatRecipe = async (req, res, next) => {
  try {
    // if (req.file) {
    //   request.body.image = req.file.path;
    // }
    const newRecipe = await Recipe.create(req.body);
    const ingredients = req.body.ingredients;
    const categorys = req.body.categorys;
    const updateIngredients = await Ingredient.updateMany(
      { _id: ingredients },
      { $push: { recipes: newRecipe._id } }
    );
    const updateCategorys = await Category.updateMany(
      { _id: categorys },
      { $push: { recipes: newRecipe._id } }
    );
    return res.status(201).json(newRecipe);
  } catch (error) {
    next(error);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("categorys")
      .populate("ingredients");

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const ingredients = req.body.ingredients;
    const categorys = req.body.categorys;

    await Ingredient.updateMany(
      { _id: { $in: ingredients } },
      { $push: { recipes: updatedRecipe._id } }
    );
    await Category.updateMany(
      { _id: { $in: categorys } },
      { $push: { recipes: updatedRecipe._id } }
    );

    return res.status(200).json(updatedRecipe);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }
    next(error);
  }
};

const deleteOneRecipe = async (req, res, next) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe)
      return res.status(404).json({ message: "Recipe not found" });

    const ingredients = deletedRecipe.ingredients;
    const categorys = deletedRecipe.categorys;

    // Remove the recipe reference from ingredients
    await Ingredient.updateMany(
      { _id: { $in: ingredients } },
      { $pull: { recipes: deletedRecipe._id } }
    );

    // Remove the recipe reference from categories
    await Category.updateMany(
      { _id: { $in: categorys } },
      { $pull: { recipes: deletedRecipe._id } }
    );

    return res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRecipes,
  getOneRecipe,
  creatRecipe,
  updateRecipe,
  deleteOneRecipe,
};
