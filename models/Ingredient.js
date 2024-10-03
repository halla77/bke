const { Schema, model } = require("mongoose");

const ingredientSchema = new Schema({
  name: {
    type: String,
  },

  recipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
});

const Ingredient = model("Ingredient", ingredientSchema);
module.exports = Ingredient;
