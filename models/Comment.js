const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipe: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient querying of comments by recipe and creation date
commentSchema.index({ recipe: 1, createdAt: -1 });

const Comment = model("Comment", commentSchema);

module.exports = Comment;
