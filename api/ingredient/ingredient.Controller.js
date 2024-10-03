const Recipe = require("../../models/Recipe");
const Ingredient = require("../../models/Ingredient");

const getAllIngredient = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find();
    return res.status(200).json(ingredients);
  } catch (error) {
    next(error);
  }
};

const getOneIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient)
      return res.status(404).json({ message: "Ingredient not found" });
    return res.status(200).json(ingredient);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid ingredient ID" });
    }
    next(error);
  }
};

const creatIngredient = async (req, res, next) => {
  try {
    const newIngredient = await Ingredient.create(req.body);
    const recipes = req.body.recipes;

    const updateRicpes = await Recipe.updateMany(
      { _id: recipes },
      { $push: { ingredients: newIngredient._id } }
    );

    return res.status(201).json(newIngredient);
  } catch (error) {
    next(error);
  }
};

const updateIngredient = async (req, res, next) => {
  try {
    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedIngredient)
      return res.status(404).json({ message: "Ingredient not found" });

    const recipes = req.body.recipes;

    await Recipe.updateMany(
      { _id: { $in: recipes } },
      { $push: { ingredients: updatedIngredient._id } }
    );

    return res.status(200).json(updatedIngredient);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid ingredient ID" });
    }
    next(error);
  }
};
const deleteOneIngredient = async (req, res, next) => {
  try {
    const deletedIngredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!deletedIngredient)
      return res.status(404).json({ message: "Ingredient not found" });

    const recipes = deletedIngredient.recipes;

    await Recipe.updateMany(
      { _id: { $in: recipes } },
      { $pull: { ingredients: deletedIngredient._id } }
    );

    return res.status(200).json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid ingredient ID" });
    }
    next(error);
  }
};

module.exports = {
  getAllIngredient,
  getOneIngredient,
  creatIngredient,
  updateIngredient,
  deleteOneIngredient,
};
