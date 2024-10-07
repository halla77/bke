const mongoose = require("mongoose");
const { Schema } = mongoose;

const RecipeSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: [{ type: Schema.Types.ObjectId, ref: "Ingredient" }],
    instructions: [{ type: String, required: true }],
    timeToCook: { type: Number, required: true }, // Time in minutes
    calories: { type: Number, required: true },
    category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    recipeImage: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);
