import { db } from "@workspace/db";
import { luckyRoyalRoomsTable, luckyRoyalEntriesTable } from "@workspace/db/schema";

function hoursFromNow(h: number) {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d;
}

const rooms = [
  {
    title: "Premium DSA Interview Cheatsheet",
    description: "200 solved LeetCode problems, time complexity analysis, and patterns explained. Valued at 200 credits. One lucky winner takes it all.",
    creatorName: "Rahul Gupta",
    creatorAvatar: "https://i.pravatar.cc/150?img=12",
    rewardTitle: "DSA Cheatsheet — 200 Problems Solved",
    rewardImage: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop",
    rewardType: "item",
    entryCredits: 15,
    maxParticipants: 60,
    currentParticipants: 43,
    endsAt: hoursFromNow(3),
    status: "active",
    category: "coding",
    isFeatured: true,
  },
  {
    title: "Machine Learning Roadmap 2025 Bundle",
    description: "Complete ML learning bundle with 50+ Jupyter notebooks, datasets, and project ideas. Win this ₹2000 bundle for just 25 credits entry.",
    creatorName: "Siddharth AI",
    creatorAvatar: "https://i.pravatar.cc/150?img=15",
    rewardTitle: "ML Roadmap 2025 — Complete Bundle",
    rewardImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=300&fit=crop",
    rewardType: "bundle",
    entryCredits: 25,
    maxParticipants: 40,
    currentParticipants: 29,
    endsAt: hoursFromNow(6),
    status: "active",
    category: "ai-ml",
    isFeatured: true,
  },
  {
    title: "React TypeScript Dashboard Template",
    description: "Production-ready admin dashboard with 15+ pages, dark/light mode, Recharts, and full TypeScript types. Normally 250 credits.",
    creatorName: "Priya Sharma",
    creatorAvatar: "https://i.pravatar.cc/150?img=47",
    rewardTitle: "React Admin Dashboard Template",
    rewardImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    rewardType: "template",
    entryCredits: 20,
    maxParticipants: 50,
    currentParticipants: 17,
    endsAt: hoursFromNow(12),
    status: "active",
    category: "coding",
    isFeatured: false,
  },
  {
    title: "UPSC Polity Complete Notes",
    description: "Full M. Laxmikanth summary notes with mind maps, PYQs, and answer templates. Coveted by thousands of UPSC aspirants.",
    creatorName: "Anjali Verma",
    creatorAvatar: "https://i.pravatar.cc/150?img=23",
    rewardTitle: "UPSC Polity Notes — Complete",
    rewardImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop",
    rewardType: "item",
    entryCredits: 10,
    maxParticipants: 100,
    currentParticipants: 67,
    endsAt: hoursFromNow(8),
    status: "active",
    category: "upsc",
    isFeatured: false,
  },
  {
    title: "Hacker Neon Theme Pack — 5 Themes",
    description: "5 premium cyberpunk-inspired IDE themes for VS Code and CodeLab. Includes Hacker Neon, Cyber Grid, and Matrix Green.",
    creatorName: "TechCreator_Dev",
    creatorAvatar: "https://i.pravatar.cc/150?img=33",
    rewardTitle: "Hacker Neon IDE Theme Pack",
    rewardImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop",
    rewardType: "item",
    entryCredits: 8,
    maxParticipants: 75,
    currentParticipants: 31,
    endsAt: hoursFromNow(18),
    status: "active",
    category: "design",
    isFeatured: false,
  },
  {
    title: "Competitive Programming Starter Pack",
    description: "C++ templates, 500+ curated problems, ICPC prep guide, and editorial collection. Essential for becoming a competitive programmer.",
    creatorName: "CP_Champion",
    creatorAvatar: "https://i.pravatar.cc/150?img=18",
    rewardTitle: "CP Starter Pack — 500+ Problems",
    rewardImage: null,
    rewardType: "bundle",
    entryCredits: 20,
    maxParticipants: 30,
    currentParticipants: 28,
    endsAt: hoursFromNow(1),
    status: "active",
    category: "coding",
    isFeatured: true,
  },
  {
    title: "Figma Education UI Kit",
    description: "500+ Figma components for education apps — course cards, quiz interfaces, leaderboards, and 20 complete screen designs.",
    creatorName: "Neha Designs",
    creatorAvatar: "https://i.pravatar.cc/150?img=44",
    rewardTitle: "Figma Education UI Kit — 500+ Components",
    rewardImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    rewardType: "item",
    entryCredits: 18,
    maxParticipants: 45,
    currentParticipants: 22,
    endsAt: hoursFromNow(24),
    status: "active",
    category: "design",
    isFeatured: false,
  },
  {
    title: "500 Credits Jackpot Room",
    description: "Pure credit giveaway — win 500 credits directly deposited to your wallet. Enter for just 30 credits. Daily mega room!",
    creatorName: "EduConnect Official",
    creatorAvatar: "https://i.pravatar.cc/150?img=5",
    rewardTitle: "500 Credits Jackpot 🎰",
    rewardImage: null,
    rewardType: "credits",
    entryCredits: 30,
    maxParticipants: 20,
    currentParticipants: 11,
    endsAt: hoursFromNow(2),
    status: "active",
    category: "general",
    isFeatured: true,
  },
];

async function seedLuckyRoyal() {
  console.log("Seeding Lucky Royal rooms...");
  await db.delete(luckyRoyalEntriesTable);
  await db.delete(luckyRoyalRoomsTable);
  for (const room of rooms) {
    await db.insert(luckyRoyalRoomsTable).values(room as typeof luckyRoyalRoomsTable.$inferInsert);
  }
  console.log(`✓ Inserted ${rooms.length} Lucky Royal rooms`);
}

seedLuckyRoyal()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
