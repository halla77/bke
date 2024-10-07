const Comment = require("../../models/Comment");
const Recipe = require("../../models/Recipe");

// Get all comments for a specific recipe
exports.getCommentsForRecipe = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const comments = await Comment.find({
      recipe: recipeId,
      parentComment: null,
    })
      .sort("-createdAt")
      .populate("user", "username")
      .populate({
        path: "replies",
        populate: { path: "user", select: "username" },
      });

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

// Create a new comment
exports.createComment = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const newComment = new Comment({
      user: userId,
      recipe: recipeId,
      content,
    });

    await newComment.save();

    // Update the recipe's comments array
    await Recipe.findByIdAndUpdate(recipeId, {
      $push: { comments: newComment._id },
    });

    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

// Delete a comment
exports.deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);

    // Update the recipe's comments array
    await Recipe.findByIdAndUpdate(comment.recipe, {
      $pull: { comments: commentId },
    });

    // Also delete all replies to this comment
    await Comment.deleteMany({ parentComment: commentId });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Reply to a comment
exports.replyToComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Check if the parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    // Create the new reply
    const newReply = new Comment({
      user: userId,
      recipe: parentComment.recipe,
      content,
      parentComment: commentId,
    });

    // Save the new reply
    await newReply.save();

    // Add the reply to the parent comment's replies array
    await Comment.findByIdAndUpdate(commentId, {
      $push: { replies: newReply._id },
    });

    // Update the recipe's comments array
    await Recipe.findByIdAndUpdate(parentComment.recipe, {
      $push: { comments: newReply._id },
    });

    // Populate user information for the response
    await newReply.populate("user", "username");

    res.status(201).json(newReply);
  } catch (error) {
    console.error("Error in replyToComment:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid input", details: error.errors });
    }
    next(error);
  }
};
