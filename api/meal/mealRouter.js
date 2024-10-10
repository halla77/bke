const express = require("express");
const mealRouter = express.Router();
const {
  generateMealPlan,
  getMealPlan,
  updateMealPlan,
  deleteMealPlan,
} = require("./mealcontroler");
const passport = require("passport");

const authenticate = passport.authenticate("jwt", { session: false });

// Generate a new meal plan
mealRouter.post("/generate", authenticate, generateMealPlan);

// Get the user's current meal plan
mealRouter.get("/", authenticate, getMealPlan);

// Update an existing meal plan
mealRouter.put("/:id", authenticate, updateMealPlan);

// Delete a meal plan
mealRouter.delete("/:id", authenticate, deleteMealPlan);

module.exports = mealRouter;
