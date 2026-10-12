/**
 * seed.js — BorrowBox demo data seeder
 *
 * Wipes Users, Items, and BorrowRequests, then inserts fresh demo data.
 * Run with:  npm run seed  (from the /server directory)
 *
 * Demo logins after seeding:
 *   demo1@borrowbox.com / password123
 *   demo2@borrowbox.com / password123
 *   demo3@borrowbox.com / password123
 */

require("dotenv").config(); // load MONGO_URI from .env

const mongoose = require("mongoose");
const User = require("./models/User");
const Item = require("./models/Item");
const BorrowRequest = require("./models/BorrowRequest");

// ── Helpers ───────────────────────────────────────────────────────
// Returns a Date that is `n` days from today (positive = future, negative = past)
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// ── Demo Users ────────────────────────────────────────────────────
const usersData = [
  { name: "Aanya Sharma",  email: "demo1@borrowbox.com", password: "password123" },
  { name: "Rohan Mehta",   email: "demo2@borrowbox.com", password: "password123" },
  { name: "Priya Nair",    email: "demo3@borrowbox.com", password: "password123" },
];

// ── Main seeder ───────────────────────────────────────────────────
const seed = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 2. Wipe all collections (order matters: requests → items → users)
    await BorrowRequest.deleteMany({});
    await Item.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️  Cleared BorrowRequests, Items, Users");

    // 3. Create users one-by-one so the pre-save hook hashes the passwords
    const [demo1, demo2, demo3] = await Promise.all(
      usersData.map((u) => User.create(u))
    );
    console.log("👤 Created 3 demo users");

    // ── 12 Items spread across all 7 categories and all 3 owners ──
    const itemsData = [
      // ── Electronics (demo1, demo2) ────────────────────────────
      {
        owner: demo1._id,
        title: "Casio FX-991EX Scientific Calculator",
        description:
          "Barely used. Perfect for maths, physics, and engineering exams. All functions working.",
        category: "Electronics",
        condition: "Good",
        imageUrl:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop",
        maxDays: 5,
      },
      {
        owner: demo2._id,
        title: "Canon EOS 200D DSLR Camera",
        description:
          "Entry-level DSLR with 18-55mm kit lens. Great for project presentations and college events.",
        category: "Electronics",
        condition: "Good",
        imageUrl:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
        maxDays: 3,
      },

      // ── Books (demo1, demo3) ───────────────────────────────────
      {
        owner: demo1._id,
        title: "Organic Chemistry by Morrison & Boyd",
        description:
          "6th edition. Has some pencil annotations in chapters 10-12, otherwise clean.",
        category: "Books",
        condition: "Fair",
        imageUrl:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop",
        maxDays: 14,
      },
      {
        owner: demo3._id,
        title: "Introduction to Algorithms (CLRS) 3rd Edition",
        description:
          "The bible of DSA. No marks, no torn pages. Ideal for placements and competitive coding prep.",
        category: "Books",
        condition: "Good",
        imageUrl:
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop",
        maxDays: 10,
      },

      // ── Lab Equipment (demo2, demo1) ───────────────────────────
      {
        owner: demo2._id,
        title: "Lab Coat — Size M",
        description:
          "White cotton lab coat. Washed and ironed. Fits chest up to 40 inches.",
        category: "Lab Equipment",
        condition: "Good",
        imageUrl:
          "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=400&h=300&fit=crop",
        maxDays: 7,
      },
      {
        owner: demo1._id,
        title: "Compound Microscope (40x–1000x)",
        description:
          "Fully functional binocular microscope with 4 objective lenses. Carry case included.",
        category: "Lab Equipment",
        condition: "Good",
        imageUrl:
          "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=300&fit=crop",
        maxDays: 3,
      },

      // ── Sports (demo3, demo2) ──────────────────────────────────
      {
        owner: demo3._id,
        title: "Yonex Badminton Racket (GR 303)",
        description:
          "Aluminium shaft, strung and ready to play. Grip in good condition.",
        category: "Sports",
        condition: "Good",
        imageUrl:
          "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop",
        maxDays: 7,
      },
      {
        owner: demo2._id,
        title: "SG Cricket Bat (English Willow)",
        description:
          "Full-size cricket bat, oiled and match-ready. Weight approx. 1.2 kg.",
        category: "Sports",
        condition: "Fair",
        imageUrl:
          "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop",
        maxDays: 5,
      },

      // ── Stationery (demo1, demo3) ──────────────────────────────
      {
        owner: demo1._id,
        title: "Staedtler Geometry Set",
        description:
          "Complete geometry box with compass, protractor, divider, set squares. All pieces present.",
        category: "Stationery",
        condition: "New",
        imageUrl:
          "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop",
        maxDays: 7,
      },
      {
        owner: demo3._id,
        title: "Copic Sketch Markers (Set of 36)",
        description:
          "Professional alcohol-based markers, ideal for design and architecture students. Fully inked.",
        category: "Stationery",
        condition: "Good",
        imageUrl:
          "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
        maxDays: 7,
      },

      // ── Clothing (demo2) ──────────────────────────────────────
      {
        owner: demo2._id,
        title: "Formal Black Blazer — Size 40",
        description:
          "Slim-fit blazer, dry-cleaned. Perfect for fests, interviews, and seminars.",
        category: "Clothing",
        condition: "Good",
        imageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        maxDays: 3,
      },

      // ── Other (demo3) ─────────────────────────────────────────
      {
        owner: demo3._id,
        title: "Anker PowerCore 20000 mAh Power Bank",
        description:
          "Fast-charge compatible, charges 2 devices simultaneously. Cable included.",
        category: "Other",
        condition: "Good",
        imageUrl:
          "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop",
        maxDays: 5,
      },
    ];

    const items = await Item.insertMany(itemsData);
    console.log(`📦 Created ${items.length} items`);

    // Give items readable aliases for the request section
    const [
      calculator,   // demo1's
      camera,       // demo2's
      orgChem,      // demo1's
      clrs,         // demo3's
      labCoat,      // demo2's
      microscope,   // demo1's
      badminton,    // demo3's
      cricketBat,   // demo2's
      geometrySet,  // demo1's
      markers,      // demo3's
      blazer,       // demo2's
      powerBank,    // demo3's
    ] = items;

    // ── 3 Sample BorrowRequests in different statuses ─────────────
    //
    //  Request A: demo2 requests demo1's calculator → PENDING
    //  Request B: demo3 requests demo2's lab coat   → APPROVED  (item = Borrowed)
    //  Request C: demo1 requests demo3's CLRS book  → RETURNED  (item = Available)

    // Request A — Pending
    await BorrowRequest.create({
      item: calculator._id,
      borrower: demo2._id,
      owner: demo1._id,
      fromDate: daysFromNow(3),   // 3 days from now
      dueDate: daysFromNow(6),    // 6 days from now (3-day borrow)
      message: "Need it for my physics end-sem next week!",
      status: "Pending",
    });

    // Request B — Approved → mark the lab coat as Borrowed
    await BorrowRequest.create({
      item: labCoat._id,
      borrower: demo3._id,
      owner: demo2._id,
      fromDate: daysFromNow(1),
      dueDate: daysFromNow(4),
      message: "Need for my chemistry lab practical on Thursday.",
      status: "Approved",
    });
    // Keep item in sync with request status
    await Item.findByIdAndUpdate(labCoat._id, { status: "Borrowed" });

    // Request C — Returned (past dates, cycle completed)
    await BorrowRequest.create({
      item: clrs._id,
      borrower: demo1._id,
      owner: demo3._id,
      fromDate: daysFromNow(-10), // started 10 days ago
      dueDate: daysFromNow(-5),   // ended 5 days ago
      message: "Preparing for campus placements. Will return on time!",
      status: "Returned",
    });
    // Item is already Available (default), no update needed

    console.log("📬 Created 3 sample borrow requests");
    console.log("\n✨ Seeding complete! Demo accounts:");
    console.log("   demo1@borrowbox.com / password123  (Aanya Sharma)");
    console.log("   demo2@borrowbox.com / password123  (Rohan Mehta)");
    console.log("   demo3@borrowbox.com / password123  (Priya Nair)");
    console.log("\n   Lab Coat is currently Borrowed (demo3 borrowed from demo2).");
    console.log(
      "   Calculator has a Pending request (demo2 waiting on demo1).\n"
    );

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seed();
