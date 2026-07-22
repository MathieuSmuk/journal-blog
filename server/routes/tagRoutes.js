const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  getTags,
  createTag,
  updateTag,
} = require("../controllers/tagController");

router.get("/", getTags);

router.post("/", authenticateToken, createTag);

router.put("/:id", authenticateToken, updateTag);

module.exports = router;
