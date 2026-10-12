const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    // The user who listed this item
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Only these categories are allowed
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Electronics",
          "Books",
          "Lab Equipment",
          "Sports",
          "Stationery",
          "Clothing",
          "Other",
        ],
        message: "{VALUE} is not a valid category",
      },
    },

    // Physical condition of the item
    condition: {
      type: String,
      enum: {
        values: ["New", "Good", "Fair"],
        message: "{VALUE} is not a valid condition",
      },
      default: "Good",
    },

    // URL to an image of the item (stored as plain text, not a file upload)
    // Defaults to a neutral placeholder so the UI always has something to show
    imageUrl: {
      type: String,
      default:
        "https://placehold.co/400x300?text=No+Image",
    },

    // Available = can be requested; Borrowed = currently out on loan
    status: {
      type: String,
      enum: ["Available", "Borrowed"],
      default: "Available",
    },

    // Maximum number of days this item can be borrowed
    maxDays: {
      type: Number,
      default: 7,
      min: [1, "maxDays must be at least 1"],
      max: [30, "maxDays cannot exceed 30"],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Item", itemSchema);
