const express = require("express");
const passport = require("passport");
const {
  getAllRecipes,
  getOneRecipe,
  creatRecipe,
  updateRecipe,
  deleteOneRecipe,
  toggleLikeRecipe,
  toggleDislikeRecipe,
  getLikesForRecipe,
  getDislikesForRecipe,
} = require("./recipe.Controller");
const upload = require("../../middleware/multer");
const recipeRouter = express.Router();

recipeRouter.get("/", getAllRecipes);
recipeRouter.get("/:id", getOneRecipe);
recipeRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single("recipeImage"),
  creatRecipe
);
recipeRouter.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  upload.single("recipeImage"),
  updateRecipe
);
recipeRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteOneRecipe
);
recipeRouter.post(
  "/:id/like",
  passport.authenticate("jwt", { session: false }),
  toggleLikeRecipe
);
recipeRouter.post(
  "/:id/dislike",
  passport.authenticate("jwt", { session: false }),
  toggleDislikeRecipe
);
recipeRouter.get("/:id/likes", getLikesForRecipe);
recipeRouter.get("/:id/dislikes", getDislikesForRecipe);
module.exports = recipeRouter;
