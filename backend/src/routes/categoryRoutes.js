const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { verifyAuth } = require("../middleware/auth");

router.get("/", categoryController.getCategories);
router.post("/", verifyAuth, categoryController.createCategory);
router.put("/:id", verifyAuth, categoryController.updateCategory);
router.delete("/:id", verifyAuth, categoryController.deleteCategory);
router.patch("/:id/toggle-active", verifyAuth, categoryController.toggleCategoryActive);
router.patch("/reorder", verifyAuth, categoryController.reorderCategories);

module.exports = router;
