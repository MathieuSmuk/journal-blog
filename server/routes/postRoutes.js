const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyDrafts,
} = require("../controllers/postController");

router.get("/", getAllPosts);

router.get("/my-drafts", authenticateToken, getMyDrafts);

router.get("/:id", optionalAuth, getPostById);

router.post("/", authenticateToken, createPost);

router.put("/:id", authenticateToken, updatePost);

router.delete("/:id", authenticateToken, deletePost);

module.exports = router;
