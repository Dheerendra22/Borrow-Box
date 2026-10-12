const mongoose = require("mongoose");

const borrowRequestSchema = new mongoose.Schema(
  {
    // The item being requested
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    // The user who is asking to borrow
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The user who owns the item (copied from item.owner at request time
    // so incoming-request queries don't need an extra join through Item)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The dates the borrower wants the item
    fromDate: {
      type: Date,
      required: [true, "fromDate is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "dueDate is required"],
    },

    // Optional message from the borrower to the owner
    message: {
      type: String,
      trim: true,
      maxlength: [200, "Message cannot exceed 200 characters"],
      default: "",
    },

    // Lifecycle of a request:
    //   Pending  → Owner approves or rejects
    //   Approved → Owner marks Returned when item is back
    //   Rejected → Terminal state
    //   Returned → Terminal state
    status: {
      type: String,
      enum: {
        values: ["Pending", "Approved", "Rejected", "Returned"],
        message: "{VALUE} is not a valid request status",
      },
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BorrowRequest", borrowRequestSchema);
