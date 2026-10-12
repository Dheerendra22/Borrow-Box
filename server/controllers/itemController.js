const mongoose = require("mongoose");
const Item = require("../models/Item");
const BorrowRequest = require("../models/BorrowRequest");
const asyncHandler = require("../utils/asyncHandler");

// ── Reusable ObjectId validator ───────────────────────────────────
// Call this at the top of any handler that uses req.params.id.
// Returns early with a 400 response if the id is not a valid MongoDB id.
const validateObjectId = (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error(`"${id}" is not a valid item ID`);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/items
// @access  Protected
// ─────────────────────────────────────────────────────────────────
const createItem = asyncHandler(async (req, res) => {
  const { title, description, category, condition, imageUrl, maxDays } =
    req.body;

  // title and category are required — everything else has defaults
  if (!title || !title.trim()) {
    res.status(400);
    throw new Error("Item title is required");
  }
  if (!category) {
    res.status(400);
    throw new Error("Category is required");
  }

  const item = await Item.create({
    owner: req.user._id,  // set from the protect middleware
    title: title.trim(),
    description,
    category,
    condition,
    imageUrl,
    maxDays,
  });

  res.status(201).json({
    success: true,
    message: "Item created successfully",
    data: item,
  });
});

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/items
// @access  Public
// Supports ?search= (title or description) and ?category=
// Always sorted newest first; owner's name is populated
// ─────────────────────────────────────────────────────────────────
const getItems = asyncHandler(async (req, res) => {
  const { search, category } = req.query;

  // Start with an empty filter object and build it up
  const filter = {};

  // If a search string was provided, look for it in title OR description
  // $regex with $options:"i" = case-insensitive matching
  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // If a category was provided, filter by exact category name
  if (category && category.trim()) {
    filter.category = category.trim();
  }

  const items = await Item.find(filter)
    .populate("owner", "name")   // replace owner ObjectId with { _id, name }
    .sort({ createdAt: -1 });    // newest first

  res.json({
    success: true,
    message: "Items fetched successfully",
    data: items,
  });
});

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/items/mine
// @access  Protected
// Returns only items belonging to the logged-in user
// ─────────────────────────────────────────────────────────────────
const getMyItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    message: "Your items fetched successfully",
    data: items,
  });
});

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/items/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────
const getItemById = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id, res);

  const item = await Item.findById(req.params.id).populate("owner", "name");

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  res.json({
    success: true,
    message: "Item fetched successfully",
    data: item,
  });
});

// ─────────────────────────────────────────────────────────────────
// @route   DELETE /api/items/:id
// @access  Protected, owner only
// Business rules: only the owner can delete; cannot delete if Borrowed
// ─────────────────────────────────────────────────────────────────
const deleteItem = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id, res);

  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  // .equals() is required to compare Mongoose ObjectIds — plain === won't work
  if (!item.owner.equals(req.user._id)) {
    res.status(403);
    throw new Error("You are not authorized to delete this item");
  }

  // Cannot delete an item that is currently out on loan
  if (item.status === "Borrowed") {
    res.status(400);
    throw new Error(
      "Cannot delete an item that is currently borrowed. Wait for it to be returned first."
    );
  }

  // Clean up: delete any Pending requests for this item so they
  // don't become orphaned records pointing to a deleted item.
  await BorrowRequest.deleteMany({ item: item._id, status: "Pending" });

  await item.deleteOne();

  res.json({
    success: true,
    message: "Item deleted successfully",
    data: null,
  });
});

module.exports = {
  createItem,
  getItems,
  getMyItems,
  getItemById,
  deleteItem,
};
