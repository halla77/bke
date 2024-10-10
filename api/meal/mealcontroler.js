const MealPlan = require("../../models/Mealprep");
const Recipe = require("../../models/Recipe");

exports.generateMealPlan = async (req, res, next) => {
  try {
    const { totalCalories, numberOfMeals } = req.body;
    const userId = req.user._id;

    // Calculate calories per meal
    const caloriesPerMeal = Math.round(totalCalories / numberOfMeals);

    // Generate meal plan for 7 days
    const meals = [];
    for (let day = 1; day <= 7; day++) {
      for (let mealNumber = 1; mealNumber <= numberOfMeals; mealNumber++) {
        // Find a suitable recipe
        const recipe = await Recipe.findOne({
          calories: {
            $gte: caloriesPerMeal * 0.9,
            $lte: caloriesPerMeal * 1.1,
          },
        })
          .sort({ calories: 1 })
          .limit(1);

        if (!recipe) {
          return res.status(400).json({
            message: `No suitable recipe found for meal ${mealNumber} on day ${day}`,
          });
        }

        meals.push({
          recipe: recipe._id,
          day: day,
          mealNumber: mealNumber,
        });
      }
    }

    // Create and save the meal plan
    const mealPlan = new MealPlan({
      user: userId,
      totalCalories: totalCalories,
      numberOfMeals: numberOfMeals,
      meals: meals,
    });

    await mealPlan.save();

    // Populate the recipes in the response
    const populatedMealPlan = await MealPlan.findById(mealPlan._id).populate(
      "meals.recipe"
    );

    res.status(201).json(populatedMealPlan);
  } catch (error) {
    console.error("Error generating meal plan:", error);
    next(error);
  }
};

exports.getMealPlan = async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.findOne({ user: req.user._id }).populate(
      "meals.recipe"
    );
    if (!mealPlan) {
      return res.status(404).json({ message: "No meal plan found" });
    }
    res.json(mealPlan);
  } catch (error) {
    next(error);
  }
};

exports.updateMealPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { totalCalories, numberOfMeals, meals } = req.body;
    const userId = req.user._id;

    // Find and update the meal plan
    const updatedMealPlan = await MealPlan.findOneAndUpdate(
      { _id: id, user: userId },
      {
        totalCalories,
        numberOfMeals,
        meals,
      },
      { new: true, runValidators: true }
    ).populate("meals.recipe");

    if (!updatedMealPlan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    res.json(updatedMealPlan);
  } catch (error) {
    console.error("Error updating meal plan:", error);
    res
      .status(500)
      .json({ message: "Error updating meal plan", error: error.message });
  }
};

exports.deleteMealPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    await MealPlan.findByIdAndDelete(id);
    res.json({ message: "Meal plan deleted successfully" });
  } catch (error) {
    next(error);
  }
};
