const express = require("express");
const {
  getAllCategory,
  getOneCategory,
  creatCategory,
  updateCategory,
  deleteOneCategory,
} = require("./category.Controller");
const categorysRouter = express.Router();

categorysRouter.get("/", getAllCategory);
categorysRouter.get("/:id", getOneCategory);
categorysRouter.post("/", creatCategory);
categorysRouter.put("/:id", updateCategory);
categorysRouter.delete("/:id", deleteOneCategory);

module.exports = categorysRouter;
