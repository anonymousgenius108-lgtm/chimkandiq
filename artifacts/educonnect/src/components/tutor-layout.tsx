import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  useListNotifications,
  useGetMyGamification,
} from "@workspace/api-client-react";
import {
  BookOpen, Search, Users, MessageSquare, Bell, HelpCircle, Film,
  User, Presentation, Code2, Library, Store, Timer, Menu, X,
  ChevronLeft, ChevronRight, LogIn, Pin, Clock, Wallet, Sparkles,
  Upload, Target, Zap, Bot, Calendar, Award, TrendingUp, Trophy,
  PenTool, Video, Mic, BarChart3, FileText, Layers, GraduationCap,
  Star, Settings, Coins, BookMarked, Clipboard, Brain, Megaphone,
  UserCheck, LayoutDashboard, ClipboardList, AlarmClock, Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// ── TUTOR SIDEBAR (10 core pages) ─────────────────────────────────────────────
const TUTOR_SIDEBAR_NAV = [
  { href: "/tutor-dashboard", label: "Dashboard",   icon: LayoutDashboard },
  { href: "/library",         label: "My Courses",  icon: BookOpen        },
  { href: "/tutors",          label: "Students",    icon: Users           },
  { href: "/reels",           label: "Live Reels",  icon: Film            },
  { href: "/codelab",         label: "CodeLab",     icon: Code2           },
  { href: "/marketplace",     label: "Marketplace", icon: Store           },
  { href: "/messages",        label: "Chat",        icon: MessageSquare   },
  { href: "/leaderboard",     label: "Analytics",   icon: BarChart3       },
  { href: "/profile",         label: "Profile",     icon: User            },
  { href: "/wallet",          label: "Wallet",      icon: Wallet          },
];

// ── MOBILE TUTOR BOTTOM NAV (5 key items) ────────────────────────────────────
const TUTOR_MOBILE_NAV = [
  { href: "/tutor-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/messages",        label: "Chat",      icon: MessageSquare   },
  { href: "/reels",           label: "Reels",     icon: Film            },
  { href: "/marketplace",     label: "Market",    icon: Store           },
  { href: "/profile",         label: "Profile",   icon: User            },
];

// ── MEGA DRAWER CATEGORIES ────────────────────────────────────────────────────
interface MegaItem { href: string; label: string; icon: React.ElementType; badge?: string; comingSoon?: boolean }
interface MegaCategory { label: string; colorClass: string; items: MegaItem[]; quickActions?: string[] }

const TUTOR_MEGA_CATEGORIES: MegaCategory[] = [
  {
    label: "Course Tools",
    colorClass: "text-blue-500",
    items: [
      { href: "/reels/upload",    label: "Upload Lesson Reel",  icon: Upload,      badge: "New"  },
      { href: "/library",         label: "My Course Library",   icon: Library                   },
      { href: "/marketplace",     label: "Publish to Market",   icon: Store                     },
      { href: "/qna",             label: "Course Q&A",          icon: HelpCircle                },
      { href: "/codelab",         label: "Coding Assignments",  icon: Code2                     },
      { href: "/library",         label: "Chapter Builder",     icon: Layers,      comingSoon: true },
      { href: "/library",         label: "Quiz Builder",        icon: Clipboard,   comingSoon: true },
      { href: "/library",         label: "Course Certificates", icon: Award,       comingSoon: true },
    ],
  },
  {
    label: "Live Teaching Tools",
    colorClass: "text-rose-500",
    items: [
      { href: "/reels",           label: "Start Live Class",    icon: Video,       badge: "Live" },
      { href: "/reels/upload",    label: "Schedule Session",    icon: Calendar                  },
      { href: "/focus",           label: "Focus / Whiteboard",  icon: PenTool                   },
      { href: "/messages",        label: "Session Chat",        icon: MessageSquare             },
      { href: "/reels",           label: "Screen Share",        icon: Globe,       comingSoon: true },
      { href: "/reels",           label: "Attendance",          icon: UserCheck,   comingSoon: true },
      { href: "/reels",           label: "Session Recordings",  icon: Film,        comingSoon: true },
      { href: "/reels",           label: "Breakout Rooms",      icon: Users,       comingSoon: true },
    ],
  },
  {
    label: "Student Tools",
    colorClass: "text-emerald-500",
    items: [
      { href: "/tutors",          label: "Student List",        icon: Users                     },
      { href: "/leaderboard",     label: "Student Progress",    icon: TrendingUp                },
      { href: "/qna",             label: "Weak Topic Reports",  icon: HelpCircle                },
      { href: "/messages",        label: "Send Announcement",   icon: Megaphone                 },
      { href: "/leaderboard",     label: "Batch Management",    icon: ClipboardList, comingSoon: true },
      { href: "/leaderboard",     label: "Attendance Reports",  icon: UserCheck,   comingSoon: true },
      { href: "/leaderboard",     label: "Focus Analytics",     icon: Target,      comingSoon: true },
      { href: "/messages",        label: "Private Notes",       icon: FileText,    comingSoon: true },
    ],
  },
  {
    label: "AI Tutor Tools",
    colorClass: "text-purple-500",
    items: [
      { href: "/codelab",         label: "AI Quiz Generator",    icon: Bot,         badge: "AI" },
      { href: "/qna/ask",         label: "AI Question Suggest",  icon: Brain,       badge: "AI" },
      { href: "/reels/upload",    label: "AI Course Generator",  icon: Zap,         badge: "AI", comingSoon: true },
      { href: "/reels",           label: "AI Class Summary",     icon: Sparkles,    badge: "AI", comingSoon: true },
      { href: "/leaderboard",     label: "AI Student Analysis",  icon: BarChart3,   badge: "AI", comingSoon: true },
      { href: "/qna",             label: "AI Weak Topic Detect", icon: Target,      badge: "AI", comingSoon: true },
      { href: "/library",         label: "AI Notes Generator",   icon: FileText,    badge: "AI", comingSoon: true },
    ],
  },
  {
    label: "Marketplace Tools",
    colorClass: "text-amber-500",
    items: [
      { href: "/marketplace",     label: "Upload Asset",         icon: Upload,      badge: "New" },
      { href: "/marketplace",     label: "My Assets",            icon: BookMarked               },
      { href: "/lucky-royal",     label: "Lucky Royal",          icon: Star,        badge: "Hot" },
      { href: "/wallet",          label: "Sales Analytics",      icon: BarChart3                },
      { href: "/marketplace",     label: "Auction Hub",          icon: Zap,         comingSoon: true },
      { href: "/marketplace",     label: "Creator Dashboard",    icon: LayoutDashboard, comingSoon: true },
      { href: "/wallet",          label: "Revenue Reports",      icon: TrendingUp,  comingSoon: true },
    ],
  },
  {
    label: "Community Tools",
    colorClass: "text-cyan-500",
    items: [
      { href: "/messages",        label: "Message Students",     icon: MessageSquare            },
      { href: "/qna",             label: "Tutor Q&A",            icon: HelpCircle               },
      { href: "/leaderboard",     label: "Followers",            icon: Users                    },
      { href: "/search",          label: "Find Students",        icon: Search                   },
      { href: "/messages",        label: "Tutor Clubs",          icon: Globe,       comingSoon: true },
      { href: "/messages",        label: "Study Groups",         icon: Users,       comingSoon: true },
      { href: "/messages",        label: "Group Announcements",  icon: Megaphone,   comingSoon: true },
    ],
  },
  {
    label: "Wallet & Earnings",
    colorClass: "text-green-500",
    items: [
      { href: "/wallet",          label: "Credit Wallet",        icon: Wallet                   },
      { href: "/wallet",          label: "INR Earnings",         icon: Coins                    },
      { href: "/lucky-royal",     label: "Lucky Royal",          icon: Star                     },
      { href: "/notifications",   label: "Invoices",             icon: FileText,    comingSoon: true },
      { href: "/wallet",          label: "Withdrawals",          icon: TrendingUp,  comingSoon: true },
      { href: "/wallet",          label: "Subscription Plan",    icon: Award,       comingSoon: true },
    ],
  },
  {
    label: "Resource Tools",
    colorClass: "text-indigo-500",
    items: [
      { href: "/library",         label: "Library Uploads",      icon: Upload                   },
      { href: "/marketplace",     label: "Notes Store",          icon: FileText                 },
      { href: "/reels",           label: "Video Recordings",     icon: Film                     },
      { href: "/library",         label: "PDF Resources",        icon: BookMarked, comingSoon: true },
      { href: "/marketplace",     label: "Templates",            icon: Layers,     comingSoon: true },
      { href: "/library",         label: "Offline Materials",    icon: BookOpen,   comingSoon: true },
    ],
  },
  {
    label: "Productivity Tools",
    colorClass: "text-orange-500",
    items: [
      { href: "/focus",           label: "Focus Mode",           icon: Target                   },
      { href: "/bookings",        label: "Teaching Schedule",    icon: Calendar                 },
      { href: "/bookings",        label: "Availability",         icon: AlarmClock               },
      { href: "/notifications",   label: "Notifications",        icon: Bell                     },
      { href: "/focus",           label: "Goals & Reminders",    icon: Zap,        comingSoon: true },
    ],
  },
  {
    label: "Account",
    colorClass: "text-slate-400",
    items: [
      { href: "/login",           label: "Switch to Student",    icon: LogIn                    },
      { href: "/profile",         label: "Edit Profile",         icon: Settings                 },
    ],
  },
];

// ── Quick actions (top of mega drawer) ────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Start Live Class",  icon: Video,   href: "/reels",        color: "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"    },
  { label: "Upload Reel",       icon: Upload,  href: "/reels/upload", color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"    },
  { label: "AI Quiz",           icon: Bot,     href: "/codelab",      color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20" },
  { label: "Q&A Forum",         icon: HelpCircle, href: "/qna",       color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" },
];

// ── Tooltip ────────────────────────────────────────────────────────────────────
function Tip({ label, children, show }: { label: string; children: ReactNode; show: boolean }) {
  if (!show) return <>{children}</>;
  return (
    <div className="group relative">
      {children}
      <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center">
        <div className="bg-popover text-popover-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl border border-border whitespace-nowrap">
          {label}
        </div>
      </div>
    </div>
  );
}

// ── Mega Drawer ────────────────────────────────────────────────────────────────
function TutorMegaDrawer({ open, onClose, unreadCount }: { open: boolean; onClose: () => void; unreadCount: number }) {
  const [search, setSearch] = useState("");
  const [pinned, setPinned] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("tutor_mega_pinned") ?? "[]"); } catch { return []; }
  });
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("tutor_mega_recent") ?? "[]"); } catch { return []; }
  });
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function togglePin(href: string) {
    setPinned((p) => {
      const next = p.includes(href) ? p.filter((x) => x !== href) : [...p, href];
      localStorage.setItem("tutor_mega_pinned", JSON.stringify(next));
      return next;
    });
  }

  function navigate(href: string, label: string) {
    setRecent((r) => {
      const next = [label, ...r.filter((x) => x !== label)].slice(0, 6);
      localStorage.setItem("tutor_mega_recent", JSON.stringify(next));
      return next;
    });
    setLocation(href);
    onClose();
  }

  const allItems = TUTOR_MEGA_CATEGORIES.flatMap((c) =>
    c.items.map((i) => ({ ...i, category: c.label }))
  );

  const q = search.toLowerCase().trim();
  const filtered = q
    ? allItems.filter((i) => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
    : [];

  const pinnedItems = allItems.filter((i) => pinned.includes(i.label));
  const recentItems = allItems.filter((i) => recent.includes(i.label) && !pinned.includes(i.label));

  const ItemRow = ({ item, showCategory }: { item: MegaItem & { category?: string }; showCategory?: boolean }) => {
    const isPinned = pinned.includes(item.label);
    return (
      <div
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${item.comingSoon ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"}`}
        onClick={() => !item.comingSoon && navigate(item.href, item.label)}
      >
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-accent-foreground/10 transition-colors">
          <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground leading-none">{item.label}</div>
          {showCategory && <div className="text-[11px] text-muted-foreground mt-0.5">{item.category}</div>}
          {item.comingSoon && <div className="text-[10px] text-muted-foreground mt-0.5">Coming soon</div>}
        </div>
        <div className="flex items-center gap-1.5">
          {item.badge && !item.comingSoon && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.badge}</Badge>
          )}
          {!item.comingSoon && (
            <button
              onClick={(e) => { e.stopPropagation(); togglePin(item.label); }}
              className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-accent ${isPinned ? "!opacity-100 text-primary" : "text-muted-foreground"}`}
              title={isPinned ? "Unpin" : "Pin"}
            >
              <Pin className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 left-0 h-full w-full max-w-sm bg-background border-r border-border shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0 bg-emerald-500/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="font-bold text-foreground text-sm">Tutor Tools</div>
              <div className="text-[11px] text-muted-foreground">All 70+ tutor features</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.href, a.label)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-colors ${a.color}`}
              >
                <a.icon className="w-4 h-4" />
                <span className="text-[10px] font-medium leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tutor tools…"
              className="w-full pl-9 pr-4 h-9 rounded-xl bg-muted/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {/* Search results */}
          {q && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground px-2 pb-1.5">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
              {filtered.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-8">No tools found</p>
                : filtered.map((i) => <ItemRow key={`${i.href}-${i.label}`} item={i} showCategory />)
              }
            </div>
          )}

          {!q && (
            <>
              {/* Pinned */}
              {pinnedItems.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 px-2 pb-1.5">
                    <Pin className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs font-semibold text-muted-foreground">Pinned</span>
                  </div>
                  {pinnedItems.map((i) => <ItemRow key={`${i.href}-${i.label}`} item={i} />)}
                  <div className="h-px bg-border my-2" />
                </div>
              )}

              {/* Recent */}
              {recentItems.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 px-2 pb-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">Recently Used</span>
                  </div>
                  {recentItems.map((i) => <ItemRow key={`${i.href}-${i.label}`} item={i} />)}
                  <div className="h-px bg-border my-2" />
                </div>
              )}

              {/* Categories */}
              {TUTOR_MEGA_CATEGORIES.map((cat) => (
                <div key={cat.label} className="mb-1">
                  <p className={`text-xs font-bold px-2 py-1.5 uppercase tracking-wider ${cat.colorClass}`}>{cat.label}</p>
                  {cat.items.map((i) => <ItemRow key={`${i.href}-${i.label}`} item={{ ...i, category: cat.label }} />)}
                  <div className="h-px bg-border/50 my-2" />
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3 flex-shrink-0">
          <p className="text-[11px] text-muted-foreground text-center">
            Hover any item and click 📌 to pin it · {TUTOR_MEGA_CATEGORIES.flatMap((c) => c.items).length}+ tools
          </p>
        </div>
      </div>
    </>
  );
}

// ── Main Tutor Layout ─────────────────────────────────────────────────────────
export function TutorLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: notifications = [] } = useListNotifications();
  const { data: me } = useGetMyGamification();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [expanded, setExpanded] = useState(true);
  const [megaOpen, setMegaOpen] = useState(false);

  const initialQ = location.startsWith("/search")
    ? new URLSearchParams(location.split("?")[1] ?? "").get("q") ?? ""
    : "";
  const [searchInput, setSearchInput] = useState(initialQ);

  useEffect(() => {
    if (!location.startsWith("/search")) setSearchInput("");
  }, [location]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setExpanded(false);
      else setExpanded(true);
    };
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchInput.trim();
    setLocation(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  function isActive(href: string) {
    if (href === "/tutor-dashboard") return location === "/tutor-dashboard";
    return location === href || location.startsWith(href + "/") || location.startsWith(href + "?");
  }

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* ─── Tutor Sidebar ─── */}
      <aside
        className={`hidden md:flex flex-col border-r border-sidebar-border bg-sidebar flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${expanded ? "w-56" : "w-[64px]"}`}
        style={{ minHeight: "100dvh", position: "sticky", top: 0, alignSelf: "flex-start", height: "100dvh" }}
      >
        {/* Logo + collapse toggle */}
        <div className={`flex items-center border-b border-sidebar-border flex-shrink-0 h-[57px] ${expanded ? "px-4 gap-3" : "px-0 justify-center"}`}>
          {expanded && (
            <Link href="/tutor-dashboard" className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-sidebar-foreground tracking-tight truncate leading-none">EduConnect</div>
                <div className="text-[10px] text-emerald-600 font-semibold tracking-wide">TUTOR MODE</div>
              </div>
            </Link>
          )}
          {!expanded && (
            <Link href="/tutor-dashboard" className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            </Link>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 w-7 h-7 rounded-md hover:bg-sidebar-accent flex items-center justify-center transition-colors"
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded
              ? <ChevronLeft className="w-4 h-4 text-sidebar-foreground/50" />
              : <ChevronRight className="w-4 h-4 text-sidebar-foreground/50" />}
          </button>
        </div>

        {/* Hamburger — Tutor mega menu trigger */}
        <div className={`px-2 py-2.5 border-b border-sidebar-border flex-shrink-0 ${!expanded ? "flex justify-center" : ""}`}>
          <button
            onClick={() => setMegaOpen(true)}
            className={`flex items-center gap-2.5 rounded-xl transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground group ${expanded ? "w-full px-2.5 py-2" : "w-10 h-10 justify-center"}`}
            title="All Tutor Tools"
          >
            <Menu className="w-4 h-4 flex-shrink-0" />
            {expanded && <span className="text-sm font-medium">All Tutor Tools</span>}
            {expanded && (
              <span className="ml-auto text-[10px] text-muted-foreground font-medium">70+</span>
            )}
          </button>
        </div>

        {/* Tutor mode banner */}
        {expanded && (
          <div className="mx-2 mt-2 mb-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-600">Tutor Mode Active</span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {TUTOR_SIDEBAR_NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Tip key={item.href} label={item.label} show={!expanded}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-xl transition-all duration-150 group relative ${
                    expanded ? "gap-3 px-3 py-2.5" : "justify-center w-10 h-10 mx-auto"
                  } ${
                    active
                      ? "bg-emerald-500/10 text-emerald-700 shadow-sm"
                      : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-emerald-500" />
                  )}
                  <item.icon
                    style={{ width: expanded ? "1.1rem" : "1.25rem", height: expanded ? "1.1rem" : "1.25rem" }}
                    className="flex-shrink-0 transition-transform group-hover:scale-105"
                  />
                  {expanded && <span className="text-sm font-medium truncate">{item.label}</span>}
                  {item.href === "/messages" && unreadCount > 0 && expanded && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Tip>
            );
          })}
        </nav>

        {/* Switch to student button */}
        {expanded && (
          <div className="px-2 py-2 border-t border-sidebar-border flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group"
            >
              <LogIn className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Switch to Student</span>
            </Link>
          </div>
        )}

        {/* User profile chip */}
        {me && (
          <div className="border-t border-sidebar-border flex-shrink-0 p-2">
            <Link
              href="/profile"
              className={`flex items-center rounded-xl hover:bg-sidebar-accent transition-colors ${expanded ? "gap-2.5 px-2.5 py-2" : "justify-center w-10 h-10 mx-auto"}`}
            >
              <div className="relative flex-shrink-0">
                <img src={me.avatarUrl} alt={me.userName} className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-sidebar flex items-center justify-center">
                  <GraduationCap className="w-1.5 h-1.5 text-white" />
                </div>
              </div>
              {expanded && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-sidebar-foreground truncate">{me.userName}</div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                    <span className="text-[10px] text-sidebar-foreground/60">{me.points} · {me.level.label}</span>
                  </div>
                </div>
              )}
            </Link>
            {expanded && (
              <div className="mt-1 h-1 bg-sidebar-border rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.max(4, me.level.progressPct)}%` }} />
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ─── Tutor Mega Drawer ─── */}
      <TutorMegaDrawer open={megaOpen} onClose={() => setMegaOpen(false)} unreadCount={unreadCount} />

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background/90 backdrop-blur sticky top-0 z-20 flex-shrink-0">
          <button onClick={() => setMegaOpen(true)} className="relative w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Menu className="w-5 h-5 text-emerald-600" />
            {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-destructive" />}
          </button>
          <Link href="/tutor-dashboard" className="flex items-center gap-2 flex-1 min-w-0">
            <GraduationCap className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="font-black text-sm text-foreground leading-none">EduConnect</div>
              <div className="text-[10px] text-emerald-600 font-semibold">TUTOR MODE</div>
            </div>
          </Link>
          {me && (
            <Link href="/profile">
              <div className="relative">
                <img src={me.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
            </Link>
          )}
        </div>

        {/* Desktop search bar */}
        <div className="hidden md:block border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10 flex-shrink-0">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto px-6 py-2.5 relative">
            <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search students, courses, tools…"
              className="pl-10 h-9 bg-muted/50 border-transparent focus-visible:bg-background"
            />
          </form>
        </div>

        {/* Page content */}
        <div className="flex-1 pb-20 md:pb-0">{children}</div>
      </main>

      {/* ─── Mobile bottom nav ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-lg border-t border-border flex items-stretch">
        {TUTOR_MOBILE_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${active ? "text-emerald-600" : "text-muted-foreground"}`}
            >
              <div className={`relative transition-all ${active ? "scale-110" : ""}`}>
                <item.icon className="w-5 h-5" />
                {item.href === "/messages" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-emerald-600" : ""}`}>{item.label}</span>
              {active && <div className="absolute bottom-0 w-8 h-0.5 bg-emerald-500 rounded-full" />}
            </Link>
          );
        })}
        <button onClick={() => setMegaOpen(true)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-muted-foreground hover:text-emerald-600 transition-colors">
          <div className="relative">
            <Menu className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />}
          </div>
          <span className="text-[10px] font-medium">Tools</span>
        </button>
      </nav>
    </div>
  );
}
