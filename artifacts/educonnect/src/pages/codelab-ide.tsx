import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "wouter";
import {
  useGetCodelabProblem,
  useRunCodelabCode,
  useSubmitCodelabCode,
} from "@workspace/api-client-react";
import {
  Play,
  Send,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Bot,
  User,
  Loader2,
  ArrowLeft,
  BookOpen,
  Terminal,
  ChevronDown,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-800 border-emerald-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  hard: "bg-red-100 text-red-800 border-red-200",
};

interface Language {
  id: string;
  label: string;
  ext: string;
  icon: string;
  color: string;
  getStarter: (slug: string) => string;
}

const LANGUAGES: Language[] = [
  {
    id: "python",
    label: "Python",
    ext: ".py",
    icon: "🐍",
    color: "#3572A5",
    getStarter: () => "",
  },
  {
    id: "javascript",
    label: "JavaScript",
    ext: ".js",
    icon: "🟨",
    color: "#f1e05a",
    getStarter: (slug) =>
      `// ${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}\n\nfunction solution(input) {\n  // Your solution here\n}\n\n// Test\nconsole.log(solution(/* args */));`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    ext: ".ts",
    icon: "🔷",
    color: "#2b7489",
    getStarter: (slug) =>
      `// ${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}\n\nfunction solution(input: any): any {\n  // Your solution here\n}\n\n// Test\nconsole.log(solution(/* args */));`,
  },
  {
    id: "java",
    label: "Java",
    ext: ".java",
    icon: "☕",
    color: "#b07219",
    getStarter: (slug) => {
      const cls = slug.replace(/-/g, "_").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/_/g, "");
      return `public class ${cls} {\n    public static void main(String[] args) {\n        // Test your solution\n        System.out.println(solution(/* args */));\n    }\n\n    public static Object solution(Object input) {\n        // Your solution here\n        return null;\n    }\n}`;
    },
  },
  {
    id: "cpp",
    label: "C++",
    ext: ".cpp",
    icon: "⚙️",
    color: "#f34b7d",
    getStarter: (slug) =>
      `#include <bits/stdc++.h>\nusing namespace std;\n\n// ${slug.replace(/-/g, " ")}\nauto solution(auto input) {\n    // Your solution here\n    return input;\n}\n\nint main() {\n    // Test\n    cout << "Output: " << endl;\n    return 0;\n}`,
  },
  {
    id: "html",
    label: "HTML/CSS/JS",
    ext: ".html",
    icon: "🌐",
    color: "#e34c26",
    getStarter: () =>
      `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Solution</title>\n  <style>\n    body { font-family: sans-serif; padding: 2rem; }\n    /* Your styles here */\n  </style>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <!-- Your HTML here -->\n  <script>\n    // Your JavaScript here\n  </script>\n</body>\n</html>`,
  },
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative h-full font-mono text-sm">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className={cn(
          "w-full h-full resize-none bg-[#1e1e2e] text-[#cdd6f4] p-4",
          "border-0 outline-none focus:outline-none focus:ring-0",
          "font-mono text-sm leading-6"
        )}
        style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const newVal = value.substring(0, start) + "    " + value.substring(end);
            onChange(newVal);
            setTimeout(() => {
              e.currentTarget.selectionStart = start + 4;
              e.currentTarget.selectionEnd = start + 4;
            }, 0);
          }
        }}
      />
    </div>
  );
}

export default function CodelabIde() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: problem, isLoading } = useGetCodelabProblem(slug);

  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState<"problem" | "output">("problem");
  const [hintShown, setHintShown] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  const [isHintStreaming, setIsHintStreaming] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const runMutation = useRunCodelabCode();
  const submitMutation = useSubmitCodelabCode();

  useEffect(() => {
    if (problem && !code) {
      setCode(problem.starterCode);
    }
  }, [problem]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  function switchLanguage(lang: Language) {
    setLanguage(lang);
    const starter = lang.id === "python" ? (problem?.starterCode ?? "") : lang.getStarter(slug);
    setCode(starter);
    runMutation.reset();
    submitMutation.reset();
  }

  const handleRun = () => {
    if (!code.trim()) return;
    setActiveTab("output");
    runMutation.mutate({ slug, data: { code, language: language.id } });
  };

  const handleSubmit = () => {
    if (!code.trim()) return;
    setActiveTab("output");
    submitMutation.mutate({ slug, data: { code, language: language.id } });
  };

  const handleReset = () => {
    const starter = language.id === "python" ? (problem?.starterCode ?? "") : language.getStarter(slug);
    setCode(starter);
    runMutation.reset();
    submitMutation.reset();
  };

  const streamFromSSE = useCallback(
    async (
      url: string,
      body: Record<string, unknown>,
      onChunk: (content: string) => void,
      onDone: () => void
    ) => {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.body) return;
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6)) as { content?: string; done?: boolean };
              if (parsed.content) onChunk(parsed.content);
              if (parsed.done) onDone();
            } catch {
              // ignore
            }
          }
        }
      }
      onDone();
    },
    []
  );

  const handleGetHint = async () => {
    if (!problem || isHintStreaming) return;
    setShowChat(true);
    setIsHintStreaming(true);

    const userMsg: ChatMessage = {
      role: "user",
      content: code.trim()
        ? `Give me a hint for my current ${language.label} code:\n\`\`\`${language.id}\n${code}\n\`\`\``
        : `I need a hint to get started with "${problem.title}" in ${language.label}.`,
    };
    const assistantMsg: ChatMessage = { role: "assistant", content: "", streaming: true };
    setChatMessages((prev) => [...prev, userMsg, assistantMsg]);

    await streamFromSSE(
      `/api/codelab/problems/${slug}/hint`,
      { code, language: language.id },
      (chunk) => {
        setChatMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: m.content + chunk } : m))
        );
      },
      () => {
        setChatMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 ? { ...m, streaming: false } : m))
        );
        setIsHintStreaming(false);
      }
    );
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isChatStreaming) return;
    const userContent = chatInput.trim();
    setChatInput("");
    setIsChatStreaming(true);

    const userMsg: ChatMessage = { role: "user", content: userContent };
    const assistantMsg: ChatMessage = { role: "assistant", content: "", streaming: true };
    setChatMessages((prev) => [...prev, userMsg, assistantMsg]);

    const context = problem
      ? `The student is solving "${problem.title}" in ${language.label}.\nProblem: ${problem.description}\nCode:\n\`\`\`${language.id}\n${code}\n\`\`\`\n\nQuestion: ${userContent}`
      : userContent;

    await streamFromSSE(
      `/api/openai/conversations/1/messages`,
      { content: context },
      (chunk) => {
        setChatMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: m.content + chunk } : m))
        );
      },
      () => {
        setChatMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 ? { ...m, streaming: false } : m))
        );
        setIsChatStreaming(false);
      }
    );
  };

  const runResult = runMutation.data;
  const submitResult = submitMutation.data;
  const resultData = submitResult ?? runResult;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] p-4 gap-4">
        <Skeleton className="flex-1 rounded-xl" />
        <Skeleton className="flex-1 rounded-xl" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <XCircle className="h-10 w-10 mb-3 opacity-30" />
        <p>Problem not found.</p>
        <Link href="/codelab">
          <Button variant="outline" className="mt-4">Back to CodeLab</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-background flex-shrink-0">
        <Link href="/codelab">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="font-semibold text-sm">{problem.title}</span>
        <Badge className={`text-xs border capitalize ${DIFFICULTY_COLORS[problem.difficulty] ?? ""}`} variant="outline">
          {problem.difficulty}
        </Badge>

        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs ml-2">
              <span>{language.icon}</span>
              <span>{language.label}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.id}
                onClick={() => switchLanguage(lang)}
                className={cn("gap-2 text-sm", language.id === lang.id && "bg-accent")}
              >
                <span>{lang.icon}</span>
                <span>{lang.label}</span>
                {language.id === lang.id && (
                  <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChat(!showChat)}
          className={cn("gap-1.5", showChat && "bg-primary/10 text-primary border-primary/30")}
        >
          <Bot className="h-4 w-4" />
          AI Tutor
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
        <Button variant="outline" size="sm" onClick={handleRun} disabled={runMutation.isPending} className="gap-1.5">
          {runMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={submitMutation.isPending} className="gap-1.5">
          {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit
        </Button>
      </div>

      {/* Main body */}
      <div className="flex flex-1 min-h-0">
        {/* Left panel — problem + output */}
        <div className="w-[420px] flex-shrink-0 flex flex-col border-r">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "problem" | "output")}>
            <TabsList className="w-full rounded-none border-b h-10 bg-muted/40">
              <TabsTrigger value="problem" className="flex-1 gap-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5" /> Problem
              </TabsTrigger>
              <TabsTrigger value="output" className="flex-1 gap-1.5 text-xs">
                <Terminal className="h-3.5 w-3.5" /> Output
                {resultData && (
                  <span className={cn("ml-1 h-2 w-2 rounded-full", resultData.passed ? "bg-emerald-500" : "bg-red-500")} />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="problem" className="m-0 flex-1 overflow-auto">
              <ScrollArea className="h-full">
                <div className="p-5 space-y-5">
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                    {problem.description}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Test Cases
                    </h4>
                    <div className="space-y-2">
                      {problem.testCases.map((tc, i) => (
                        <div key={i} className="rounded-lg bg-muted/50 p-3 text-xs font-mono">
                          <div className="text-muted-foreground mb-1">{tc.label}</div>
                          <div><span className="text-primary">Input:</span> {tc.input}</div>
                          <div><span className="text-emerald-600">Expected:</span> {tc.expected}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {problem.hints.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Hints
                      </h4>
                      <div className="space-y-2">
                        {problem.hints.slice(0, hintShown).map((hint, i) => (
                          <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                            <span className="font-semibold">Hint {i + 1}:</span> {hint}
                          </div>
                        ))}
                        {hintShown < problem.hints.length && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50"
                            onClick={() => setHintShown(hintShown + 1)}
                          >
                            <Lightbulb className="h-3.5 w-3.5" />
                            Reveal Hint {hintShown + 1}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="output" className="m-0 overflow-auto">
              <ScrollArea className="h-full">
                <div className="p-5 space-y-4">
                  {!resultData && !runMutation.isPending && !submitMutation.isPending && (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      <Terminal className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>Run your code to see output here.</p>
                    </div>
                  )}

                  {(runMutation.isPending || submitMutation.isPending) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running tests…
                    </div>
                  )}

                  {resultData && (
                    <>
                      <div className={cn(
                        "flex items-center gap-3 rounded-xl p-4",
                        resultData.passed ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
                      )}>
                        {resultData.passed
                          ? <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                          : <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />}
                        <div>
                          <div className={cn("font-semibold text-sm", resultData.passed ? "text-emerald-800" : "text-red-800")}>
                            {resultData.passed ? "All tests passed!" : `${resultData.passedCount} / ${resultData.totalCount} tests passed`}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {submitResult ? "Submitted" : "Test run"} · {language.label}
                          </div>
                        </div>
                      </div>

                      {"results" in resultData && resultData.results.map((r: { label: string; passed: boolean; expected: string; actual: string }, i: number) => (
                        <div key={i} className={cn(
                          "rounded-lg p-3 text-xs border",
                          r.passed ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"
                        )}>
                          <div className="flex items-center gap-2 mb-1">
                            {r.passed
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                            <span className="font-medium">{r.label}</span>
                          </div>
                          {!r.passed && (
                            <div className="font-mono space-y-0.5 pl-5">
                              <div><span className="text-muted-foreground">Expected:</span> {r.expected}</div>
                              <div><span className="text-red-600">Got:</span> {r.actual}</div>
                            </div>
                          )}
                        </div>
                      ))}

                      {resultData.output && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 font-medium">Console</div>
                          <pre className="rounded-lg bg-[#1e1e2e] text-[#cdd6f4] p-3 text-xs overflow-x-auto whitespace-pre-wrap leading-5">
                            {resultData.output}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center — code editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#1e1e2e] border-b border-white/10">
            <span className="text-xs font-medium" style={{ color: language.color }}>{language.label}</span>
            <ChevronRight className="h-3 w-3 text-[#cdd6f4]/30" />
            <span className="text-xs text-[#cdd6f4]/60 font-mono">{problem.slug}{language.ext}</span>
          </div>
          <div className="flex-1 min-h-0">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </div>

        {/* Right panel — AI Tutor chat */}
        {showChat && (
          <div className="w-[340px] flex-shrink-0 flex flex-col border-l bg-background">
            <div className="flex items-center gap-2 px-4 py-3 border-b">
              <Bot className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">AI Tutor</span>
              <Badge variant="outline" className="text-xs ml-1">{language.label}</Badge>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetHint}
                disabled={isHintStreaming || isChatStreaming}
                className="text-xs gap-1.5 h-7"
              >
                <Lightbulb className="h-3 w-3" />
                Get Hint
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-muted-foreground text-xs py-8">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>Ask me anything about this problem or click "Get Hint" for a nudge.</p>
                    <p className="mt-2 opacity-70">Currently helping with: <strong>{language.label}</strong></p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      msg.role === "user" ? "bg-primary" : "bg-secondary"
                    )}>
                      {msg.role === "user"
                        ? <User className="h-3.5 w-3.5 text-primary-foreground" />
                        : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-5",
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                      {msg.streaming && (
                        <span className="inline-block w-1 h-3 bg-current animate-pulse ml-0.5 rounded-sm" />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask about ${language.label}…`}
                  className="min-h-0 h-9 resize-none text-xs py-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChat();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={handleChat}
                  disabled={isChatStreaming || !chatInput.trim()}
                >
                  {isChatStreaming
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
