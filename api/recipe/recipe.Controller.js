const Recipe = require("../../models/Recipe");
const Ingredient = require("../../models/Ingredient");
const Category = require("../../models/Category");
const User = require("../../models/User");

const getAllRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find()
      .populate("user", "username email")
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
      .populate("user", "username email")
      .populate("categorys")
      .populate("ingredients");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    return res.status(200).json(recipe);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }
    next(error);
  }
};

const creatRecipe = async (req, res, next) => {
  try {
    const recipeInfo = {
      name: req.body.name,
      user: req.user._id,
    };
    const newRecipe = await Recipe.create({ ...req.body, ...recipeInfo });
    const ingredients = req.body.ingredients;
    const categorys = req.body.categorys;

    await Ingredient.updateMany(
      { _id: { $in: ingredients } },
      { $push: { recipes: newRecipe._id } }
    );
    await Category.updateMany(
      { _id: { $in: categorys } },
      { $push: { recipes: newRecipe._id } }
    );
    await User.findByIdAndUpdate(req.user._id, {
      $push: { recipes: newRecipe._id },
    });

    const populatedRecipe = await Recipe.findById(newRecipe._id)
      .populate("user", "username email")
      .populate("categorys")
      .populate("ingredients");

    return res.status(201).json(populatedRecipe);
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
      .populate("user", "username email")
      .populate("categorys")
      .populate("ingredients");

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const ingredients = req.body.ingredients;
    const categorys = req.body.categorys;

    await Ingredient.updateMany(
      { _id: { $in: ingredients } },
      { $addToSet: { recipes: updatedRecipe._id } }
    );
    await Category.updateMany(
      { _id: { $in: categorys } },
      { $addToSet: { recipes: updatedRecipe._id } }
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

    // Remove the recipe reference from the user
    await User.findByIdAndUpdate(deletedRecipe.user, {
      $pull: { recipes: deletedRecipe._id },
    });

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
