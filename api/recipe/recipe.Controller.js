const Recipe = require("../../models/Recipe");
const Ingredient = require("../../models/Ingredient");
const Category = require("../../models/Category");
const User = require("../../models/User");

const getAllRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find()
      .populate("user", "username email")
      .populate("category")
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
      .populate("category")
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
    const {
      name,
      description,
      ingredients,
      instructions,
      timeToCook,
      calories,
      category,
    } = req.body;

    const recipeImage = req.file ? req.file.path : null;
    console.log(recipeImage);
    console.log(typeof ingredients);
    const ingredientIds = ingredients.split(",").map((id) => id);
    const categoryIds = category.split(",").map((id) => id);
    const newRecipe = new Recipe({
      name,
      description,
      ingredients: ingredientIds,
      instructions,
      timeToCook,
      calories,
      category: categoryIds,
      recipeImage,
      user: req.user.id,
    });

    const savedRecipe = await newRecipe.save();
    // The issue is that the ingredients are being passed as a string instead of an array of ObjectIds
    // We need to parse the string and convert it to an array of ObjectIds

    await Ingredient.updateMany(
      { _id: { $in: ingredientIds } },
      { $push: { recipes: savedRecipe._id } }
    );

    await Category.updateMany(
      { _id: { $in: categoryIds } },
      { $push: { recipes: savedRecipe._id } }
    );
    await User.findByIdAndUpdate(req.user._id, {
      $push: { recipes: newRecipe._id },
    });
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);
    const {
      name,
      description,
      ingredients,
      instructions,
      timeToCook,
      calories,
      category,
    } = req.body;
    const ingredientIds = ingredients.split(",").map((id) => id);
    const categoryIds = category.split(",").map((id) => id);
    const recipeImage = req.file ? req.file.path : undefined;

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      {
        name,
        description,
        ingredients: ingredientIds,
        instructions,
        timeToCook,
        calories,
        category: categoryIds,
        ...(recipeImage && { recipeImage }),
      },
      { new: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
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
    const category = deletedRecipe.category;

    // Remove the recipe reference from ingredients
    await Ingredient.updateMany(
      { _id: { $in: ingredients } },
      { $pull: { recipes: deletedRecipe._id } }
    );

    // Remove the recipe reference from categories
    await Category.updateMany(
      { _id: { $in: category } },
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

const toggleLikeRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const userLikedIndex = recipe.likes.indexOf(userId);
    const userDislikedIndex = recipe.dislikes.indexOf(userId);

    if (userLikedIndex > -1) {
      // User already liked, so unlike
      recipe.likes.splice(userLikedIndex, 1);
    } else {
      // Add like and remove dislike if exists
      recipe.likes.push(userId);
      if (userDislikedIndex > -1) {
        recipe.dislikes.splice(userDislikedIndex, 1);
      }
    }

    await recipe.save();

    res
      .status(200)
      .json({ likes: recipe.likes.length, dislikes: recipe.dislikes.length });
  } catch (error) {
    next(error);
  }
};

const toggleDislikeRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const userLikedIndex = recipe.likes.indexOf(userId);
    const userDislikedIndex = recipe.dislikes.indexOf(userId);

    if (userDislikedIndex > -1) {
      // User already disliked, so remove dislike
      recipe.dislikes.splice(userDislikedIndex, 1);
    } else {
      // Add dislike and remove like if exists
      recipe.dislikes.push(userId);
      if (userLikedIndex > -1) {
        recipe.likes.splice(userLikedIndex, 1);
      }
    }

    await recipe.save();

    res
      .status(200)
      .json({ likes: recipe.likes.length, dislikes: recipe.dislikes.length });
  } catch (error) {
    next(error);
  }
};

const getLikesForRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id).populate(
      "likes",
      "username email"
    ); // Adjust fields as needed

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json({
      recipeId: recipe._id,
      likes: recipe.likes,
      totalLikes: recipe.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

const getDislikesForRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id).populate(
      "dislikes",
      "username email"
    ); // Adjust fields as needed

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json({
      recipeId: recipe._id,
      dislikes: recipe.dislikes,
      totalDislikes: recipe.dislikes.length,
    });
  } catch (error) {
    next(error);
  }
};

const searchRecipes = async (searchParams) => {
  try {
    const { data } = await instance.get("/recipes/search", {
      params: searchParams,
    });
    return data.map((recipe) => ({
      _id: recipe._id,
      title: recipe.name,
      calories: recipe.calories,
      // ... other fields
    }));
  } catch (error) {
    console.error(
      "Error searching recipes:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  getAllRecipes,
  getOneRecipe,
  creatRecipe,
  updateRecipe,
  deleteOneRecipe,
  toggleLikeRecipe,
  toggleDislikeRecipe,
  getLikesForRecipe,
  getDislikesForRecipe,
  searchRecipes,
};
