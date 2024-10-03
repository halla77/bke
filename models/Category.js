const { Schema, model } = require("mongoose");

const categorySchema = new Schema({
  name: {
    type: String,
  },

  recipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
});

const Category = model("Category", categorySchema);
module.exports = Category;
