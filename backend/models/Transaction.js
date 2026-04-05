const mongoose = require("mongoose");

/**
 * Transaction Schema
 *
 * Represents a single financial entry (income or expense).
 * Supports soft delete via `isDeleted` flag so records are
 * never permanently lost unless explicitly purged.
 */
const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: {
        values: ["income", "expense"],
        message: "Type must be income or expense",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [60, "Category cannot exceed 60 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Soft delete — records are never hard-deleted
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Always filter out soft-deleted records from default queries
transactionSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model("Transaction", transactionSchema);