import { Router } from "express";
import { db } from "@workspace/db";
import {
  codelabProblemsTable,
  codelabSubmissionsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  RunCodelabCodeBody,
  SubmitCodelabCodeBody,
  GetCodelabAiHintBody,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const CURRENT_USER = "alex_morgan";

// Simulated Python/JS execution engine
function simulateExecution(
  code: string,
  language: string,
  testCases: Array<{ input: string; expected: string; label: string }>
): { results: Array<{ label: string; passed: boolean; expected: string; actual: string }>; output: string } {
  const results = testCases.map((tc) => {
    // Simple pattern-matching simulation for demo problems
    const actual = evaluateCode(code, tc.input, language);
    return {
      label: tc.label,
      passed: actual.trim() === tc.expected.trim(),
      expected: tc.expected,
      actual,
    };
  });

  const passed = results.filter((r) => r.passed).length;
  const output = results.map((r) => `${r.label}: ${r.passed ? "PASS" : `FAIL (expected: ${r.expected}, got: ${r.actual})`}`).join("\n");

  return { results, output };
}

function evaluateCode(code: string, input: string, _lang: string): string {
  // Deterministic simulation: parse and evaluate simple functions
  try {
    // Two-sum
    if (code.includes("two_sum") || code.includes("twoSum")) {
      const m = input.match(/\[(.+)\],\s*(\d+)/);
      if (m) {
        const nums = m[1].split(",").map(Number);
        const target = Number(m[2]);
        for (let i = 0; i < nums.length; i++) {
          for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) return `[${i}, ${j}]`;
          }
        }
      }
    }
    // Fibonacci
    if (code.includes("fibonacci") || code.includes("fib")) {
      const n = parseInt(input);
      if (!isNaN(n)) {
        const fib = (x: number): number => x <= 1 ? x : fib(x - 1) + fib(x - 2);
        return String(fib(n));
      }
    }
    // Palindrome
    if (code.includes("palindrome") || code.includes("is_palindrome")) {
      const s = input.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      return String(s === s.split("").reverse().join(""));
    }
    // Reverse string
    if (code.includes("reverse")) {
      return input.split("").reverse().join("");
    }
    // Factorial
    if (code.includes("factorial")) {
      const n = parseInt(input);
      if (!isNaN(n)) {
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return String(result);
      }
    }
    // Max sub array
    if (code.includes("max_subarray") || code.includes("maxSubArray")) {
      const nums = input.replace(/[\[\]]/g, "").split(",").map(Number);
      let maxSum = nums[0], cur = nums[0];
      for (let i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]);
        maxSum = Math.max(maxSum, cur);
      }
      return String(maxSum);
    }
    // Anagram
    if (code.includes("anagram") || code.includes("is_anagram")) {
      const parts = input.split(",").map((s) => s.trim().replace(/"/g, ""));
      if (parts.length === 2) {
        const a = parts[0].split("").sort().join("");
        const b = parts[1].split("").sort().join("");
        return String(a === b);
      }
    }
    // Count vowels
    if (code.includes("count_vowels") || code.includes("vowels")) {
      const count = (input.match(/[aeiouAEIOU]/g) || []).length;
      return String(count);
    }
    return "None";
  } catch {
    return "Error";
  }
}

// GET /codelab/problems
router.get("/codelab/problems", async (req, res) => {
  const { difficulty, subject } = req.query as { difficulty?: string; subject?: string };

  const allProblems = await db.select().from(codelabProblemsTable);

  const filtered = allProblems.filter((p) => {
    if (difficulty && p.difficulty !== difficulty) return false;
    if (subject && p.subject !== subject) return false;
    return true;
  });

  const submissions = await db
    .select()
    .from(codelabSubmissionsTable)
    .where(eq(codelabSubmissionsTable.userName, CURRENT_USER));

  const solvedProblemIds = new Set(
    submissions.filter((s) => s.passed).map((s) => s.problemId)
  );
  const attemptCounts: Record<string, number> = {};
  for (const s of submissions) {
    attemptCounts[s.problemId] = (attemptCounts[s.problemId] ?? 0) + 1;
  }

  res.json(
    filtered.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty,
      subject: p.subject,
      tags: p.tags,
      solvedByUser: solvedProblemIds.has(p.id),
      attemptCount: attemptCounts[p.id] ?? 0,
    }))
  );
});

// GET /codelab/problems/:slug
router.get("/codelab/problems/:slug", async (req, res) => {
  const { slug } = req.params;
  const [problem] = await db
    .select()
    .from(codelabProblemsTable)
    .where(eq(codelabProblemsTable.slug, slug));

  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }

  res.json({
    id: problem.id,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    subject: problem.subject,
    description: problem.description,
    starterCode: problem.starterCode,
    tags: problem.tags,
    hints: JSON.parse(problem.hints) as string[],
    testCases: JSON.parse(problem.testCases) as Array<{ input: string; expected: string; label: string }>,
    createdAt: problem.createdAt.toISOString(),
  });
});

// POST /codelab/problems/:slug/run
router.post("/codelab/problems/:slug/run", async (req, res) => {
  const { slug } = req.params;
  const body = RunCodelabCodeBody.parse(req.body);

  const [problem] = await db
    .select()
    .from(codelabProblemsTable)
    .where(eq(codelabProblemsTable.slug, slug));

  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }

  const testCases = JSON.parse(problem.testCases) as Array<{ input: string; expected: string; label: string }>;
  const { results, output } = simulateExecution(body.code, body.language, testCases);
  const passedCount = results.filter((r) => r.passed).length;

  res.json({
    passed: passedCount === testCases.length,
    passedCount,
    totalCount: testCases.length,
    output,
    results,
  });
});

// POST /codelab/problems/:slug/submit
router.post("/codelab/problems/:slug/submit", async (req, res) => {
  const { slug } = req.params;
  const body = SubmitCodelabCodeBody.parse(req.body);

  const [problem] = await db
    .select()
    .from(codelabProblemsTable)
    .where(eq(codelabProblemsTable.slug, slug));

  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }

  const testCases = JSON.parse(problem.testCases) as Array<{ input: string; expected: string; label: string }>;
  const { results, output } = simulateExecution(body.code, body.language, testCases);
  const passedCount = results.filter((r) => r.passed).length;
  const passed = passedCount === testCases.length;

  const [submission] = await db
    .insert(codelabSubmissionsTable)
    .values({
      problemId: problem.id,
      userName: CURRENT_USER,
      code: body.code,
      language: body.language,
      passed,
      passedCount,
      totalCount: testCases.length,
      output,
    })
    .returning();

  res.json({
    id: submission.id,
    problemId: submission.problemId,
    userName: submission.userName,
    code: submission.code,
    language: submission.language,
    passed: submission.passed,
    passedCount: submission.passedCount,
    totalCount: submission.totalCount,
    output: submission.output,
    submittedAt: submission.submittedAt.toISOString(),
  });
});

// POST /codelab/problems/:slug/hint  (SSE stream)
router.post("/codelab/problems/:slug/hint", async (req, res) => {
  const { slug } = req.params;
  const body = GetCodelabAiHintBody.parse(req.body);

  const [problem] = await db
    .select()
    .from(codelabProblemsTable)
    .where(eq(codelabProblemsTable.slug, slug));

  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const systemPrompt = `You are a helpful coding tutor assistant for EduConnect. 
The student is working on: "${problem.title}"

Problem description:
${problem.description}

Your role:
- Give a targeted hint that guides them toward the solution WITHOUT revealing it directly
- If their code has a clear bug, point it out conceptually  
- Keep hints concise (2-4 sentences)
- Use encouraging, student-friendly language
- Focus on the algorithmic approach, not syntax`;

  const userMessage = body.code.trim()
    ? `My current code (${body.language}):\n\`\`\`\n${body.code}\n\`\`\`\n\nCan you give me a hint?`
    : "I'm not sure where to start. Can you give me a hint to get going?";

  const stream = await openai.chat.completions.create({
    model: "gpt-5.1",
    max_completion_tokens: 512,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

// GET /codelab/submissions
router.get("/codelab/submissions", async (req, res) => {
  const submissions = await db
    .select()
    .from(codelabSubmissionsTable)
    .where(eq(codelabSubmissionsTable.userName, CURRENT_USER));

  res.json(
    submissions.map((s) => ({
      id: s.id,
      problemId: s.problemId,
      userName: s.userName,
      code: s.code,
      language: s.language,
      passed: s.passed,
      passedCount: s.passedCount,
      totalCount: s.totalCount,
      output: s.output,
      submittedAt: s.submittedAt.toISOString(),
    }))
  );
});

// GET /openai/conversations — stub (returns empty, actual convos stored in memory per session)
router.get("/openai/conversations", async (_req, res) => {
  res.json([]);
});

// POST /openai/conversations — create conversation (returns a simple object)
router.post("/openai/conversations", async (req, res) => {
  const { title } = req.body as { title: string };
  res.status(201).json({
    id: Date.now(),
    title: title ?? "New Conversation",
    createdAt: new Date().toISOString(),
  });
});

// GET /openai/conversations/:id
router.get("/openai/conversations/:id", async (req, res) => {
  res.json({
    id: Number(req.params.id),
    title: "AI Tutor Chat",
    createdAt: new Date().toISOString(),
    messages: [],
  });
});

// POST /openai/conversations/:id/messages  (SSE stream)
router.post("/openai/conversations/:id/messages", async (req, res) => {
  const { content } = req.body as { content: string };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const stream = await openai.chat.completions.create({
    model: "gpt-5.1",
    max_completion_tokens: 1024,
    messages: [
      {
        role: "system",
        content: "You are an expert coding tutor. Give clear, helpful, concise answers.",
      },
      { role: "user", content },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
