//imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./database.js");
const notFoundHandler = require("./middleware/notFoundHandler");
const errorHandler = require("./middleware/errorHandler.js");
const usersRouter = require("./api/users/users.routes.js");
const recipeRouter = require("./api/recipe/recipe.Router.js");
const ingredientRouter = require("./api/ingredient/ingredient.Router.js");
const categorysRouter = require("./api/category/category.Router.js");
const passport = require("passport");
const path = require("path");
const {
  localStrategy,
  jwtStrategy,
  JwtStrategy,
} = require("./middleware/passport");
const commentRouter = require("./api/comment/comment.Router");

//init
const PORT = process.env.PORT || 10000;
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
passport.use("local", localStrategy);
passport.use("jwt", JwtStrategy);

// MongoDB connection
connectDB();

// Routes
app.use("/api/recipes", recipeRouter);
app.use("/api/ingredients", ingredientRouter);
app.use("/api/category", categorysRouter);
app.use("/api/users", usersRouter);
app.use("/api/comments", commentRouter);
app.use("/media", express.static(path.join(__dirname, "media")));

// Not Found Handling middleware

app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
