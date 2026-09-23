import { useState } from "react";
import { useLocation } from "wouter";
import { useListStudyRooms, useCreateStudyRoom } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  Video, Users, Lock, Globe, Wifi, Code2, HelpCircle, BookOpen,
  Plus, Search, Clock, Star, Zap, Play, Shield, Mic, Camera,
  Presentation, Hash, ChevronRight, X, Eye, EyeOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

const ROOM_TYPES = [
  { key: "all",       label: "All Rooms",      icon: Globe           },
  { key: "live_class",label: "Live Class",     icon: Video           },
  { key: "group_study",label:"Group Study",    icon: BookOpen        },
  { key: "coding",    label: "Coding Room",    icon: Code2           },
  { key: "doubt",     label: "Doubt Solving",  icon: HelpCircle      },
  { key: "workshop",  label: "Workshop",       icon: Presentation    },
  { key: "private",   label: "Private Room",   icon: Lock            },
];

const TYPE_COLORS: Record<string, string> = {
  live_class:   "bg-rose-500/15 text-rose-700 border-rose-300",
  group_study:  "bg-blue-500/15 text-blue-700 border-blue-300",
  coding:       "bg-emerald-500/15 text-emerald-700 border-emerald-300",
  doubt:        "bg-amber-500/15 text-amber-700 border-amber-300",
  workshop:     "bg-purple-500/15 text-purple-700 border-purple-300",
  private:      "bg-slate-500/15 text-slate-700 border-slate-300",
  mentoring:    "bg-cyan-500/15 text-cyan-700 border-cyan-300",
};

const STATUS_PILL: Record<string, string> = {
  active:  "bg-emerald-500 text-white",
  waiting: "bg-amber-500 text-white",
  ended:   "bg-slate-400 text-white",
};

const DEMO_AVATARS = [
  "https://i.pravatar.cc/40?img=1",
  "https://i.pravatar.cc/40?img=2",
  "https://i.pravatar.cc/40?img=3",
  "https://i.pravatar.cc/40?img=4",
  "https://i.pravatar.cc/40?img=6",
];

function RoomCard({ room, onJoin }: { room: StudyRoomItem; onJoin: (id: string) => void }) {
  const typeColor = TYPE_COLORS[room.type] ?? TYPE_COLORS.group_study;
  const pct = Math.round((room.currentParticipants / room.maxParticipants) * 100);
  const avatarCount = Math.min(room.currentParticipants, 4);

  return (
    <div className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-200 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge className={`text-[11px] font-semibold px-2 py-0.5 border ${typeColor}`}>
              {room.type.replace("_", " ")}
            </Badge>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_PILL[room.status] ?? STATUS_PILL.waiting}`}>
              {room.status === "active" ? "🔴 LIVE" : room.status === "waiting" ? "⏳ Waiting" : "Ended"}
            </span>
            {room.hasPassword && <Lock className="w-3 h-3 text-muted-foreground" />}
          </div>
          <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2">{room.title}</h3>
          {room.subject && (
            <p className="text-xs text-muted-foreground mt-0.5">📚 {room.subject}</p>
          )}
        </div>
      </div>

      {/* Description */}
      {room.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 -mt-1">{room.description}</p>
      )}

      {/* Host */}
      <div className="flex items-center gap-2">
        <img src={room.hostAvatar ?? "https://i.pravatar.cc/40?img=1"} alt="" className="w-5 h-5 rounded-full object-cover" />
        <span className="text-xs text-muted-foreground">
          Hosted by <span className="font-medium text-foreground">{room.hostName}</span>
        </span>
      </div>

      {/* Participants */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-1.5">
            {Array.from({ length: avatarCount }).map((_, i) => (
              <img key={i} src={DEMO_AVATARS[i]} alt="" className="w-6 h-6 rounded-full ring-2 ring-background object-cover" />
            ))}
            {room.currentParticipants > 4 && (
              <div className="w-6 h-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                +{room.currentParticipants - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {room.currentParticipants}/{room.maxParticipants}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Room code + join */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5 flex-1 min-w-0">
          <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs font-mono font-bold text-foreground tracking-widest">{room.roomCode}</span>
        </div>
        <Button
          size="sm"
          className="flex-shrink-0 gap-1.5"
          onClick={() => onJoin(room.id)}
          disabled={room.status === "ended" || room.currentParticipants >= room.maxParticipants}
        >
          <Play className="w-3.5 h-3.5" />
          {room.currentParticipants >= room.maxParticipants ? "Full" : "Join"}
        </Button>
      </div>
    </div>
  );
}

interface StudyRoomItem {
  id: string;
  title: string;
  type: string;
  hostName: string;
  hostAvatar?: string | null;
  roomCode: string;
  isLocked: boolean;
  hasPassword: boolean;
  maxParticipants: number;
  currentParticipants: number;
  scheduledAt?: string | null;
  status: string;
  description?: string | null;
  subject?: string | null;
  createdAt: string;
}

export default function StudyRooms() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [form, setForm] = useState({
    title: "", type: "group_study", description: "", subject: "",
    maxParticipants: 20, password: "", showPassword: false,
  });

  const { data: rooms = [], isLoading, refetch } = useListStudyRooms(
    activeTab !== "all" ? { type: activeTab } : {}
  );

  const createMutation = useCreateStudyRoom({
    mutation: {
      onSuccess: (room) => {
        toast({ title: "Room created!", description: `Room code: ${room.roomCode}` });
        setCreateOpen(false);
        setLocation(`/study-rooms/${room.id}`);
      },
      onError: () => toast({ title: "Failed to create room", variant: "destructive" }),
    },
  });

  function handleCreate() {
    if (!form.title.trim()) {
      toast({ title: "Please enter a room title", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      data: {
        title: form.title.trim(),
        type: form.type,
        description: form.description || undefined,
        subject: form.subject || undefined,
        maxParticipants: form.maxParticipants,
        password: form.password || undefined,
      },
    });
  }

  const filtered = (rooms as StudyRoomItem[]).filter((r) =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.subject ?? "").toLowerCase().includes(search.toLowerCase()) ||
    r.hostName.toLowerCase().includes(search.toLowerCase())
  );

  const liveCount = (rooms as StudyRoomItem[]).filter((r) => r.status === "active").length;
  const totalParticipants = (rooms as StudyRoomItem[]).reduce((s, r) => s + r.currentParticipants, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-blue-200">Live Learning Rooms</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Study Rooms</h1>
              <p className="text-blue-100 text-sm max-w-md">
                Join a live classroom, collaborate with peers, or host your own session. Real-time learning, together.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black">{liveCount}</div>
                  <div className="text-xs text-blue-200">Live Now</div>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-black">{rooms.length}</div>
                  <div className="text-xs text-blue-200">Rooms</div>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-black">{totalParticipants}</div>
                  <div className="text-xs text-blue-200">Online</div>
                </div>
              </div>
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Room
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features bar */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6 overflow-x-auto">
          {[
            { icon: Video,    label: "HD Video" },
            { icon: Mic,      label: "Crystal Audio" },
            { icon: Camera,   label: "Screen Share" },
            { icon: Shield,   label: "Encrypted" },
            { icon: Zap,      label: "AI Summary" },
            { icon: Star,     label: "Whiteboard" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
              <Icon className="w-3.5 h-3.5 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search + tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms, subjects, hosts…"
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => refetch()} className="gap-2 flex-shrink-0">
            <Wifi className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {ROOM_TYPES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Room grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground mb-1">No rooms found</h3>
            <p className="text-sm text-muted-foreground mb-4">Be the first to create a room!</p>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Room
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((room) => (
              <RoomCard key={room.id} room={room as StudyRoomItem} onJoin={(id) => setLocation(`/study-rooms/${id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Create Room Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              Create a Room
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Room Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Python Doubt Session"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Room Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {ROOM_TYPES.filter((t) => t.key !== "all").map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setForm((f) => ({ ...f, type: key }))}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all ${
                      form.type === key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-medium leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Subject (optional)</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Python"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Max Participants</Label>
                <Input
                  type="number"
                  value={form.maxParticipants}
                  onChange={(e) => setForm((f) => ({ ...f, maxParticipants: parseInt(e.target.value) || 20 }))}
                  min={2}
                  max={100}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Description (optional)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What will you discuss?"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Password (optional)</Label>
              <div className="relative">
                <Input
                  type={form.showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Leave empty for public room"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, showPassword: !f.showPassword }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {form.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 gap-2"
              >
                {createMutation.isPending ? "Creating…" : (
                  <><Play className="w-4 h-4" /> Start Room</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
