const express = require("express");
const router = express.Router();

const {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  approveRequest,
  rejectRequest,
  returnRequest,
} = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");

// All request routes are protected — you must be logged in

// ⚠️  ORDER MATTERS: named routes (/mine, /incoming) must come
// before parameterised routes (/:id/*) for the same reason as items/mine.

// GET /api/requests/mine      — requests I sent as borrower
router.get("/mine", protect, getMyRequests);

// GET /api/requests/incoming  — requests on items I own
router.get("/incoming", protect, getIncomingRequests);

// POST /api/requests          — send a new borrow request
router.post("/", protect, createRequest);

// PUT /api/requests/:id/approve  — owner approves
router.put("/:id/approve", protect, approveRequest);

// PUT /api/requests/:id/reject   — owner rejects
router.put("/:id/reject", protect, rejectRequest);

// PUT /api/requests/:id/return   — owner marks returned
router.put("/:id/return", protect, returnRequest);

module.exports = router;
