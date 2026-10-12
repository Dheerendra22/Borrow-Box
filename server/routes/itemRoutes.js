const express = require("express");
const router = express.Router();

const {
  createItem,
  getItems,
  getMyItems,
  getItemById,
  deleteItem,
} = require("../controllers/itemController");
const { protect } = require("../middleware/authMiddleware");

// ⚠️  ORDER MATTERS: /mine must come before /:id
// If /:id came first, Express would treat the string "mine" as an id
// and try to look up an item with id="mine", which would fail.

// GET /api/items/mine — my own items (protected)
router.get("/mine", protect, getMyItems);

// GET /api/items — browse all items, public, supports ?search= ?category=
router.get("/", getItems);

// POST /api/items — create a new listing (protected)
router.post("/", protect, createItem);

// GET /api/items/:id — single item detail, public
router.get("/:id", getItemById);

// DELETE /api/items/:id — delete own item (protected, owner only)
router.delete("/:id", protect, deleteItem);

module.exports = router;
