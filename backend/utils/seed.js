/**
 * Seed Script
 *
 * Populates the database with demo users and transactions for development.
 *
 * Usage:
 *   npm run seed
 *
 * WARNING: Clears all existing users and transactions before seeding.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const connectDB = require("../config/db");

const CATEGORIES = [
  "Salary", "Freelance", "Investment",
  "Rent", "Groceries", "Utilities",
  "Transport", "Healthcare", "Entertainment", "Miscellaneous",
];

const randomBetween = (min, max) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seed = async () => {
  await connectDB();

  console.log("🧹  Clearing existing data...");
  await User.deleteMany({});

  // Bypass the pre-find middleware for hard deletion during seeding
  await mongoose.connection.collection("transactions").deleteMany({});

  // ------------------------------------------------------------------
  // Create demo users
  // ------------------------------------------------------------------
  console.log("👤  Creating users...");

  const [admin, analyst, viewer] = await User.create([
    {
      name: "Aarav Mehta",
      email: "admin@financeapp.dev",
      password: "Admin@1234",
      role: "admin",
      status: "active",
    },
    {
      name: "Priya Sharma",
      email: "analyst@financeapp.dev",
      password: "Analyst@1234",
      role: "analyst",
      status: "active",
    },
    {
      name: "Rohan Verma",
      email: "viewer@financeapp.dev",
      password: "Viewer@1234",
      role: "viewer",
      status: "active",
    },
  ]);

  console.log(`   ✅ admin   → ${admin.email}`);
  console.log(`   ✅ analyst → ${analyst.email}`);
  console.log(`   ✅ viewer  → ${viewer.email}`);

  // ------------------------------------------------------------------
  // Create demo transactions (past 12 months)
  // ------------------------------------------------------------------
  console.log("💸  Creating transactions...");

  const now = new Date();
  const yearAgo = new Date();
  yearAgo.setFullYear(now.getFullYear() - 1);

  const transactions = [];
  const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment"];
  const EXPENSE_CATEGORIES = CATEGORIES.filter(
    (c) => !INCOME_CATEGORIES.includes(c)
  );

  for (let i = 0; i < 60; i++) {
    const isIncome = Math.random() > 0.55;
    transactions.push({
      amount: isIncome ? randomBetween(5000, 80000) : randomBetween(200, 15000),
      type: isIncome ? "income" : "expense",
      category: randomItem(isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES),
      date: randomDate(yearAgo, now),
      notes: `Auto-generated seed record #${i + 1}`,
      createdBy: randomItem([admin._id, analyst._id]),
    });
  }

  await mongoose.connection.collection("transactions").insertMany(transactions);
  console.log(`   ✅ ${transactions.length} transactions created`);

  console.log("\n✨  Seeding complete!\n");
  console.log("Demo credentials:");
  console.log("  Admin    → admin@financeapp.dev   / Admin@1234");
  console.log("  Analyst  → analyst@financeapp.dev / Analyst@1234");
  console.log("  Viewer   → viewer@financeapp.dev  / Viewer@1234");

  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});