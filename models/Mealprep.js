const mongoose = require("mongoose");
const { Schema } = mongoose;
const MealPlanSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalCalories: { type: Number, required: true },
    numberOfMeals: { type: Number, required: true },

    meals: [
      {
        recipe: { type: Schema.Types.ObjectId, ref: "Recipe" },
        day: { type: Number, required: true },
        mealNumber: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const MealPlan = mongoose.model("MealPlan", MealPlanSchema);
module.exports = MealPlan;
