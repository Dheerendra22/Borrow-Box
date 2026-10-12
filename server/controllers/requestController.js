const mongoose = require("mongoose");
const BorrowRequest = require("../models/BorrowRequest");
const Item = require("../models/Item");
const asyncHandler = require("../utils/asyncHandler");

// ── Reusable ObjectId validator ───────────────────────────────────
const validateObjectId = (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error(`"${id}" is not a valid ID`);
  }
};

// ── Helper: strip time from a Date so we compare calendar days only ──
// e.g. "2025-06-01T14:30:00Z" becomes "2025-06-01T00:00:00Z"
const toMidnightUTC = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/requests
// @access  Protected
// Body: { itemId, fromDate, dueDate, message? }
// ─────────────────────────────────────────────────────────────────
const createRequest = asyncHandler(async (req, res) => {
  const { itemId, fromDate, dueDate, message } = req.body;

  // ── 1. Validate itemId ────────────────────────────────────────
  if (!itemId) {
    res.status(400);
    throw new Error("itemId is required");
  }
  validateObjectId(itemId, res);

  // ── 2. Validate dates are present ────────────────────────────
  if (!fromDate || !dueDate) {
    res.status(400);
    throw new Error("fromDate and dueDate are required");
  }

  const from = toMidnightUTC(fromDate);
  const due = toMidnightUTC(dueDate);
  const today = toMidnightUTC(new Date());

  // fromDate must not be in the past
  if (from < today) {
    res.status(400);
    throw new Error("fromDate cannot be in the past");
  }

  // dueDate must be strictly after fromDate
  if (due <= from) {
    res.status(400);
    throw new Error("dueDate must be after fromDate");
  }

  // ── 3. Fetch the item ─────────────────────────────────────────
  const item = await Item.findById(itemId);
  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  // ── 4. Item must be Available ─────────────────────────────────
  if (item.status !== "Available") {
    res.status(400);
    throw new Error(
      "This item is currently borrowed and cannot be requested right now"
    );
  }

  // ── 5. Borrower cannot be the owner ──────────────────────────
  if (item.owner.equals(req.user._id)) {
    res.status(400);
    throw new Error("You cannot borrow your own item");
  }

  // ── 6. No duplicate Pending request ──────────────────────────
  const existingRequest = await BorrowRequest.findOne({
    item: itemId,
    borrower: req.user._id,
    status: "Pending",
  });
  if (existingRequest) {
    res.status(400);
    throw new Error(
      "You already have a pending request for this item. Wait for the owner to respond."
    );
  }

  // ── 7. dueDate must be within item.maxDays of fromDate ───────
  // Calculate the number of days between fromDate and dueDate
  const diffMs = due - from;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // ms → days
  if (diffDays > item.maxDays) {
    res.status(400);
    throw new Error(
      `Borrow period cannot exceed ${item.maxDays} days for this item`
    );
  }

  // ── 8. All checks passed — create the request ─────────────────
  // owner is copied from the item so incoming-request queries are fast
  const request = await BorrowRequest.create({
    item: itemId,
    borrower: req.user._id,
    owner: item.owner,
    fromDate: from,
    dueDate: due,
    message: message || "",
  });

  res.status(201).json({
    success: true,
    message: "Borrow request sent successfully",
    data: request,
  });
});

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/requests/mine
// @access  Protected
// Requests I made as a borrower, newest first
// ─────────────────────────────────────────────────────────────────
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await BorrowRequest.find({ borrower: req.user._id })
    .populate("item", "title imageUrl category status") // only needed fields
    .populate("owner", "name")                          // who owns the item
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    message: "Your borrow requests fetched successfully",
    data: requests,
  });
});

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/requests/incoming
// @access  Protected
// Requests from others on my items, newest first
// ─────────────────────────────────────────────────────────────────
const getIncomingRequests = asyncHandler(async (req, res) => {
  const requests = await BorrowRequest.find({ owner: req.user._id })
    .populate("item", "title imageUrl category status")
    .populate("borrower", "name email")  // owner needs to know who's asking
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    message: "Incoming requests fetched successfully",
    data: requests,
  });
});

// ─────────────────────────────────────────────────────────────────
// @route   PUT /api/requests/:id/approve
// @access  Protected, owner only
// Business rules:
//   - Request must be Pending
//   - Item must still be Available (safety check)
//   - Approve this request, mark item Borrowed
//   - Auto-reject ALL other Pending requests for the same item
// ─────────────────────────────────────────────────────────────────
const approveRequest = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id, res);

  const request = await BorrowRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Borrow request not found");
  }

  // Only the item owner may approve
  if (!request.owner.equals(req.user._id)) {
    res.status(403);
    throw new Error("You are not authorized to approve this request");
  }

  // Request must still be Pending
  if (request.status !== "Pending") {
    res.status(400);
    throw new Error(
      `Cannot approve a request that is already ${request.status}`
    );
  }

  // Safety: re-check the item is still Available
  const item = await Item.findById(request.item);
  if (!item) {
    res.status(404);
    throw new Error("The item linked to this request no longer exists");
  }
  if (item.status !== "Available") {
    res.status(400);
    throw new Error("This item is no longer available");
  }

  // ── Apply all changes ─────────────────────────────────────────
  // 1. Approve this request
  request.status = "Approved";
  await request.save();

  // 2. Mark the item as Borrowed
  item.status = "Borrowed";
  await item.save();

  // 3. Auto-reject every other Pending request for the same item
  //    (updateMany hits all matching documents in one query)
  await BorrowRequest.updateMany(
    {
      item: item._id,
      status: "Pending",
      _id: { $ne: request._id }, // exclude the one we just approved
    },
    { status: "Rejected" }
  );

  res.json({
    success: true,
    message: "Request approved. All other pending requests have been rejected.",
    data: request,
  });
});

// ─────────────────────────────────────────────────────────────────
// @route   PUT /api/requests/:id/reject
// @access  Protected, owner only
// ─────────────────────────────────────────────────────────────────
const rejectRequest = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id, res);

  const request = await BorrowRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Borrow request not found");
  }

  if (!request.owner.equals(req.user._id)) {
    res.status(403);
    throw new Error("You are not authorized to reject this request");
  }

  if (request.status !== "Pending") {
    res.status(400);
    throw new Error(
      `Cannot reject a request that is already ${request.status}`
    );
  }

  request.status = "Rejected";
  await request.save();

  res.json({
    success: true,
    message: "Request rejected",
    data: request,
  });
});

// ─────────────────────────────────────────────────────────────────
// @route   PUT /api/requests/:id/return
// @access  Protected, owner only
// Business rules:
//   - Request must be Approved (not Pending or Returned)
//   - Mark request Returned, item back to Available
// ─────────────────────────────────────────────────────────────────
const returnRequest = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id, res);

  const request = await BorrowRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Borrow request not found");
  }

  if (!request.owner.equals(req.user._id)) {
    res.status(403);
    throw new Error("You are not authorized to mark this request as returned");
  }

  // Only Approved requests can be marked Returned
  if (request.status !== "Approved") {
    res.status(400);
    throw new Error(
      `Cannot mark as returned — request status is "${request.status}", not "Approved"`
    );
  }

  // Mark the request as returned
  request.status = "Returned";
  await request.save();

  // Free the item so it can be borrowed again
  await Item.findByIdAndUpdate(request.item, { status: "Available" });

  res.json({
    success: true,
    message: "Item marked as returned. It is now available again.",
    data: request,
  });
});

module.exports = {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  approveRequest,
  rejectRequest,
  returnRequest,
};
