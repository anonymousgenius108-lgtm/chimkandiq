import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import {
  useGetRoomMessages,
  useSendRoomMessage,
  useGetRoomMembers,
  useJoinStudyRoom,
  useLeaveStudyRoom,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  Mic, MicOff, Video, VideoOff, Monitor, Hand, Smile, Users,
  MessageSquare, Pencil, PhoneOff, MoreVertical, X, Send,
  Lock, Wifi, Settings, ChevronLeft, Crown, Shield, Zap,
  Volume2, Camera, Share2, Grid, Bot, FileText, Clock,
  CheckCircle2, AlertCircle, BookOpen, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

const ME = {
  userName: "alex_morgan",
  displayName: "Alex Morgan",
  avatarUrl: "https://i.pravatar.cc/200?img=5",
};

const DEMO_PARTICIPANTS = [
  { id: "p1", userName: "priya_sharma",  displayName: "Priya Sharma",  avatarUrl: "https://i.pravatar.cc/200?img=23", role: "host",   isMuted: false, isCameraOff: false, isHandRaised: false },
  { id: "p2", userName: "carlos_mendez", displayName: "Carlos Mendez", avatarUrl: "https://i.pravatar.cc/200?img=51", role: "member", isMuted: true,  isCameraOff: false, isHandRaised: true  },
  { id: "p3", userName: "hana_mori",     displayName: "Hana Mori",     avatarUrl: "https://i.pravatar.cc/200?img=24", role: "member", isMuted: false, isCameraOff: true,  isHandRaised: false },
  { id: "p4", userName: "tom_bridges",   displayName: "Tom Bridges",   avatarUrl: "https://i.pravatar.cc/200?img=8",  role: "member", isMuted: true,  isCameraOff: true,  isHandRaised: false },
  { id: "p5", userName: "zara_khan",     displayName: "Zara Khan",     avatarUrl: "https://i.pravatar.cc/200?img=26", role: "member", isMuted: false, isCameraOff: false, isHandRaised: false },
];

const AI_SUMMARY = {
  classTitle: "Python Functions & Recursion Deep Dive",
  duration: "58 min",
  participants: 6,
  keyPoints: [
    "Difference between recursive and iterative approaches to tree traversal",
    "Base cases are critical — always define termination conditions first",
    "Stack overflow risk when recursion depth exceeds system limit",
    "Memoization dramatically improves recursive Fibonacci performance",
    "Tail recursion optimization and when Python supports it (hint: it doesn't natively)",
  ],
  homework: [
    "Implement binary search both recursively and iteratively",
    "Solve LeetCode #206 Reverse Linked List using recursion",
    "Write a memoized solution for Climbing Stairs problem",
  ],
  questionsDiscussed: [
    "Why does Python not optimize tail calls?",
    "When should you prefer iteration over recursion?",
    "How to convert any recursive function to iterative?",
  ],
  weakTopics: ["Memoization", "Stack overflow prevention", "Tail recursion"],
  attendance: [
    { name: "Alex Morgan",   time: "58m", score: 95 },
    { name: "Priya Sharma",  time: "58m", score: 98 },
    { name: "Carlos Mendez", time: "45m", score: 77 },
    { name: "Hana Mori",     time: "58m", score: 90 },
    { name: "Tom Bridges",   time: "30m", score: 52 },
    { name: "Zara Khan",     time: "55m", score: 94 },
  ],
};

type Sidebar = "chat" | "participants" | "summary" | null;

// ── Whiteboard canvas ──────────────────────────────────────────────────────────
function Whiteboard({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#6366f1");
  const [size, setSize] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function getPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.lineWidth = tool === "eraser" ? 20 : size;
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function onMouseUp() { drawing.current = false; }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const colors = ["#6366f1", "#ef4444", "#f59e0b", "#22c55e", "#0ea5e9", "#000000"];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b flex items-center gap-3 px-4 py-2 flex-shrink-0">
        <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
          <Pencil className="w-4 h-4 text-primary" /> Whiteboard
        </span>
        <div className="h-5 w-px bg-border" />
        {["pen", "eraser"].map((t) => (
          <button
            key={t}
            onClick={() => setTool(t as "pen" | "eraser")}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${tool === t ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >
            {t}
          </button>
        ))}
        <div className="h-5 w-px bg-border" />
        <div className="flex gap-1.5">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => { setTool("pen"); setColor(c); }}
              className={`w-5 h-5 rounded-full transition-transform ${color === c && tool === "pen" ? "scale-125 ring-2 ring-offset-1 ring-primary" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="h-5 w-px bg-border" />
        <input type="range" min={1} max={12} value={size} onChange={(e) => setSize(+e.target.value)} className="w-20 accent-primary" />
        <span className="text-xs text-muted-foreground">{size}px</span>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={clearCanvas}>Clear</Button>
          <Button size="sm" variant="destructive" onClick={onClose} className="gap-1"><X className="w-3.5 h-3.5" /> Close</Button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="flex-1 bg-white cursor-crosshair w-full"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />
    </div>
  );
}

// ── Participant tile ───────────────────────────────────────────────────────────
function ParticipantTile({
  participant, isSelf = false, isSpeaking = false
}: {
  participant: { displayName: string; avatarUrl: string; role: string; isMuted: boolean; isCameraOff: boolean; isHandRaised: boolean };
  isSelf?: boolean;
  isSpeaking?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-800 aspect-video flex items-center justify-center group transition-all ${isSpeaking ? "ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]" : ""}`}>
      {/* "Video" bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />

      {/* Avatar / camera-off */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className={`rounded-full overflow-hidden ring-2 ${isSpeaking ? "ring-emerald-400" : "ring-white/20"}`} style={{ width: "clamp(40px,8vw,72px)", height: "clamp(40px,8vw,72px)" }}>
          <img src={participant.avatarUrl} alt={participant.displayName} className="w-full h-full object-cover" />
        </div>
        {participant.isCameraOff && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <VideoOff className="w-3 h-3 text-rose-400" />
          </div>
        )}
      </div>

      {/* Name bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2 flex items-center justify-between">
        <span className="text-white text-[11px] font-semibold truncate flex items-center gap-1">
          {participant.isHandRaised && <span>✋</span>}
          {isSelf ? `${participant.displayName} (You)` : participant.displayName}
          {participant.role === "host" && <Crown className="w-3 h-3 text-amber-400 ml-0.5" />}
        </span>
        {participant.isMuted
          ? <MicOff className="w-3 h-3 text-rose-400 flex-shrink-0" />
          : <Mic className="w-3 h-3 text-emerald-400 flex-shrink-0" />
        }
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function StudyRoomDetail() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId ?? "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  // Meeting state machine: waiting → active → ended
  const [phase, setPhase] = useState<"waiting" | "active" | "ended">("waiting");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [sidebar, setSidebar] = useState<Sidebar>(null);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [speakingIdx, setSpeakingIdx] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulate "speaking" cycling
  useEffect(() => {
    if (phase !== "active") return;
    const t = setInterval(() => setSpeakingIdx((i) => (i + 1) % (DEMO_PARTICIPANTS.length + 1)), 3000);
    return () => clearInterval(t);
  }, [phase]);

  const joinMutation = useJoinStudyRoom();
  const leaveMutation = useLeaveStudyRoom();
  const sendMutation = useSendRoomMessage();

  const isActive = phase === "active";

  const { data: messages = [] } = useGetRoomMessages(roomId, {
    query: { queryKey: ["getRoomMessages", roomId], enabled: isActive, refetchInterval: 3000 },
  });

  const { data: members = [] } = useGetRoomMembers(roomId, {
    query: { queryKey: ["getRoomMembers", roomId], enabled: isActive, refetchInterval: 5000 },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleJoin() {
    joinMutation.mutate({ roomId, data: {} }, {
      onSuccess: () => {
        setPhase("active");
        setSidebar("chat");
        toast({ title: "You joined the room!", description: "Mic and camera are on." });
      },
      onError: () => toast({ title: "Failed to join", variant: "destructive" }),
    });
  }

  function handleLeave() {
    leaveMutation.mutate({ roomId }, {
      onSuccess: () => {
        setPhase("ended");
        setSidebar("summary");
      },
    });
  }

  function handleSendMessage() {
    const content = chatMsg.trim();
    if (!content) return;
    sendMutation.mutate(
      { roomId, data: { content } },
      {
        onSuccess: () => {
          setChatMsg("");
          qc.invalidateQueries({ queryKey: ["getRoomMessages", roomId] });
        },
      },
    );
  }

  const allParticipants = [
    { ...ME, role: "member", isMuted: !micOn, isCameraOff: !camOn, isHandRaised: handRaised },
    ...DEMO_PARTICIPANTS,
  ];

  // ── WAITING ROOM ──────────────────────────────────────────────────────────────
  if (phase === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Back */}
          <button onClick={() => setLocation("/study-rooms")} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to rooms
          </button>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-white text-center space-y-6">
            {/* Room info */}
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto">
                <Video className="w-8 h-8 text-blue-300" />
              </div>
              <h1 className="text-2xl font-black">Waiting Room</h1>
              <p className="text-white/60 text-sm">Get ready before entering the session</p>
            </div>

            {/* Camera preview (avatar simulation) */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-800/80 border border-white/10 aspect-video flex items-center justify-center mx-auto max-w-xs">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <img src={ME.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-400/40" />
                <div className="text-sm font-semibold">{ME.displayName}</div>
              </div>
              {/* Mic/cam status */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${micOn ? "bg-white/20" : "bg-rose-500"}`}>
                  {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${camOn ? "bg-white/20" : "bg-rose-500"}`}>
                  {camOn ? <Camera className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {/* Check items */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: "Microphone",   ok: micOn,   icon: Mic    },
                { label: "Camera",       ok: camOn,   icon: Camera },
                { label: "Internet",     ok: true,    icon: Wifi   },
                { label: "Audio output", ok: true,    icon: Volume2},
              ].map(({ label, ok, icon: Icon }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${ok ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
                  {ok
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    : <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  }
                  <span className="text-white/80 text-xs">{label}</span>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? "bg-white/10 hover:bg-white/20" : "bg-rose-500 hover:bg-rose-600"}`}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setCamOn(!camOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${camOn ? "bg-white/10 hover:bg-white/20" : "bg-rose-500 hover:bg-rose-600"}`}
              >
                {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Info row */}
            <div className="flex items-center justify-center gap-4 text-white/50 text-xs">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> End-to-end encrypted</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure session</span>
            </div>

            <Button
              onClick={handleJoin}
              disabled={joinMutation.isPending}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base gap-2"
            >
              {joinMutation.isPending ? "Joining…" : (
                <><Video className="w-5 h-5" /> Join Now</>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── ENDED / AI SUMMARY ────────────────────────────────────────────────────────
  if (phase === "ended") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center text-white">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black mb-1">Session Ended</h1>
            <p className="text-white/50 text-sm">AI has generated your class summary</p>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6 text-white space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI Class Summary</span>
                </div>
                <h2 className="font-bold text-lg">{AI_SUMMARY.classTitle}</h2>
              </div>
              <div className="flex gap-3 text-center text-xs text-white/50 flex-shrink-0">
                <div><div className="font-bold text-white text-lg">{AI_SUMMARY.duration}</div>Duration</div>
                <div><div className="font-bold text-white text-lg">{AI_SUMMARY.participants}</div>Attended</div>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Key Points */}
            <div>
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Key Points Covered</h3>
              <ul className="space-y-1.5">
                {AI_SUMMARY.keyPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Homework */}
            <div>
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Homework / Next Steps</h3>
              <ul className="space-y-1.5">
                {AI_SUMMARY.homework.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-amber-400">{i + 1}</span>
                    </div>
                    <span className="text-white/80">{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weak topics */}
            <div>
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Topics Needing More Practice</h3>
              <div className="flex flex-wrap gap-2">
                {AI_SUMMARY.weakTopics.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-300">{t}</span>
                ))}
              </div>
            </div>

            {/* Attendance */}
            <div>
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Attendance</h3>
              <div className="space-y-1.5">
                {AI_SUMMARY.attendance.map((a) => (
                  <div key={a.name} className="flex items-center gap-3 text-sm">
                    <span className="text-white/70 flex-1">{a.name}</span>
                    <span className="text-white/40 text-xs">{a.time}</span>
                    <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${a.score}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-8 text-right ${a.score >= 80 ? "text-emerald-400" : a.score >= 60 ? "text-amber-400" : "text-rose-400"}`}>{a.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setLocation("/study-rooms")} className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
              Back to Rooms
            </Button>
            <Button onClick={() => setLocation("/dashboard")} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white gap-2">
              <BookOpen className="w-4 h-4" /> Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE MEETING ────────────────────────────────────────────────────────────
  const sidebarWidth = sidebar ? "320px" : "0px";

  return (
    <div className="fixed inset-0 z-40 bg-slate-900 flex flex-col overflow-hidden select-none">
      {whiteboardOpen && <Whiteboard onClose={() => setWhiteboardOpen(false)} />}

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-800/80 backdrop-blur border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-white font-bold text-sm">Live Session</span>
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
            <Hash className="w-3 h-3 text-white/50" />
            <span className="text-xs font-mono text-white/70">EDUC01</span>
          </div>
          {recording && (
            <Badge className="bg-rose-600 text-white text-[10px] animate-pulse">⏺ REC</Badge>
          )}
          {screenSharing && (
            <Badge className="bg-blue-600 text-white text-[10px]">📺 Sharing</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>00:12:34</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Good</span>
          </div>
          <button className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main area: video grid + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 overflow-hidden p-4 transition-all duration-300">
          <div className={`h-full grid gap-3 ${
            allParticipants.length <= 1 ? "grid-cols-1" :
            allParticipants.length <= 2 ? "grid-cols-2" :
            allParticipants.length <= 4 ? "grid-cols-2 grid-rows-2" :
            "grid-cols-3 grid-rows-2"
          }`}>
            {allParticipants.map((p, i) => (
              <ParticipantTile
                key={p.userName}
                participant={p}
                isSelf={p.userName === ME.userName}
                isSpeaking={i === speakingIdx}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div
          className="bg-slate-800 border-l border-white/5 flex flex-col overflow-hidden transition-all duration-300 flex-shrink-0"
          style={{ width: sidebarWidth }}
        >
          {sidebar && (
            <>
              {/* Sidebar tabs */}
              <div className="flex items-center border-b border-white/5 flex-shrink-0">
                {(["chat", "participants", "summary"] as Sidebar[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSidebar(tab)}
                    className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${sidebar === tab ? "text-white border-b-2 border-blue-400" : "text-white/40 hover:text-white/70"}`}
                  >
                    {tab === "chat" && "Chat"}
                    {tab === "participants" && `People (${allParticipants.length})`}
                    {tab === "summary" && "AI Notes"}
                  </button>
                ))}
                <button onClick={() => setSidebar(null)} className="px-3 py-3 text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat */}
              {sidebar === "chat" && (
                <>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {(messages as Array<{ id: string; userName: string; displayName: string; avatarUrl?: string | null; content: string; type: string; createdAt: string }>).map((m) => (
                      <div key={m.id} className={`flex gap-2 ${m.userName === ME.userName ? "flex-row-reverse" : ""}`}>
                        {m.type === "system"
                          ? <p className="w-full text-center text-[11px] text-white/30 italic">{m.content}</p>
                          : (
                            <>
                              <img src={m.avatarUrl ?? "https://i.pravatar.cc/40"} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
                              <div className={`max-w-[75%] ${m.userName === ME.userName ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                                <span className="text-[10px] text-white/40">{m.displayName}</span>
                                <div className={`px-3 py-2 rounded-2xl text-sm text-white ${m.userName === ME.userName ? "bg-blue-600 rounded-tr-sm" : "bg-white/10 rounded-tl-sm"}`}>
                                  {m.content}
                                </div>
                              </div>
                            </>
                          )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-3 border-t border-white/5 flex-shrink-0">
                    <div className="flex gap-2">
                      <input
                        value={chatMsg}
                        onChange={(e) => setChatMsg(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="Message everyone…"
                        className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatMsg.trim() || sendMutation.isPending}
                        className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Participants */}
              {sidebar === "participants" && (
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {allParticipants.map((p) => (
                    <div key={p.userName} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="relative flex-shrink-0">
                        <img src={p.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        {p.isHandRaised && <span className="absolute -top-1 -right-1 text-[10px]">✋</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium truncate flex items-center gap-1">
                          {p.userName === ME.userName ? `${p.displayName} (You)` : p.displayName}
                          {p.role === "host" && <Crown className="w-3 h-3 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-white/40 capitalize">{p.role}</div>
                      </div>
                      <div className="flex gap-1">
                        {p.isMuted
                          ? <MicOff className="w-3.5 h-3.5 text-rose-400" />
                          : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                        {p.isCameraOff
                          ? <VideoOff className="w-3.5 h-3.5 text-rose-400" />
                          : <Video className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Notes */}
              {sidebar === "summary" && (
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI is taking notes in real-time…</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">Key Points So Far</h4>
                    {AI_SUMMARY.keyPoints.slice(0, 3).map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                        {p}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">Questions Discussed</h4>
                    {AI_SUMMARY.questionsDiscussed.slice(0, 2).map((q, i) => (
                      <div key={i} className="text-xs text-white/60 bg-white/5 rounded-lg px-2.5 py-1.5">❓ {q}</div>
                    ))}
                  </div>
                  <p className="text-[11px] text-white/30 italic text-center">Full summary available when session ends</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Control bar */}
      <div className="flex-shrink-0 bg-slate-800/90 backdrop-blur border-t border-white/5 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            <CtrlBtn
              active={micOn}
              activeIcon={<Mic className="w-5 h-5" />}
              inactiveIcon={<MicOff className="w-5 h-5" />}
              label={micOn ? "Mute" : "Unmute"}
              onClick={() => setMicOn(!micOn)}
              danger={!micOn}
            />
            <CtrlBtn
              active={camOn}
              activeIcon={<Video className="w-5 h-5" />}
              inactiveIcon={<VideoOff className="w-5 h-5" />}
              label={camOn ? "Stop Video" : "Start Video"}
              onClick={() => setCamOn(!camOn)}
              danger={!camOn}
            />
            <CtrlBtn
              active={screenSharing}
              activeIcon={<Monitor className="w-5 h-5" />}
              inactiveIcon={<Monitor className="w-5 h-5" />}
              label="Share"
              onClick={() => { setScreenSharing(!screenSharing); toast({ title: screenSharing ? "Screen share stopped" : "Screen share started (demo)" }); }}
              highlight={screenSharing}
            />
          </div>

          {/* Center controls */}
          <div className="flex items-center gap-2">
            <CtrlBtn
              active={handRaised}
              activeIcon={<Hand className="w-5 h-5" />}
              inactiveIcon={<Hand className="w-5 h-5" />}
              label="Hand"
              onClick={() => { setHandRaised(!handRaised); toast({ title: handRaised ? "Hand lowered" : "✋ Hand raised" }); }}
              highlight={handRaised}
            />
            <CtrlBtn
              active={false}
              activeIcon={<Smile className="w-5 h-5" />}
              inactiveIcon={<Smile className="w-5 h-5" />}
              label="React"
              onClick={() => toast({ title: "👍 Reaction sent!" })}
            />
            <CtrlBtn
              active={whiteboardOpen}
              activeIcon={<Pencil className="w-5 h-5" />}
              inactiveIcon={<Pencil className="w-5 h-5" />}
              label="Board"
              onClick={() => setWhiteboardOpen(!whiteboardOpen)}
              highlight={whiteboardOpen}
            />
            <CtrlBtn
              active={recording}
              activeIcon={<div className="w-3.5 h-3.5 rounded-full bg-rose-500" />}
              inactiveIcon={<div className="w-3.5 h-3.5 rounded-full border-2 border-current" />}
              label="Record"
              onClick={() => { setRecording(!recording); toast({ title: recording ? "Recording stopped" : "⏺ Recording started" }); }}
              highlight={recording}
            />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <SidebarBtn icon={<Users className="w-5 h-5" />} label="People" active={sidebar === "participants"} onClick={() => setSidebar(sidebar === "participants" ? null : "participants")} badge={allParticipants.length} />
            <SidebarBtn icon={<MessageSquare className="w-5 h-5" />} label="Chat" active={sidebar === "chat"} onClick={() => setSidebar(sidebar === "chat" ? null : "chat")} badge={messages.length > 0 ? messages.length : undefined} />
            <SidebarBtn icon={<Bot className="w-5 h-5" />} label="AI Notes" active={sidebar === "summary"} onClick={() => setSidebar(sidebar === "summary" ? null : "summary")} />

            <button
              onClick={handleLeave}
              className="flex flex-col items-center gap-1 group ml-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 flex items-center justify-center transition-colors shadow-lg shadow-rose-500/30">
                <PhoneOff className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] text-white/50 group-hover:text-rose-400 transition-colors">Leave</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper button components ───────────────────────────────────────────────────
function CtrlBtn({ active, activeIcon, inactiveIcon, label, onClick, danger = false, highlight = false }: {
  active: boolean; activeIcon: React.ReactNode; inactiveIcon: React.ReactNode;
  label: string; onClick: () => void; danger?: boolean; highlight?: boolean;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
        danger ? "bg-rose-600 hover:bg-rose-500 text-white" :
        highlight ? "bg-blue-600 hover:bg-blue-500 text-white" :
        "bg-white/10 hover:bg-white/20 text-white"
      }`}>
        {active ? activeIcon : inactiveIcon}
      </div>
      <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">{label}</span>
    </button>
  );
}

function SidebarBtn({ icon, label, active, onClick, badge }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group relative">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${active ? "bg-blue-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"}`}>
        {icon}
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center px-1">{badge}</span>
        )}
      </div>
      <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">{label}</span>
    </button>
  );
}
