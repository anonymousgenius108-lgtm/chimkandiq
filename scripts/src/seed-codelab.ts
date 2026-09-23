import { db } from "@workspace/db";
import { codelabProblemsTable, codelabSubmissionsTable } from "@workspace/db";

export async function seedCodelab() {
  await db.delete(codelabSubmissionsTable);
  await db.delete(codelabProblemsTable);

  const problems = [
    {
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "easy",
      subject: "Arrays",
      description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

**Example:**
\`\`\`
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9
\`\`\`

**Constraints:**
- 2 ≤ nums.length ≤ 10⁴
- -10⁹ ≤ nums[i] ≤ 10⁹`,
      starterCode: `def two_sum(nums, target):
    # Your solution here
    pass

# Test
print(two_sum([2, 7, 11, 15], 9))
`,
      solutionCode: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
`,
      testCases: JSON.stringify([
        { input: "[2, 7, 11, 15], 9", expected: "[0, 1]", label: "Basic case" },
        { input: "[3, 2, 4], 6", expected: "[1, 2]", label: "Non-first elements" },
        { input: "[3, 3], 6", expected: "[0, 1]", label: "Duplicate values" },
      ]),
      hints: JSON.stringify([
        "Think about using a hash map to store values you've already seen.",
        "For each number, calculate what complement you need. Have you seen it before?",
        "A single pass with a dictionary tracking index → value is O(n).",
      ]),
      tags: ["arrays", "hash-map", "interview"],
    },
    {
      title: "Fibonacci Number",
      slug: "fibonacci",
      difficulty: "easy",
      subject: "Recursion",
      description: `The **Fibonacci numbers** form a sequence where each number is the sum of the two preceding ones, starting from 0 and 1.

F(0) = 0, F(1) = 1
F(n) = F(n-1) + F(n-2)

Given \`n\`, calculate F(n).

**Example:**
\`\`\`
Input: n = 5
Output: 5
Explanation: 0 → 1 → 1 → 2 → 3 → 5
\`\`\``,
      starterCode: `def fibonacci(n):
    # Your solution here
    pass

print(fibonacci(5))
`,
      solutionCode: `def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b
`,
      testCases: JSON.stringify([
        { input: "0", expected: "0", label: "F(0) = 0" },
        { input: "1", expected: "1", label: "F(1) = 1" },
        { input: "5", expected: "5", label: "F(5) = 5" },
        { input: "10", expected: "55", label: "F(10) = 55" },
      ]),
      hints: JSON.stringify([
        "Start with the base cases: F(0) = 0 and F(1) = 1.",
        "Recursion works but may be slow. Can you use iteration instead?",
        "Try maintaining two variables: previous and current, updating them in a loop.",
      ]),
      tags: ["recursion", "dynamic-programming", "math"],
    },
    {
      title: "Valid Palindrome",
      slug: "valid-palindrome",
      difficulty: "easy",
      subject: "Strings",
      description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.

**Example:**
\`\`\`
Input: "A man, a plan, a canal: Panama"
Output: true
\`\`\``,
      starterCode: `def is_palindrome(s):
    # Your solution here
    pass

print(is_palindrome("racecar"))
`,
      solutionCode: `def is_palindrome(s):
    cleaned = [c.lower() for c in s if c.isalnum()]
    return cleaned == cleaned[::-1]
`,
      testCases: JSON.stringify([
        { input: "racecar", expected: "true", label: "Simple palindrome" },
        { input: "hello", expected: "false", label: "Not a palindrome" },
        { input: "madam", expected: "true", label: "Classic palindrome" },
      ]),
      hints: JSON.stringify([
        "First, clean the string by keeping only alphanumeric characters and converting to lowercase.",
        "After cleaning, compare the string with its reverse.",
        "Two-pointer approach: compare characters from both ends moving inward.",
      ]),
      tags: ["strings", "two-pointers"],
    },
    {
      title: "Maximum Subarray",
      slug: "maximum-subarray",
      difficulty: "medium",
      subject: "Arrays",
      description: `Given an integer array \`nums\`, find the **contiguous subarray** (containing at least one number) which has the **largest sum** and return its sum.

**Example:**
\`\`\`
Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6
Explanation: [4, -1, 2, 1] has the largest sum = 6
\`\`\`

**Follow up:** Try to solve it with O(n) time complexity (Kadane's Algorithm).`,
      starterCode: `def max_subarray(nums):
    # Your solution here
    pass

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))
`,
      solutionCode: `def max_subarray(nums):
    max_sum = cur = nums[0]
    for n in nums[1:]:
        cur = max(n, cur + n)
        max_sum = max(max_sum, cur)
    return max_sum
`,
      testCases: JSON.stringify([
        { input: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", expected: "6", label: "Mixed positive/negative" },
        { input: "[1]", expected: "1", label: "Single element" },
        { input: "[5, 4, -1, 7, 8]", expected: "23", label: "Mostly positive" },
      ]),
      hints: JSON.stringify([
        "Kadane's Algorithm: at each position, decide whether to extend the current subarray or start fresh.",
        "Keep track of the current subarray sum and the maximum seen so far.",
        "If adding the current element makes the sum worse than starting over, start over from here.",
      ]),
      tags: ["arrays", "dynamic-programming", "kadane"],
    },
    {
      title: "Valid Anagram",
      slug: "valid-anagram",
      difficulty: "easy",
      subject: "Strings",
      description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word using all the original letters exactly once.

**Example:**
\`\`\`
Input: s = "anagram", t = "nagaram"
Output: true

Input: s = "rat", t = "car"
Output: false
\`\`\``,
      starterCode: `def is_anagram(s, t):
    # Your solution here
    pass

print(is_anagram("anagram", "nagaram"))
`,
      solutionCode: `def is_anagram(s, t):
    return sorted(s) == sorted(t)
`,
      testCases: JSON.stringify([
        { input: '"anagram", "nagaram"', expected: "true", label: "Valid anagram" },
        { input: '"rat", "car"', expected: "false", label: "Not an anagram" },
        { input: '"listen", "silent"', expected: "true", label: "Classic anagram" },
      ]),
      hints: JSON.stringify([
        "Two strings are anagrams if they contain the same characters with the same frequencies.",
        "Sorting both strings and comparing is a simple O(n log n) approach.",
        "For O(n), use a hash map / Counter to count character frequencies in both strings.",
      ]),
      tags: ["strings", "hash-map", "sorting"],
    },
    {
      title: "Reverse String",
      slug: "reverse-string",
      difficulty: "easy",
      subject: "Strings",
      description: `Write a function that reverses a string. The input is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with O(1) extra memory.

**Example:**
\`\`\`
Input: ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
\`\`\``,
      starterCode: `def reverse(s):
    # Return the reversed string
    pass

print(reverse("hello"))
`,
      solutionCode: `def reverse(s):
    return s[::-1]
`,
      testCases: JSON.stringify([
        { input: "hello", expected: "olleh", label: "Basic reverse" },
        { input: "Hannah", expected: "hannaH", label: "Case preserved" },
        { input: "a", expected: "a", label: "Single character" },
      ]),
      hints: JSON.stringify([
        "Python slicing with [::-1] is the simplest approach.",
        "Two-pointer: swap characters at opposite ends, moving inward.",
        "A stack can also reverse order — push all chars, then pop them.",
      ]),
      tags: ["strings", "two-pointers"],
    },
    {
      title: "Factorial",
      slug: "factorial",
      difficulty: "easy",
      subject: "Math",
      description: `Given a non-negative integer \`n\`, return its **factorial**.

The factorial of \`n\` is defined as:
- factorial(0) = 1
- factorial(n) = n × factorial(n-1) for n > 0

**Example:**
\`\`\`
Input: 5
Output: 120
Explanation: 5! = 5 × 4 × 3 × 2 × 1 = 120
\`\`\``,
      starterCode: `def factorial(n):
    # Your solution here
    pass

print(factorial(5))
`,
      solutionCode: `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
`,
      testCases: JSON.stringify([
        { input: "0", expected: "1", label: "0! = 1" },
        { input: "1", expected: "1", label: "1! = 1" },
        { input: "5", expected: "120", label: "5! = 120" },
        { input: "7", expected: "5040", label: "7! = 5040" },
      ]),
      hints: JSON.stringify([
        "Handle the base case first: 0! = 1.",
        "Recursion: factorial(n) = n * factorial(n - 1).",
        "Alternatively, use a loop multiplying from 1 to n.",
      ]),
      tags: ["math", "recursion"],
    },
    {
      title: "Count Vowels",
      slug: "count-vowels",
      difficulty: "easy",
      subject: "Strings",
      description: `Write a function that counts the number of **vowels** (a, e, i, o, u — both uppercase and lowercase) in a given string.

**Example:**
\`\`\`
Input: "Hello World"
Output: 3
\`\`\``,
      starterCode: `def count_vowels(s):
    # Your solution here
    pass

print(count_vowels("Hello World"))
`,
      solutionCode: `def count_vowels(s):
    return sum(1 for c in s if c.lower() in 'aeiou')
`,
      testCases: JSON.stringify([
        { input: "Hello World", expected: "3", label: "Mixed case" },
        { input: "aeiou", expected: "5", label: "All vowels" },
        { input: "xyz", expected: "0", label: "No vowels" },
      ]),
      hints: JSON.stringify([
        "Iterate over each character and check if it's a vowel (a, e, i, o, u).",
        "Remember to handle both uppercase and lowercase by converting to lowercase first.",
        "Python's `in` operator with a string set is concise: `c.lower() in 'aeiou'`.",
      ]),
      tags: ["strings", "iteration"],
    },
  ];

  await db.insert(codelabProblemsTable).values(problems);

  // Seed some solved submissions for Alex
  const insertedProblems = await db.select().from(codelabProblemsTable);
  const bySlug = Object.fromEntries(insertedProblems.map((p) => [p.slug, p]));

  await db.insert(codelabSubmissionsTable).values([
    {
      problemId: bySlug["two-sum"].id,
      userName: "alex_morgan",
      code: `def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i`,
      language: "python",
      passed: true,
      passedCount: 3,
      totalCount: 3,
      output: "Basic case: PASS\nNon-first elements: PASS\nDuplicate values: PASS",
    },
    {
      problemId: bySlug["fibonacci"].id,
      userName: "alex_morgan",
      code: `def fibonacci(n):\n    if n <= 1: return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b`,
      language: "python",
      passed: true,
      passedCount: 4,
      totalCount: 4,
      output: "All tests passed",
    },
    {
      problemId: bySlug["reverse-string"].id,
      userName: "alex_morgan",
      code: `def reverse(s):\n    return s[::-1]`,
      language: "python",
      passed: true,
      passedCount: 3,
      totalCount: 3,
      output: "All tests passed",
    },
  ]);

  console.log("CodeLab seeded: 8 problems, 3 solved submissions for Alex");
}
