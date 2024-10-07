const express = require("express");
const usersRouter = express.Router();
const {
  signup,
  signin,
  getMe,
  getProfile,
  getAllUsers,
  updateUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFavoriteRecipes,
  addToFavorites,
  removeFromFavorites,
} = require("./users.controllers");
const passport = require("passport");
const upload = require("../../middleware/multer");

const authenticate = passport.authenticate("jwt", { session: false });

// Authentication routes
usersRouter.post("/signup", signup);
usersRouter.post(
  "/signin",
  passport.authenticate("local", { session: false }),
  signin
);

// User routes
usersRouter.get("/me", authenticate, getMe);
usersRouter.get("/profile/:id", getProfile);
usersRouter.get("/all", authenticate, getAllUsers);
usersRouter.put(
  "/update",
  authenticate,
  upload.single("profileImage"),
  updateUser
);

// Follow routes
usersRouter.post("/:id/follow", authenticate, followUser);
usersRouter.post("/:id/unfollow", authenticate, unfollowUser);
usersRouter.get("/:id/followers", getFollowers);
usersRouter.get("/:id/following", getFollowing);

// Favorite recipes routes
usersRouter.get("/favorites", authenticate, getFavoriteRecipes);
usersRouter.post("/favorites/:recipeId", authenticate, addToFavorites);
usersRouter.delete("/favorites/:recipeId", authenticate, removeFromFavorites);

// Search route
usersRouter.get("/search", getAllUsers); // Remove authenticate middleware

module.exports = usersRouter;
