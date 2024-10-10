const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log({ error: error });
  }
};

const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword, gender } = req.body;
    console.log("Received data:", req.body); // Log the received data
    // Check if all required fields are provide
    if (!username || !email || !password || !confirmPassword || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      return res.status(500).json({ message: "Error hashing password" });
    }

    // Set default profile image based on gender
    let defaultProfileImage;
    if (gender === "male") {
      defaultProfileImage = "./media/chef_4247811.png";
    } else if (gender === "female") {
      defaultProfileImage = "./media/chef_4124569.png";
    } else {
      defaultProfileImage = "./media/chef_4247811.png";
    }

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      gender,
      profileImage: defaultProfileImage,
    });

    await user.save();

    // Generate token for the new user
    const token = generateToken(user);

    res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
};

exports.signin = async (req, res, next) => {
  try {
    const token = generateToken(req.user);
    return res.status(201).json({ token: token });
  } catch (err) {
    // res.status(500).json("Server Error");
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "recipes",
        populate: [
          { path: "ingredients", select: "name" },
          { path: "category", select: "name" },
        ],
      })
      .populate("favorites")
      .populate("followers", "username email profileImage")
      .populate("following", "username email profileImage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("recipes")
      .populate("followers", "username email profileImage")
      .populate("following", "username email profileImage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({ message: "Error retrieving user profile", error: error.message });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { username } = req.query;
    let query = {};

    if (username) {
      query.username = { $regex: username, $options: "i" }; // Case-insensitive search
    }

    const users = await User.find(query)
      .select("username email profileImage")
      .limit(10); // Limit the number of results

    res.status(200).json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res
      .status(500)
      .json({ message: "Error searching users", error: error.message });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    console.log("Received file:", req.file);
    console.log("Received body:", req.body);

    const userId = req.user._id; // Get the user ID from the authenticated user

    const { username, email, bio, gender } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Handle profile image upload
    if (req.file) {
      user.profileImage = req.file.path;
    }
    // Handle username update
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      user.username = username;
    }

    // Handle email update
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    // Update other fields
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;

    await user.save();

    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("recipes");
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(userToFollow._id)) {
      return res
        .status(400)
        .json({ message: "You are already following this user" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $push: { following: userToFollow._id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: currentUser._id },
    });

    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    console.error("Follow user error:", error);
    res
      .status(500)
      .json({ message: "Error following user", error: error.message });
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: userToUnfollow._id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: currentUser._id },
    });

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res
      .status(500)
      .json({ message: "Error unfollowing user", error: error.message });
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "username email"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.followers);
  } catch (error) {
    console.error("Get followers error:", error);
    res
      .status(500)
      .json({ message: "Error getting followers", error: error.message });
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "username email"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.following);
  } catch (error) {
    console.error("Get following error:", error);
    res
      .status(500)
      .json({ message: "Error getting following", error: error.message });
  }
};

// Get user's favorite recipes
exports.getFavoriteRecipes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.favorites);
  } catch (error) {
    console.error("Get favorite recipes error:", error);
    res.status(500).json({
      message: "Error retrieving favorite recipes",
      error: error.message,
    });
  }
};

// Add a recipe to favorites
exports.addToFavorites = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id;

    // Log the incoming data
    console.log("Adding to favorites:", { userId, recipeId });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the recipe is already in favorites
    if (user.favorites.includes(recipeId)) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    // Add the recipe to favorites
    user.favorites.push(recipeId);
    await user.save();

    // Log the updated user
    console.log("Updated user:", user);

    res.status(200).json({
      message: "Recipe added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    next(error);
  }
};

// Remove a recipe from favorites
exports.removeFromFavorites = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: recipeId } },
      { new: true }
    ).populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Recipe removed from favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    res.status(500).json({
      message: "Error removing recipe from favorites",
      error: error.message,
    });
  }
};

// Get user's meal prep recipes
exports.getMealPrepRecipes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("mealprep");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.mealprep);
  } catch (error) {
    console.error("Get meal prep recipes error:", error);
    res.status(500).json({
      message: "Error retrieving meal prep recipes",
      error: error.message,
    });
  }
};

// Add a recipe to meal prep
exports.addToMealPrep = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id;

    console.log("Adding to meal prep:", { userId, recipeId });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if recipeId is valid
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    if (user.mealprep.includes(recipeId)) {
      return res.status(400).json({ message: "Recipe already in meal prep" });
    }

    user.mealprep.push(recipeId);
    await user.save();

    console.log("Updated user:", user);

    res.status(200).json({
      message: "Recipe added to meal prep",
      mealprep: user.mealprep,
    });
  } catch (error) {
    console.error("Error adding to meal prep:", error);
    next(error);
  }
};

// Remove a recipe from meal prep
exports.removeFromMealPrep = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { mealprep: recipeId } },
      { new: true }
    ).populate("mealprep");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Recipe removed from meal prep",
      mealprep: user.mealprep,
    });
  } catch (error) {
    console.error("Remove from meal prep error:", error);
    res.status(500).json({
      message: "Error removing recipe from meal prep",
      error: error.message,
    });
  }
};
