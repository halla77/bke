const express = require("express");
const passport = require("passport");
const {
  getCommentsForRecipe,
  createComment,
  deleteComment,
  replyToComment,
} = require("./comment.Controller");

const commentRouter = express.Router();

// Get all comments for a specific recipe
commentRouter.get("/recipe/:recipeId", getCommentsForRecipe);

// Create a new comment
commentRouter.post(
  "/recipe/:recipeId",
  passport.authenticate("jwt", { session: false }),
  createComment
);

// Delete a comment
commentRouter.delete(
  "/:commentId",
  passport.authenticate("jwt", { session: false }),
  deleteComment
);

// Reply to a comment
commentRouter.post(
  "/:commentId/reply",
  passport.authenticate("jwt", { session: false }),
  replyToComment
);

module.exports = commentRouter;
