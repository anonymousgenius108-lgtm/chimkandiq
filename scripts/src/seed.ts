import { eq } from "drizzle-orm";
import {
  db,
  tutorsTable,
  subjectsTable,
  availabilityTable,
  reviewsTable,
  bookingsTable,
  messagesTable,
  notificationsTable,
  questionsTable,
  answersTable,
  votesTable,
  reelsTable,
  reelLikesTable,
  reelCommentsTable,
  badgesTable,
  userStatsTable,
  userBadgesTable,
  pointsEventsTable,
  profilesTable,
  followsTable,
  tutorCoursesTable,
  courseEnrollmentsTable,
  codelabProblemsTable,
  codelabSubmissionsTable,
} from "@workspace/db";
import { seedCodelab } from "./seed-codelab";

async function main() {
  console.log("Clearing existing data...");
  await db.delete(codelabSubmissionsTable);
  await db.delete(codelabProblemsTable);
  await db.delete(courseEnrollmentsTable);
  await db.delete(tutorCoursesTable);
  await db.delete(followsTable);
  await db.delete(profilesTable);
  await db.delete(pointsEventsTable);
  await db.delete(userBadgesTable);
  await db.delete(userStatsTable);
  await db.delete(badgesTable);
  await db.delete(reelCommentsTable);
  await db.delete(reelLikesTable);
  await db.delete(reelsTable);
  await db.delete(votesTable);
  await db.delete(answersTable);
  await db.delete(questionsTable);
  await db.delete(notificationsTable);
  await db.delete(messagesTable);
  await db.delete(bookingsTable);
  await db.delete(reviewsTable);
  await db.delete(availabilityTable);
  await db.delete(tutorsTable);
  await db.delete(subjectsTable);

  const subjects = [
    { slug: "mathematics", name: "Mathematics" },
    { slug: "physics", name: "Physics" },
    { slug: "chemistry", name: "Chemistry" },
    { slug: "biology", name: "Biology" },
    { slug: "computer-science", name: "Computer Science" },
    { slug: "english", name: "English" },
    { slug: "spanish", name: "Spanish" },
    { slug: "history", name: "History" },
    { slug: "economics", name: "Economics" },
    { slug: "statistics", name: "Statistics" },
  ];

  console.log("Inserting subjects...");
  await db.insert(subjectsTable).values(subjects);

  const tutors = [
    {
      id: "t1",
      name: "Dr. Maya Patel",
      headline: "PhD Mathematician — making calculus click for 12 years",
      bio: "Former MIT lecturer specializing in calculus, linear algebra, and exam prep. I focus on building intuition through visual examples and lots of worked problems. My students consistently raise their grades by a full letter within a semester.",
      avatarUrl: "https://i.pravatar.cc/300?img=47",
      hourlyRate: "65.00",
      rating: "4.90",
      reviewCount: 142,
      yearsExperience: 12,
      totalSessions: 873,
      responseTimeMinutes: 25,
      location: "Boston, MA",
      isOnline: true,
      education: "PhD Applied Mathematics, MIT",
      subjects: ["mathematics", "statistics"],
      languages: ["English", "Hindi"],
    },
    {
      id: "t2",
      name: "Daniel Okafor",
      headline: "Stanford CS grad — Python, algorithms, and interview prep",
      bio: "Software engineer turned tutor. I teach Python, data structures, algorithms, and help students prep for technical interviews at top tech companies. Patient, structured, and obsessed with clean code.",
      avatarUrl: "https://i.pravatar.cc/300?img=12",
      hourlyRate: "75.00",
      rating: "4.85",
      reviewCount: 98,
      yearsExperience: 7,
      totalSessions: 512,
      responseTimeMinutes: 40,
      location: "San Francisco, CA",
      isOnline: true,
      education: "BS Computer Science, Stanford",
      subjects: ["computer-science", "mathematics"],
      languages: ["English"],
    },
    {
      id: "t3",
      name: "Sofía Hernández",
      headline: "Native Spanish speaker — conversational fluency in 90 days",
      bio: "Born in Madrid, taught Spanish at NYU for six years. My method blends real-world conversation with grammar fundamentals. Whether you want to ace AP Spanish or order coffee in Mexico City, we'll get you there.",
      avatarUrl: "https://i.pravatar.cc/300?img=45",
      hourlyRate: "45.00",
      rating: "4.95",
      reviewCount: 211,
      yearsExperience: 9,
      totalSessions: 1240,
      responseTimeMinutes: 15,
      location: "New York, NY",
      isOnline: false,
      education: "MA Linguistics, NYU",
      subjects: ["spanish"],
      languages: ["Spanish", "English"],
    },
    {
      id: "t4",
      name: "James Whitfield",
      headline: "Physics & engineering tutor — high school through undergrad",
      bio: "Mechanical engineer with a passion for teaching. I cover mechanics, electromagnetism, thermodynamics, and AP Physics 1/2/C. Lots of diagrams, real-world examples, and problem-solving strategies.",
      avatarUrl: "https://i.pravatar.cc/300?img=68",
      hourlyRate: "55.00",
      rating: "4.78",
      reviewCount: 76,
      yearsExperience: 5,
      totalSessions: 318,
      responseTimeMinutes: 60,
      location: "Austin, TX",
      isOnline: true,
      education: "MS Mechanical Engineering, UT Austin",
      subjects: ["physics", "mathematics"],
      languages: ["English"],
    },
    {
      id: "t5",
      name: "Aisha Mwangi",
      headline: "Med school student — biology, chemistry, MCAT prep",
      bio: "Third year at Johns Hopkins School of Medicine. I tutor pre-med students in biology, organic chemistry, and biochemistry. I know what it takes — and where students typically get stuck.",
      avatarUrl: "https://i.pravatar.cc/300?img=49",
      hourlyRate: "50.00",
      rating: "4.92",
      reviewCount: 134,
      yearsExperience: 4,
      totalSessions: 489,
      responseTimeMinutes: 30,
      location: "Baltimore, MD",
      isOnline: true,
      education: "MD Candidate, Johns Hopkins",
      subjects: ["biology", "chemistry"],
      languages: ["English", "Swahili"],
    },
    {
      id: "t6",
      name: "Liam O'Connor",
      headline: "Oxford-trained writer — essay craft, English literature, SAT",
      bio: "I help students find their voice. Whether you're writing a college application essay, dissecting Shakespeare, or training for the SAT verbal, my approach is collaborative and detail-oriented.",
      avatarUrl: "https://i.pravatar.cc/300?img=15",
      hourlyRate: "60.00",
      rating: "4.88",
      reviewCount: 89,
      yearsExperience: 8,
      totalSessions: 421,
      responseTimeMinutes: 45,
      location: "Chicago, IL",
      isOnline: false,
      education: "MA English Literature, Oxford",
      subjects: ["english", "history"],
      languages: ["English"],
    },
    {
      id: "t7",
      name: "Yuki Tanaka",
      headline: "Statistics & data science — turning numbers into stories",
      bio: "Data scientist at a Fortune 500. I tutor in statistics, R, Python for data analysis, and AP Statistics. My students leave understanding not just how but why.",
      avatarUrl: "https://i.pravatar.cc/300?img=44",
      hourlyRate: "70.00",
      rating: "4.82",
      reviewCount: 64,
      yearsExperience: 6,
      totalSessions: 287,
      responseTimeMinutes: 35,
      location: "Seattle, WA",
      isOnline: true,
      education: "MS Statistics, University of Washington",
      subjects: ["statistics", "computer-science", "mathematics"],
      languages: ["English", "Japanese"],
    },
    {
      id: "t8",
      name: "Marcus Reid",
      headline: "Economics PhD candidate — micro, macro, and AP Econ",
      bio: "I make economics intuitive. Working through real markets and policy decisions, my students develop the conceptual frameworks that the textbooks miss.",
      avatarUrl: "https://i.pravatar.cc/300?img=33",
      hourlyRate: "55.00",
      rating: "4.75",
      reviewCount: 52,
      yearsExperience: 4,
      totalSessions: 198,
      responseTimeMinutes: 50,
      location: "Philadelphia, PA",
      isOnline: true,
      education: "PhD Candidate Economics, UPenn",
      subjects: ["economics", "statistics"],
      languages: ["English"],
    },
  ] as const;

  console.log("Inserting tutors...");
  await db.insert(tutorsTable).values(tutors as unknown as typeof tutorsTable.$inferInsert[]);

  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const availabilityRows: typeof availabilityTable.$inferInsert[] = [];
  for (const t of tutors) {
    // Each tutor available 4-5 days per week
    const numDays = 4 + (t.id.charCodeAt(1) % 2);
    const offset = t.id.charCodeAt(1) % 7;
    for (let i = 0; i < numDays; i++) {
      const day = days[(i + offset) % 7]!;
      const startHour = 9 + (i % 3) * 2;
      const endHour = startHour + 4;
      availabilityRows.push({
        tutorId: t.id,
        day,
        startHour,
        endHour,
      });
    }
  }
  console.log("Inserting availability...");
  await db.insert(availabilityTable).values(availabilityRows);

  const reviewSeeds = [
    {
      tutorId: "t1",
      studentName: "Priya Sharma",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=23",
      rating: 5,
      comment:
        "Maya helped me go from struggling with Calc 2 to acing my final. Her visual explanations make everything click.",
    },
    {
      tutorId: "t1",
      studentName: "Tom Bridges",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=8",
      rating: 5,
      comment: "Best tutor I've ever had. Patient, clear, and genuinely cares.",
    },
    {
      tutorId: "t1",
      studentName: "Hana Mori",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=24",
      rating: 4,
      comment: "Great at linear algebra. Sessions are always well-prepared.",
    },
    {
      tutorId: "t2",
      studentName: "Ravi Chandra",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=13",
      rating: 5,
      comment:
        "Daniel walked me through five mock interviews and I landed an offer at a FAANG. Worth every dollar.",
    },
    {
      tutorId: "t2",
      studentName: "Emma Lin",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=20",
      rating: 5,
      comment: "Algorithms finally make sense. He has a gift for breaking down hard problems.",
    },
    {
      tutorId: "t3",
      studentName: "Carlos Mendez",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=51",
      rating: 5,
      comment:
        "Sofía is incredible. Three months of weekly sessions and I'm having real conversations in Spanish.",
    },
    {
      tutorId: "t3",
      studentName: "Olivia Park",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=32",
      rating: 5,
      comment: "Perfect blend of grammar and conversation. Highly recommend.",
    },
    {
      tutorId: "t4",
      studentName: "Noah Bennett",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=58",
      rating: 5,
      comment: "James got me a 5 on AP Physics C. He's a fantastic teacher.",
    },
    {
      tutorId: "t5",
      studentName: "Zara Khan",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=26",
      rating: 5,
      comment:
        "Aisha helped me through orgo and I owe her my MCAT score. Brilliant tutor.",
    },
    {
      tutorId: "t6",
      studentName: "Felix Vega",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=11",
      rating: 5,
      comment: "Liam transformed my college essay. Got into my dream school.",
    },
    {
      tutorId: "t7",
      studentName: "Maya Williams",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=29",
      rating: 5,
      comment: "Yuki made stats genuinely interesting. Rare gift.",
    },
    {
      tutorId: "t8",
      studentName: "David Cho",
      studentAvatarUrl: "https://i.pravatar.cc/120?img=14",
      rating: 4,
      comment: "Marcus knows his stuff. Helped me ace my macro midterm.",
    },
  ];
  console.log("Inserting reviews...");
  await db.insert(reviewsTable).values(reviewSeeds);

  // Sample bookings (one upcoming, one pending payment, one completed)
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(15, 0, 0, 0);
  const inThreeDays = new Date(now);
  inThreeDays.setDate(now.getDate() + 3);
  inThreeDays.setHours(10, 0, 0, 0);
  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 5);
  lastWeek.setHours(14, 0, 0, 0);
  const lastWeekEnd = new Date(lastWeek);
  lastWeekEnd.setHours(15, 0, 0, 0);

  console.log("Inserting bookings...");
  await db.insert(bookingsTable).values([
    {
      tutorId: "t1",
      studentName: "Alex Morgan",
      subject: "Calculus II",
      startsAt: tomorrow,
      endsAt: new Date(tomorrow.getTime() + 60 * 60_000),
      durationMinutes: 60,
      price: "65.00",
      status: "confirmed",
      notes: "Focus on integration by parts.",
    },
    {
      tutorId: "t2",
      studentName: "Alex Morgan",
      subject: "Algorithms",
      startsAt: inThreeDays,
      endsAt: new Date(inThreeDays.getTime() + 90 * 60_000),
      durationMinutes: 90,
      price: "112.50",
      status: "pending_payment",
      notes: "Want to review dynamic programming and graph algorithms.",
    },
    {
      tutorId: "t3",
      studentName: "Alex Morgan",
      subject: "Spanish Conversation",
      startsAt: lastWeek,
      endsAt: lastWeekEnd,
      durationMinutes: 60,
      price: "45.00",
      status: "completed",
      notes: "Great session on past tense.",
    },
  ]);

  console.log("Inserting messages...");
  await db.insert(messagesTable).values([
    {
      tutorId: "t1",
      sender: "student",
      content: "Hi Maya! Excited for our session tomorrow.",
      createdAt: new Date(now.getTime() - 3600 * 1000 * 6),
    },
    {
      tutorId: "t1",
      sender: "tutor",
      content:
        "Hi Alex! Looking forward to it. I'll prepare some integration by parts exercises.",
      createdAt: new Date(now.getTime() - 3600 * 1000 * 5),
    },
    {
      tutorId: "t1",
      sender: "student",
      content: "Perfect, thank you!",
      createdAt: new Date(now.getTime() - 3600 * 1000 * 4),
    },
    {
      tutorId: "t3",
      sender: "tutor",
      content: "Alex, ¡buen trabajo en la sesión de ayer!",
      createdAt: new Date(now.getTime() - 3600 * 1000 * 24),
    },
    {
      tutorId: "t3",
      sender: "student",
      content: "¡Gracias Sofía!",
      createdAt: new Date(now.getTime() - 3600 * 1000 * 23),
    },
  ]);

  console.log("Inserting notifications...");
  await db.insert(notificationsTable).values([
    {
      type: "session_reminder",
      title: "Session tomorrow at 3:00 PM",
      body: "Your Calculus II session with Dr. Maya Patel is tomorrow. We'll send you a reminder 15 minutes before it starts.",
      link: "/bookings",
      read: false,
    },
    {
      type: "message",
      title: "New message from Sofía Hernández",
      body: "¡Buen trabajo en la sesión de ayer!",
      link: "/messages/t3",
      read: false,
    },
    {
      type: "review_request",
      title: "How was your session with Sofía?",
      body: "Help other students by leaving a review of your recent Spanish session.",
      link: "/tutors/t3",
      read: true,
    },
  ]);

  // ========== Q&A ==========
  const ALEX = "Alex Morgan";
  const ALEX_AVATAR = "https://i.pravatar.cc/200?img=5";
  const otherStudents = [
    { name: "Priya Sharma", avatar: "https://i.pravatar.cc/200?img=23" },
    { name: "Tom Bridges", avatar: "https://i.pravatar.cc/200?img=8" },
    { name: "Hana Mori", avatar: "https://i.pravatar.cc/200?img=24" },
    { name: "Carlos Mendez", avatar: "https://i.pravatar.cc/200?img=51" },
    { name: "Olivia Park", avatar: "https://i.pravatar.cc/200?img=32" },
    { name: "Zara Khan", avatar: "https://i.pravatar.cc/200?img=26" },
    { name: "Ravi Chandra", avatar: "https://i.pravatar.cc/200?img=13" },
  ];

  console.log("Inserting questions and answers...");
  const questionSeeds: {
    title: string;
    body: string;
    tags: string[];
    author: { name: string; avatar: string };
    daysAgo: number;
    answers: { author: { name: string; avatar: string }; body: string; isBest?: boolean; daysAgo: number }[];
  }[] = [
    {
      title: "How do I approach integration by parts when both functions are messy?",
      body: "I keep getting stuck on integrals like x · ln(x) where neither part is obviously easier to integrate. Is there a rule of thumb for choosing u and dv?",
      tags: ["mathematics", "calculus"],
      author: { name: ALEX, avatar: ALEX_AVATAR },
      daysAgo: 6,
      answers: [
        {
          author: otherStudents[0]!,
          body: "Use the LIATE rule: Logarithmic, Inverse trig, Algebraic, Trig, Exponential. Whichever appears earlier in that list, pick as u. For x · ln(x), ln(x) wins so u = ln(x), dv = x dx.",
          isBest: true,
          daysAgo: 5,
        },
        {
          author: otherStudents[1]!,
          body: "Also remember: if integrating dv gets messier, you picked wrong. Swap them.",
          daysAgo: 5,
        },
      ],
    },
    {
      title: "Big-O of nested loops where the inner one depends on i?",
      body: "for i in range(n): for j in range(i): ... — is this O(n^2) or O(n log n)?",
      tags: ["computer-science", "algorithms"],
      author: { name: ALEX, avatar: ALEX_AVATAR },
      daysAgo: 4,
      answers: [
        {
          author: otherStudents[3]!,
          body: "Sum of 0+1+...+(n-1) is n(n-1)/2 which is O(n^2). The inner loop varying with i doesn't help — total work is still quadratic.",
          isBest: true,
          daysAgo: 4,
        },
      ],
    },
    {
      title: "Subjunctive mood in Spanish — when do I actually use it?",
      body: "I get the textbook examples (espero que…, dudo que…) but in real conversation I never know when to switch from indicative.",
      tags: ["spanish", "grammar"],
      author: otherStudents[4]!,
      daysAgo: 3,
      answers: [
        {
          author: otherStudents[3]!,
          body: "Think WEIRDO: Wishes, Emotions, Impersonal expressions, Recommendations, Doubts, Ojalá. If your sentence falls into one of those, the subordinate clause uses subjunctive.",
          isBest: true,
          daysAgo: 3,
        },
        {
          author: { name: ALEX, avatar: ALEX_AVATAR },
          body: "Sofía uses a great drill — she gives you a trigger phrase and you pivot. After 20 reps it becomes muscle memory.",
          daysAgo: 2,
        },
      ],
    },
    {
      title: "Photosynthesis: what really happens in the light vs dark reactions?",
      body: "Trying to nail the differences for my AP Bio exam. Conceptually I get they're linked but I lose track of inputs/outputs.",
      tags: ["biology", "ap-bio"],
      author: otherStudents[5]!,
      daysAgo: 8,
      answers: [
        {
          author: otherStudents[2]!,
          body: "Light reactions: H2O + light → O2 + ATP + NADPH (in thylakoid). Calvin cycle (dark): CO2 + ATP + NADPH → G3P → glucose (in stroma). Light reactions feed the energy molecules into Calvin.",
          isBest: true,
          daysAgo: 7,
        },
      ],
    },
    {
      title: "How do you derive the variance formula intuitively?",
      body: "I can plug into σ² = E[X²] - (E[X])² but I want to understand WHY that identity holds.",
      tags: ["statistics", "probability"],
      author: { name: ALEX, avatar: ALEX_AVATAR },
      daysAgo: 2,
      answers: [
        {
          author: otherStudents[1]!,
          body: "Start from σ² = E[(X - μ)²], expand the square: E[X² - 2μX + μ²] = E[X²] - 2μE[X] + μ². Since E[X] = μ, this collapses to E[X²] - μ². Done.",
          daysAgo: 2,
        },
      ],
    },
    {
      title: "Why does Newton's third law not seem to apply when I push a wall?",
      body: "If forces are equal and opposite, why don't I move backward when I push a wall? The wall pushes me with the same force.",
      tags: ["physics", "mechanics"],
      author: otherStudents[6]!,
      daysAgo: 9,
      answers: [
        {
          author: otherStudents[4]!,
          body: "Friction from the floor balances the wall's reaction force on you. Try the same on ice — you absolutely do slide back.",
          isBest: true,
          daysAgo: 8,
        },
      ],
    },
    {
      title: "AP Macro: what's the actual difference between fiscal and monetary policy?",
      body: "Both seem to influence the economy. Why do we need two separate tools?",
      tags: ["economics", "ap-macro"],
      author: otherStudents[2]!,
      daysAgo: 1,
      answers: [],
    },
    {
      title: "How do I write a personal statement that doesn't sound like everyone else's?",
      body: "Every example essay I read sounds the same. How do I stand out without sounding gimmicky?",
      tags: ["english", "essays", "college-apps"],
      author: { name: ALEX, avatar: ALEX_AVATAR },
      daysAgo: 12,
      answers: [
        {
          author: otherStudents[0]!,
          body: "Pick a tiny, specific moment — not your whole life. Liam (the writing tutor here) calls it 'the close-up.' Show your thinking through that one moment instead of summarizing achievements.",
          isBest: true,
          daysAgo: 11,
        },
      ],
    },
  ];

  const nowMs = Date.now();
  for (const qs of questionSeeds) {
    const createdAt = new Date(nowMs - qs.daysAgo * 24 * 3600 * 1000);
    const [q] = await db
      .insert(questionsTable)
      .values({
        authorName: qs.author.name,
        authorAvatarUrl: qs.author.avatar,
        title: qs.title,
        body: qs.body,
        tags: qs.tags,
        viewCount: 8 + Math.floor(Math.random() * 80),
        createdAt,
      })
      .returning();
    if (!q) continue;

    let bestAnswerId: string | null = null;
    for (const a of qs.answers) {
      const aCreatedAt = new Date(nowMs - a.daysAgo * 24 * 3600 * 1000);
      const [answer] = await db
        .insert(answersTable)
        .values({
          questionId: q.id,
          authorName: a.author.name,
          authorAvatarUrl: a.author.avatar,
          body: a.body,
          createdAt: aCreatedAt,
        })
        .returning();
      if (!answer) continue;
      if (a.isBest) bestAnswerId = answer.id;
      // Seed votes — 2-6 random upvotes per answer
      const numVotes = 2 + Math.floor(Math.random() * 5);
      for (let v = 0; v < numVotes; v++) {
        const voter = otherStudents[v % otherStudents.length]!;
        if (voter.name === a.author.name) continue;
        await db
          .insert(votesTable)
          .values({
            targetType: "answer",
            targetId: answer.id,
            userName: voter.name,
            value: 1,
          })
          .onConflictDoNothing();
      }
    }
    if (bestAnswerId) {
      await db
        .update(questionsTable)
        .set({ bestAnswerId })
        .where(eq(questionsTable.id, q.id));
    }
    // Question upvotes
    const numQVotes = 1 + Math.floor(Math.random() * 4);
    for (let v = 0; v < numQVotes; v++) {
      const voter = otherStudents[v % otherStudents.length]!;
      if (voter.name === qs.author.name) continue;
      await db
        .insert(votesTable)
        .values({
          targetType: "question",
          targetId: q.id,
          userName: voter.name,
          value: 1,
        })
        .onConflictDoNothing();
    }
  }

  // ========== Reels ==========
  console.log("Inserting reels...");
  const reelSeeds: {
    author: { name: string; avatar: string };
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    durationSec: number;
    subjectSlug: string;
    daysAgo: number;
  }[] = [
    {
      author: { name: "Dr. Maya Patel", avatar: "https://i.pravatar.cc/300?img=47" },
      title: "Integration by parts in 45 seconds",
      description: "The LIATE rule, one worked example, and the trap to avoid.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop",
      durationSec: 47,
      subjectSlug: "mathematics",
      daysAgo: 2,
    },
    {
      author: { name: "Daniel Okafor", avatar: "https://i.pravatar.cc/300?img=12" },
      title: "Why Python's GIL matters for your interview",
      description: "The one-paragraph answer that'll save you in a phone screen.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop",
      durationSec: 58,
      subjectSlug: "computer-science",
      daysAgo: 1,
    },
    {
      author: { name: "Sofía Hernández", avatar: "https://i.pravatar.cc/300?img=45" },
      title: "Por vs. para — finally explained",
      description: "Two prepositions, one rule that actually works in conversation.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1551022372-0bdac482b9d6?w=800&auto=format&fit=crop",
      durationSec: 32,
      subjectSlug: "spanish",
      daysAgo: 3,
    },
    {
      author: { name: "James Whitfield", avatar: "https://i.pravatar.cc/300?img=68" },
      title: "Free body diagrams: stop overthinking them",
      description: "The 4-step routine I teach every AP Physics student.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1632571401005-458e9d244591?w=800&auto=format&fit=crop",
      durationSec: 51,
      subjectSlug: "physics",
      daysAgo: 5,
    },
    {
      author: { name: "Aisha Mwangi", avatar: "https://i.pravatar.cc/300?img=49" },
      title: "Krebs cycle mnemonic that actually works",
      description: "Citrate → Iso-citrate → α-KG. Once you say it, you'll never forget.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop",
      durationSec: 44,
      subjectSlug: "biology",
      daysAgo: 7,
    },
    {
      author: { name: "Yuki Tanaka", avatar: "https://i.pravatar.cc/300?img=44" },
      title: "P-values without the panic",
      description: "What they really mean, and what they don't.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
      durationSec: 56,
      subjectSlug: "statistics",
      daysAgo: 4,
    },
  ];
  for (const r of reelSeeds) {
    const createdAt = new Date(nowMs - r.daysAgo * 24 * 3600 * 1000);
    const likeCount = 30 + Math.floor(Math.random() * 220);
    const [reel] = await db
      .insert(reelsTable)
      .values({
        authorName: r.author.name,
        authorAvatarUrl: r.author.avatar,
        title: r.title,
        description: r.description,
        videoUrl: r.videoUrl,
        thumbnailUrl: r.thumbnailUrl,
        durationSec: r.durationSec,
        subjectSlug: r.subjectSlug,
        viewCount: likeCount * 8 + Math.floor(Math.random() * 200),
        likeCount,
        createdAt,
      })
      .returning();
    if (!reel) continue;
    // Seed a couple of comments
    await db.insert(reelCommentsTable).values([
      {
        reelId: reel.id,
        authorName: otherStudents[0]!.name,
        authorAvatarUrl: otherStudents[0]!.avatar,
        body: "Saved this. Sharing with my study group.",
        createdAt: new Date(createdAt.getTime() + 3600 * 1000),
      },
      {
        reelId: reel.id,
        authorName: otherStudents[3]!.name,
        authorAvatarUrl: otherStudents[3]!.avatar,
        body: "Wish I'd seen this before my last test.",
        createdAt: new Date(createdAt.getTime() + 7200 * 1000),
      },
    ]);
  }

  // ========== Badges ==========
  console.log("Inserting badges...");
  await db.insert(badgesTable).values([
    {
      code: "first_question",
      name: "Curious Mind",
      description: "Asked your first doubt question.",
      icon: "help-circle",
      tier: "bronze",
      threshold: 1,
    },
    {
      code: "first_answer",
      name: "Helping Hand",
      description: "Submitted your first answer.",
      icon: "message-square-reply",
      tier: "bronze",
      threshold: 1,
    },
    {
      code: "five_answers",
      name: "Knowledge Sharer",
      description: "Submitted 5 or more answers.",
      icon: "library",
      tier: "silver",
      threshold: 5,
    },
    {
      code: "best_answer",
      name: "Brightest Bulb",
      description: "Had an answer marked as best.",
      icon: "lightbulb",
      tier: "silver",
      threshold: 1,
    },
    {
      code: "streak_7",
      name: "Week Warrior",
      description: "Stayed active 7 days in a row.",
      icon: "flame",
      tier: "silver",
      threshold: 7,
    },
    {
      code: "streak_30",
      name: "Month Marathoner",
      description: "Stayed active 30 days in a row.",
      icon: "calendar-check",
      tier: "gold",
      threshold: 30,
    },
    {
      code: "first_session",
      name: "First Lesson",
      description: "Completed your first tutoring session.",
      icon: "graduation-cap",
      tier: "bronze",
      threshold: 1,
    },
    {
      code: "ten_sessions",
      name: "Dedicated Learner",
      description: "Completed 10 tutoring sessions.",
      icon: "trophy",
      tier: "gold",
      threshold: 10,
    },
  ]);

  // ========== User stats and points events ==========
  console.log("Inserting user stats and points events...");
  const allUsers = [
    { name: ALEX, avatar: ALEX_AVATAR, basePoints: 0, streak: 9, longest: 14 },
    ...otherStudents.map((s, i) => ({
      name: s.name,
      avatar: s.avatar,
      basePoints: 0,
      streak: [3, 12, 6, 21, 4, 15, 8][i] ?? 5,
      longest: [10, 22, 18, 30, 11, 28, 16][i] ?? 12,
    })),
  ];
  for (const u of allUsers) {
    await db.insert(userStatsTable).values({
      userName: u.name,
      avatarUrl: u.avatar,
      points: u.basePoints,
      currentStreak: u.streak,
      longestStreak: u.longest,
      lastActiveOn: new Date().toISOString().slice(0, 10),
    });
  }

  // Award badges to Alex
  const alexBadges = ["first_question", "first_answer", "best_answer", "first_session", "streak_7"];
  for (const code of alexBadges) {
    await db.insert(userBadgesTable).values({
      userName: ALEX,
      badgeCode: code,
      earnedAt: new Date(nowMs - Math.floor(Math.random() * 20) * 24 * 3600 * 1000),
    });
  }
  // Other users get some badges too
  await db.insert(userBadgesTable).values([
    { userName: otherStudents[0]!.name, badgeCode: "five_answers" },
    { userName: otherStudents[0]!.name, badgeCode: "best_answer" },
    { userName: otherStudents[1]!.name, badgeCode: "best_answer" },
    { userName: otherStudents[3]!.name, badgeCode: "five_answers" },
    { userName: otherStudents[3]!.name, badgeCode: "streak_7" },
    { userName: otherStudents[3]!.name, badgeCode: "streak_30" },
    { userName: otherStudents[3]!.name, badgeCode: "best_answer" },
    { userName: otherStudents[5]!.name, badgeCode: "best_answer" },
    { userName: otherStudents[6]!.name, badgeCode: "first_answer" },
  ]);

  // Seed points events distributed across daily/weekly/monthly buckets
  const eventKinds = [
    { kind: "ask_question", points: 5 },
    { kind: "post_answer", points: 10 },
    { kind: "best_answer", points: 25 },
    { kind: "session_completed", points: 15 },
    { kind: "upvote_received", points: 2 },
  ];
  // Fixed point totals so leaderboard is realistic and stable per-user
  const userPointPlans = [
    { name: ALEX, total: 480, spread: [60, 220, 200] }, // [today, this-week-no-today, older]
    { name: otherStudents[3]!.name, total: 1620, spread: [40, 180, 1400] }, // Carlos top
    { name: otherStudents[0]!.name, total: 1180, spread: [25, 150, 1005] }, // Priya
    { name: otherStudents[1]!.name, total: 720, spread: [10, 90, 620] }, // Tom
    { name: otherStudents[5]!.name, total: 540, spread: [30, 100, 410] }, // Zara
    { name: otherStudents[2]!.name, total: 380, spread: [0, 80, 300] }, // Hana
    { name: otherStudents[6]!.name, total: 290, spread: [15, 75, 200] }, // Ravi
    { name: otherStudents[4]!.name, total: 210, spread: [0, 50, 160] }, // Olivia
  ];
  for (const plan of userPointPlans) {
    const buckets = [
      { msAgo: 1000 * 60 * 30, target: plan.spread[0]! }, // today (30 min ago)
      { msAgo: 1000 * 60 * 60 * 24 * 3, target: plan.spread[1]! }, // 3 days ago
      { msAgo: 1000 * 60 * 60 * 24 * 18, target: plan.spread[2]! }, // 18 days ago
    ];
    for (const b of buckets) {
      let remaining = b.target;
      while (remaining > 0) {
        const ek = eventKinds[Math.floor(Math.random() * eventKinds.length)]!;
        const pts = Math.min(ek.points, remaining);
        await db.insert(pointsEventsTable).values({
          userName: plan.name,
          kind: ek.kind,
          points: pts,
          reference: "",
          awardedAt: new Date(nowMs - b.msAgo - Math.floor(Math.random() * 1000 * 60 * 60 * 6)),
        });
        remaining -= pts;
      }
    }
  }

  // ========== Profiles ==========
  console.log("Inserting profiles and follow graph...");
  type ProfileSeed = {
    userName: string;
    bio: string;
    course: string;
    college: string;
    yearOfStudy: string;
    location: string;
    subjects: string[];
    skills: string[];
    interests: string[];
    activities: string[];
    isPrivate: boolean;
  };
  const profileSeedsByName: Record<string, ProfileSeed> = {
    [ALEX]: {
      userName: ALEX,
      bio: "Second-year CS undergrad. Love clean math derivations and a good Python notebook. Always down to swap study notes.",
      course: "B.Sc. Computer Science",
      college: "Northgate University",
      yearOfStudy: "Year 2",
      location: "Bengaluru, IN",
      subjects: ["Computer Science", "Mathematics", "Statistics"],
      skills: ["Python", "Calculus", "Algorithms", "LaTeX"],
      interests: ["Machine learning", "Open-source", "Chess"],
      activities: ["Coding club lead", "Volunteer math tutor"],
      isPrivate: false,
    },
    "Priya Sharma": {
      userName: "Priya Sharma",
      bio: "Maths nerd who actually enjoys integration by parts. Drop your tricky integrals here.",
      course: "B.Sc. Mathematics",
      college: "St. Anselm's College",
      yearOfStudy: "Year 3",
      location: "Mumbai, IN",
      subjects: ["Mathematics", "Physics"],
      skills: ["Calculus", "Linear Algebra", "Real Analysis"],
      interests: ["Olympiad problems", "Bharatanatyam"],
      activities: ["Maths Olympiad mentor"],
      isPrivate: false,
    },
    "Tom Bridges": {
      userName: "Tom Bridges",
      bio: "Pre-med, but secretly here for the algorithms. Will trade biology notes for clean code.",
      course: "B.S. Biology, Pre-Med",
      college: "Cedar Hill University",
      yearOfStudy: "Year 2",
      location: "Boston, US",
      subjects: ["Biology", "Chemistry", "Computer Science"],
      skills: ["Anatomy", "Organic chemistry", "Python basics"],
      interests: ["Long-distance running", "Podcasts"],
      activities: ["Hospital volunteer"],
      isPrivate: false,
    },
    "Hana Mori": {
      userName: "Hana Mori",
      bio: "Econ major. Macro > Micro. Fight me.",
      course: "B.A. Economics",
      college: "Kyoto International College",
      yearOfStudy: "Year 4",
      location: "Kyoto, JP",
      subjects: ["Economics", "Statistics", "History"],
      skills: ["Econometrics", "R", "Excel"],
      interests: ["Tea ceremony", "Travel"],
      activities: ["Debate club"],
      isPrivate: true,
    },
    "Carlos Mendez": {
      userName: "Carlos Mendez",
      bio: "Backend engineer in training. Live in the terminal. Will explain Big-O until you actually like it.",
      course: "B.Sc. Computer Engineering",
      college: "ITESM Monterrey",
      yearOfStudy: "Year 3",
      location: "Monterrey, MX",
      subjects: ["Computer Science", "Mathematics"],
      skills: ["Go", "Postgres", "System design", "Algorithms"],
      interests: ["Mechanical keyboards", "Salsa"],
      activities: ["Open-source contributor"],
      isPrivate: false,
    },
    "Olivia Park": {
      userName: "Olivia Park",
      bio: "Languages, languages, languages. Currently obsessed with the Spanish subjunctive.",
      course: "B.A. Modern Languages",
      college: "Harborline College",
      yearOfStudy: "Year 1",
      location: "Vancouver, CA",
      subjects: ["Spanish", "English", "History"],
      skills: ["Translation", "Public speaking"],
      interests: ["K-drama", "Coffee"],
      activities: ["Language exchange host"],
      isPrivate: false,
    },
    "Zara Khan": {
      userName: "Zara Khan",
      bio: "Bio-major, photosynthesis evangelist. Notes on Notion, doodles in margins.",
      course: "B.Sc. Biology",
      college: "Riverside Science Institute",
      yearOfStudy: "Year 2",
      location: "Lahore, PK",
      subjects: ["Biology", "Chemistry"],
      skills: ["Microscopy", "Sketchnoting"],
      interests: ["Birdwatching", "Watercolor"],
      activities: ["Bio club secretary"],
      isPrivate: false,
    },
    "Ravi Chandra": {
      userName: "Ravi Chandra",
      bio: "First-year, figuring it out. Big questions only.",
      course: "B.Sc. Physics",
      college: "Northgate University",
      yearOfStudy: "Year 1",
      location: "Hyderabad, IN",
      subjects: ["Physics", "Mathematics"],
      skills: ["Mechanics basics", "Curiosity"],
      interests: ["Astronomy", "Cricket"],
      activities: ["Astronomy club"],
      isPrivate: false,
    },
  };
  const profileRows = allUsers.map((u) => {
    const seed = profileSeedsByName[u.name];
    return {
      userName: u.name,
      displayName: u.name,
      avatarUrl: u.avatar,
      bio: seed?.bio ?? "",
      course: seed?.course ?? "",
      college: seed?.college ?? "",
      yearOfStudy: seed?.yearOfStudy ?? "",
      location: seed?.location ?? "",
      subjects: seed?.subjects ?? [],
      skills: seed?.skills ?? [],
      interests: seed?.interests ?? [],
      activities: seed?.activities ?? [],
      isPrivate: seed?.isPrivate ?? false,
    };
  });
  await db.insert(profilesTable).values(profileRows);

  // Follow graph: Alex follows 4 people; 5 people follow Alex; some peer follows
  const follows: { follower: string; followee: string; daysAgo: number }[] = [
    { follower: ALEX, followee: "Priya Sharma", daysAgo: 12 },
    { follower: ALEX, followee: "Carlos Mendez", daysAgo: 9 },
    { follower: ALEX, followee: "Olivia Park", daysAgo: 4 },
    { follower: ALEX, followee: "Zara Khan", daysAgo: 2 },
    { follower: "Priya Sharma", followee: ALEX, daysAgo: 11 },
    { follower: "Tom Bridges", followee: ALEX, daysAgo: 7 },
    { follower: "Carlos Mendez", followee: ALEX, daysAgo: 8 },
    { follower: "Olivia Park", followee: ALEX, daysAgo: 3 },
    { follower: "Ravi Chandra", followee: ALEX, daysAgo: 1 },
    { follower: "Carlos Mendez", followee: "Priya Sharma", daysAgo: 20 },
    { follower: "Priya Sharma", followee: "Carlos Mendez", daysAgo: 19 },
    { follower: "Tom Bridges", followee: "Zara Khan", daysAgo: 14 },
    { follower: "Zara Khan", followee: "Tom Bridges", daysAgo: 13 },
    { follower: "Olivia Park", followee: "Hana Mori", daysAgo: 6 },
    { follower: "Ravi Chandra", followee: "Carlos Mendez", daysAgo: 5 },
  ];
  await db.insert(followsTable).values(
    follows.map((f) => ({
      followerName: f.follower,
      followeeName: f.followee,
      createdAt: new Date(nowMs - f.daysAgo * 24 * 60 * 60 * 1000),
    })),
  );

  // ========== Tutor Courses + Enrollments ==========
  console.log("Inserting tutor courses and enrollments...");
  const TUTOR_ID = "t2"; // Daniel Okafor
  const nowMs2 = Date.now();
  const courses2 = [
    {
      id: "c1",
      tutorId: TUTOR_ID,
      title: "Python for Beginners: Zero to Functions",
      subjectSlug: "computer-science",
      description:
        "Hands-on intro to Python covering variables, loops, functions, and basic data structures. Perfect for students with no prior coding experience.",
      thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80",
      priceInr: 1499,
      chapterCount: 8,
      isPublished: true,
      createdAt: new Date(nowMs2 - 90 * 24 * 60 * 60 * 1000),
    },
    {
      id: "c2",
      tutorId: TUTOR_ID,
      title: "Data Structures & Algorithms: Interview Ready",
      subjectSlug: "computer-science",
      description:
        "Complete DSA course — arrays, linked lists, trees, graphs, sorting, dynamic programming. Includes 60 practice problems and 3 mock interviews.",
      thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&q=80",
      priceInr: 2999,
      chapterCount: 14,
      isPublished: true,
      createdAt: new Date(nowMs2 - 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: "c3",
      tutorId: TUTOR_ID,
      title: "Statistics Fundamentals with Python",
      subjectSlug: "statistics",
      description:
        "Probability, distributions, hypothesis testing, and regression — all taught through real datasets using pandas and matplotlib.",
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
      priceInr: 1999,
      chapterCount: 10,
      isPublished: true,
      createdAt: new Date(nowMs2 - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: "c4",
      tutorId: TUTOR_ID,
      title: "System Design for Undergrads",
      subjectSlug: "computer-science",
      description:
        "Databases, caching, load balancing, microservices — the concepts every CS student should know before their first internship.",
      thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80",
      priceInr: 2499,
      chapterCount: 6,
      isPublished: false,
      createdAt: new Date(nowMs2 - 7 * 24 * 60 * 60 * 1000),
    },
  ];
  await db.insert(tutorCoursesTable).values(courses2);

  type EnrollmentSeed = {
    courseId: string;
    studentName: string;
    studentAvatarUrl: string;
    daysAgo: number;
    progressPct: number;
    lastActiveDaysAgo: number;
    quizAvg: number;
    attendancePct: number;
    focusScore: number;
    weakTopics: string[];
    streakDays: number;
  };
  const enrollmentSeeds: EnrollmentSeed[] = [
    // c1 — Python for Beginners (7 students)
    { courseId: "c1", studentName: "Alex Morgan",      studentAvatarUrl: "https://i.pravatar.cc/200?img=5",  daysAgo: 80, progressPct: 72, lastActiveDaysAgo: 1, quizAvg: 78, attendancePct: 90, focusScore: 82, weakTopics: ["Recursion"], streakDays: 9 },
    { courseId: "c1", studentName: "Priya Sharma",     studentAvatarUrl: "https://i.pravatar.cc/200?img=23", daysAgo: 75, progressPct: 95, lastActiveDaysAgo: 0, quizAvg: 91, attendancePct: 97, focusScore: 94, weakTopics: [], streakDays: 14 },
    { courseId: "c1", studentName: "Tom Bridges",      studentAvatarUrl: "https://i.pravatar.cc/200?img=8",  daysAgo: 70, progressPct: 45, lastActiveDaysAgo: 7, quizAvg: 42, attendancePct: 55, focusScore: 50, weakTopics: ["Functions", "Loops"], streakDays: 2 },
    { courseId: "c1", studentName: "Olivia Park",      studentAvatarUrl: "https://i.pravatar.cc/200?img=32", daysAgo: 65, progressPct: 60, lastActiveDaysAgo: 2, quizAvg: 65, attendancePct: 78, focusScore: 70, weakTopics: ["Lists"], streakDays: 5 },
    { courseId: "c1", studentName: "Zara Khan",        studentAvatarUrl: "https://i.pravatar.cc/200?img=26", daysAgo: 60, progressPct: 88, lastActiveDaysAgo: 1, quizAvg: 84, attendancePct: 93, focusScore: 88, weakTopics: [], streakDays: 11 },
    { courseId: "c1", studentName: "Ravi Chandra",     studentAvatarUrl: "https://i.pravatar.cc/200?img=13", daysAgo: 55, progressPct: 30, lastActiveDaysAgo: 9, quizAvg: 38, attendancePct: 45, focusScore: 40, weakTopics: ["Functions", "Scope", "Recursion"], streakDays: 1 },
    { courseId: "c1", studentName: "Carlos Mendez",    studentAvatarUrl: "https://i.pravatar.cc/200?img=51", daysAgo: 50, progressPct: 100, lastActiveDaysAgo: 3, quizAvg: 97, attendancePct: 99, focusScore: 96, weakTopics: [], streakDays: 21 },
    // c2 — DSA (5 students)
    { courseId: "c2", studentName: "Alex Morgan",      studentAvatarUrl: "https://i.pravatar.cc/200?img=5",  daysAgo: 55, progressPct: 40, lastActiveDaysAgo: 1, quizAvg: 70, attendancePct: 85, focusScore: 75, weakTopics: ["Dynamic Programming"], streakDays: 6 },
    { courseId: "c2", studentName: "Carlos Mendez",    studentAvatarUrl: "https://i.pravatar.cc/200?img=51", daysAgo: 52, progressPct: 78, lastActiveDaysAgo: 0, quizAvg: 88, attendancePct: 92, focusScore: 90, weakTopics: ["Graphs"], streakDays: 18 },
    { courseId: "c2", studentName: "Priya Sharma",     studentAvatarUrl: "https://i.pravatar.cc/200?img=23", daysAgo: 48, progressPct: 55, lastActiveDaysAgo: 2, quizAvg: 74, attendancePct: 88, focusScore: 80, weakTopics: ["Trees"], streakDays: 8 },
    { courseId: "c2", studentName: "Tom Bridges",      studentAvatarUrl: "https://i.pravatar.cc/200?img=8",  daysAgo: 45, progressPct: 20, lastActiveDaysAgo: 8, quizAvg: 35, attendancePct: 50, focusScore: 38, weakTopics: ["Linked Lists", "Recursion", "Trees"], streakDays: 0 },
    { courseId: "c2", studentName: "Hana Mori",        studentAvatarUrl: "https://i.pravatar.cc/200?img=24", daysAgo: 40, progressPct: 65, lastActiveDaysAgo: 3, quizAvg: 79, attendancePct: 80, focusScore: 77, weakTopics: ["Heaps"], streakDays: 7 },
    // c3 — Statistics (4 students)
    { courseId: "c3", studentName: "Zara Khan",        studentAvatarUrl: "https://i.pravatar.cc/200?img=26", daysAgo: 28, progressPct: 50, lastActiveDaysAgo: 1, quizAvg: 72, attendancePct: 87, focusScore: 78, weakTopics: ["Hypothesis Testing"], streakDays: 10 },
    { courseId: "c3", studentName: "Olivia Park",      studentAvatarUrl: "https://i.pravatar.cc/200?img=32", daysAgo: 25, progressPct: 35, lastActiveDaysAgo: 4, quizAvg: 60, attendancePct: 70, focusScore: 65, weakTopics: ["Regression"], streakDays: 4 },
    { courseId: "c3", studentName: "Ravi Chandra",     studentAvatarUrl: "https://i.pravatar.cc/200?img=13", daysAgo: 22, progressPct: 20, lastActiveDaysAgo: 6, quizAvg: 44, attendancePct: 55, focusScore: 48, weakTopics: ["Distributions", "Hypothesis Testing"], streakDays: 1 },
    { courseId: "c3", studentName: "Alex Morgan",      studentAvatarUrl: "https://i.pravatar.cc/200?img=5",  daysAgo: 20, progressPct: 40, lastActiveDaysAgo: 1, quizAvg: 68, attendancePct: 82, focusScore: 73, weakTopics: ["Bayesian Stats"], streakDays: 5 },
  ];
  await db.insert(courseEnrollmentsTable).values(
    enrollmentSeeds.map((e) => ({
      courseId: e.courseId,
      studentName: e.studentName,
      studentAvatarUrl: e.studentAvatarUrl,
      enrolledAt: new Date(nowMs2 - e.daysAgo * 24 * 60 * 60 * 1000),
      progressPct: e.progressPct,
      lastActiveAt: new Date(nowMs2 - e.lastActiveDaysAgo * 24 * 60 * 60 * 1000),
      quizAvg: e.quizAvg,
      attendancePct: e.attendancePct,
      focusScore: e.focusScore,
      weakTopics: e.weakTopics,
      streakDays: e.streakDays,
    })),
  );

  console.log("Seeding CodeLab...");
  await seedCodelab();

  console.log("Seed complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
