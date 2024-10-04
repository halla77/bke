const { Schema, model } = require("mongoose");

const recipeSchema = new Schema(
  {
    name: {
      type: String,
    },
    categorys: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    ingredients: [{ type: Schema.Types.ObjectId, ref: "Ingredient" }],
    recipeImage: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Recipe = model("Recipe", recipeSchema);
module.exports = Recipe;
