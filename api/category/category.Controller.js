const Recipe = require("../../models/Recipe");
const Category = require("../../models/Category");

const getAllCategory = async (req, res, next) => {
  try {
    const categorys = await Category.find();
    return res.status(200).json(categorys);
  } catch (error) {
    next(error);
  }
};

const getOneCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    return res.status(200).json(category);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    next(error);
  }
};

const creatCategory = async (req, res, next) => {
  try {
    const newCategory = await Category.create(req.body);
    const recipes = req.body.recipes;

    await Recipe.updateMany(
      { _id: { $in: recipes } },
      { $push: { categorys: newCategory._id } }
    );

    return res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCategory)
      return res.status(404).json({ message: "Category not found" });

    const recipes = req.body.recipes;

    await Recipe.updateMany(
      { _id: { $in: recipes } },
      { $push: { categorys: updatedCategory._id } }
    );

    return res.status(200).json(updatedCategory);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    next(error);
  }
};

const deleteOneCategory = async (req, res, next) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory)
      return res.status(404).json({ message: "Category not found" });

    const recipes = deletedCategory.recipes;

    await Recipe.updateMany(
      { _id: { $in: recipes } },
      { $pull: { categorys: deletedCategory._id } }
    );

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    next(error);
  }
};

module.exports = {
  getAllCategory,
  getOneCategory,
  creatCategory,
  updateCategory,
  deleteOneCategory,
};
