const express = require("express");
const router = express.Router();
const subcategoryController = require("../controllers/subcategoryController");
const { verifyAuth } = require("../middleware/auth");

router.get("/", subcategoryController.getSubcategories);
router.post("/", verifyAuth, subcategoryController.createSubcategory);
router.put("/:id", verifyAuth, subcategoryController.updateSubcategory);
router.delete("/:id", verifyAuth, subcategoryController.deleteSubcategory);
router.patch("/:id/toggle-active", verifyAuth, subcategoryController.toggleSubcategoryActive);
router.patch("/reorder", verifyAuth, subcategoryController.reorderSubcategories);

module.exports = router;
