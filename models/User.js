const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    recipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    favorites: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    profileImage: { type: String, default: "" },
    bio: { type: String, default: "" },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
