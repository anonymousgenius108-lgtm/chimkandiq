import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  useListNotifications,
  useGetMyGamification,
} from "@workspace/api-client-react";
import { useAuth, clearAuthState } from "@/lib/auth";
import {
  BookOpen, Search, Users, MessageSquare, LayoutDashboard, Bell,
  HelpCircle, Film, Trophy, User, Presentation, Crown, Code2,
  Library, Store, Timer, Menu, X, ChevronLeft, ChevronRight,
  LogIn, Star, Pin, Clock, Wallet, Sparkles, GraduationCap,
  Upload, Rss, Target, Zap, Bot, Calendar, Award, TrendingUp,
  Home, Settings, Video, LogOut, ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ── SIDEBAR core navigation (max 8 items) ────────────────────────────────────
const SIDEBAR_NAV = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/tutors",      label: "Tutors",       icon: Users           },
  { href: "/library",     label: "Library",      icon: Library         },
  { href: "/codelab",     label: "CodeLab",      icon: Code2           },
  { href: "/marketplace", label: "Marketplace",  icon: Store           },
  { href: "/messages",    label: "Messages",     icon: MessageSquare   },
  { href: "/profile",     label: "Profile",      icon: User            },
  { href: "/focus",       label: "Focus",        icon: Timer           },
];

// ── MOBILE bottom nav (5 most-used) ─────────────────────────────────────────
const MOBILE_NAV = [
  { href: "/",           label: "Home",      icon: Home          },
  { href: "/dashboard",  label: "Dashboard", icon: LayoutDashboard },
  { href: "/messages",   label: "Chat",      icon: MessageSquare },
  { href: "/library",    label: "Library",   icon: Library       },
  { href: "/profile",    label: "Profile",   icon: User          },
];

// ── MEGA DRAWER categories ───────────────────────────────────────────────────
interface MegaItem { href: string; label: string; icon: React.ElementType; badge?: string; comingSoon?: boolean; tutorOnly?: boolean }
interface MegaCategory { label: string; colorClass: string; items: MegaItem[]; tutorOnly?: boolean }

const MEGA_CATEGORIES: MegaCategory[] = [
  {
    label: "Learning Tools",
    colorClass: "text-blue-500",
    items: [
      { href: "/",             label: "Discover",         icon: Search       },
      { href: "/study-rooms",  label: "Study Rooms",      icon: Video,  badge: "Live" },
      { href: "/qna",          label: "Q&A Forum",        icon: HelpCircle   },
      { href: "/reels",        label: "Learning Reels",   icon: Film         },
      { href: "/bookings",     label: "My Bookings",      icon: Calendar     },
      { href: "/leaderboard",  label: "Leaderboard",      icon: Trophy       },
      { href: "/search",       label: "Global Search",    icon: Search       },
    ],
  },
  {
    label: "AI Tools",
    colorClass: "text-purple-500",
    items: [
      { href: "/qna/ask",  label: "Ask a Question", icon: HelpCircle       },
      { href: "/codelab",  label: "AI Code Lab",    icon: Code2, badge: "AI" },
      { href: "/focus",    label: "Focus Mode",     icon: Target             },
    ],
  },
  {
    label: "Wallet & Economy",
    colorClass: "text-amber-500",
    items: [
      { href: "/lucky-royal", label: "Lucky Royal",    icon: Crown,  badge: "Hot" },
      { href: "/wallet",      label: "Credit Wallet",  icon: Wallet               },
    ],
  },
  {
    label: "Community",
    colorClass: "text-emerald-500",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell       },
      { href: "/leaderboard",   label: "Leaderboard",   icon: TrendingUp },
      { href: "/profile",       label: "My Profile",    icon: Award      },
    ],
  },
  {
    label: "Tutor Tools",
    colorClass: "text-rose-500",
    tutorOnly: true,
    items: [
      { href: "/tutor-dashboard", label: "Tutor Center",      icon: Presentation },
      { href: "/reels/upload",    label: "Upload Lesson Reel", icon: Upload, badge: "New" },
    ],
  },
  {
    label: "Account",
    colorClass: "text-slate-400",
    items: [
      { href: "/login",  label: "Switch Role / Sign In", icon: LogIn         },
      { href: "/signup", label: "Create Account",        icon: GraduationCap },
    ],
  },
];

// ── Tooltip wrapper (desktop collapsed mode) ─────────────────────────────────
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

// ── Mega drawer ───────────────────────────────────────────────────────────────
function MegaDrawer({
  open, onClose, unreadCount
}: { open: boolean; onClose: () => void; unreadCount: number }) {
  const [search, setSearch] = useState("");
  const [pinned, setPinned] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("mega_pinned") ?? "[]"); } catch { return []; }
  });
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("mega_recent") ?? "[]"); } catch { return []; }
  });
  const [, setLocation] = useLocation();
  const { role } = useAuth();
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
      localStorage.setItem("mega_pinned", JSON.stringify(next));
      return next;
    });
  }

  function navigate(href: string) {
    setRecent((r) => {
      const next = [href, ...r.filter((x) => x !== href)].slice(0, 5);
      localStorage.setItem("mega_recent", JSON.stringify(next));
      return next;
    });
    setLocation(href);
    onClose();
  }

  const isTutor = role === "tutor" || role === "admin";

  // Flatten all items for search — filter tutor-only categories AND tutor-only items
  const allItems = MEGA_CATEGORIES
    .filter((c) => !c.tutorOnly || isTutor)
    .flatMap((c) =>
      c.items
        .filter((i) => !i.tutorOnly || isTutor)
        .map((i) => ({ ...i, category: c.label }))
    );

  const q = search.toLowerCase().trim();
  const filtered = q ? allItems.filter((i) => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)) : [];

  // Pinned item objects
  const pinnedItems = allItems.filter((i) => pinned.includes(i.href));
  const recentItems = allItems.filter((i) => recent.includes(i.href) && !pinned.includes(i.href));

  const ItemRow = ({ item, showCategory }: { item: MegaItem & { category?: string }; showCategory?: boolean }) => {
    const isPinned = pinned.includes(item.href);
    return (
      <div className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors cursor-pointer" onClick={() => navigate(item.href)}>
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-accent-foreground/10 transition-colors">
          <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground leading-none">{item.label}</div>
          {showCategory && <div className="text-[11px] text-muted-foreground mt-0.5">{item.category}</div>}
        </div>
        <div className="flex items-center gap-1.5">
          {item.badge && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.badge}</Badge>}
          <button
            onClick={(e) => { e.stopPropagation(); togglePin(item.href); }}
            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-accent ${isPinned ? "!opacity-100 text-primary" : "text-muted-foreground"}`}
            title={isPinned ? "Unpin" : "Pin"}
          >
            <Pin className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-sm bg-background border-r border-border shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Menu className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-bold text-foreground text-sm">All Features</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                EduConnect · <span className="capitalize font-semibold">{role ?? "Student"}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search features…"
              className="w-full pl-9 pr-4 h-9 rounded-xl bg-muted/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {/* Search results */}
          {q && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground px-2 pb-1.5">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
              {filtered.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-8">No features found</p>
                : filtered.map((i) => <ItemRow key={i.href} item={i} showCategory />)
              }
            </div>
          )}

          {!q && (
            <>
              {/* Pinned */}
              {pinnedItems.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 px-2 pb-1.5">
                    <Pin className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground">Pinned</span>
                  </div>
                  {pinnedItems.map((i) => <ItemRow key={i.href} item={i} />)}
                  <div className="h-px bg-border my-2" />
                </div>
              )}

              {/* Recent */}
              {recentItems.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 px-2 pb-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">Recent</span>
                  </div>
                  {recentItems.map((i) => <ItemRow key={i.href} item={i} />)}
                  <div className="h-px bg-border my-2" />
                </div>
              )}

              {/* Categories */}
              {MEGA_CATEGORIES.filter((c) => !c.tutorOnly || isTutor).map((cat) => (
                <div key={cat.label} className="mb-1">
                  <p className={`text-xs font-bold px-2 py-1.5 uppercase tracking-wider ${cat.colorClass}`}>{cat.label}</p>
                  {cat.items.filter((i) => !i.tutorOnly || isTutor).map((i) => <ItemRow key={i.href} item={{ ...i, category: cat.label }} />)}
                  <div className="h-px bg-border/50 my-2" />
                </div>
              ))}

              {/* Notifications shortcut with badge */}
              <div
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors cursor-pointer"
                onClick={() => navigate("/notifications")}
              >
                <div className="relative w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[9px] text-white font-bold flex items-center justify-center">{unreadCount}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-foreground">Notifications</span>
                {unreadCount > 0 && <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-auto">{unreadCount} new</Badge>}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3 flex-shrink-0">
          <p className="text-[11px] text-muted-foreground text-center">Hover any item and click 📌 to pin it</p>
        </div>
      </div>
    </>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export function Layout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const auth = useAuth();
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

  // Collapse sidebar on medium screens by default
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
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href + "/") || location.startsWith(href + "?");
  }

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* ─── Sidebar (hidden on mobile) ─── */}
      <aside
        className={`hidden md:flex flex-col border-r border-sidebar-border bg-sidebar flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${expanded ? "w-56" : "w-[64px]"}`}
        style={{ minHeight: "100dvh", position: "sticky", top: 0, alignSelf: "flex-start", height: "100dvh" }}
      >
        {/* Logo + hamburger */}
        <div className={`flex items-center border-b border-sidebar-border flex-shrink-0 h-[57px] ${expanded ? "px-4 gap-3" : "px-0 justify-center"}`}>
          {expanded && (
            <Link href="/" className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <span className="font-black text-base text-sidebar-foreground tracking-tight truncate">EduConnect</span>
            </Link>
          )}
          {!expanded && (
            <Link href="/" className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </Link>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 w-7 h-7 rounded-md hover:bg-sidebar-accent flex items-center justify-center transition-colors"
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <ChevronLeft className="w-4 h-4 text-sidebar-foreground/50" /> : <ChevronRight className="w-4 h-4 text-sidebar-foreground/50" />}
          </button>
        </div>

        {/* Hamburger / Mega menu trigger */}
        <div className={`px-2 py-2.5 border-b border-sidebar-border flex-shrink-0 ${!expanded ? "flex justify-center" : ""}`}>
          <button
            onClick={() => setMegaOpen(true)}
            className={`flex items-center gap-2.5 rounded-xl transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground group ${expanded ? "w-full px-2.5 py-2" : "w-10 h-10 justify-center"}`}
            title="All Features"
          >
            <Menu className="w-4 h-4 flex-shrink-0" />
            {expanded && <span className="text-sm font-medium">All Features</span>}
            {expanded && unreadCount > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {SIDEBAR_NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Tip key={item.href} label={item.label} show={!expanded}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-xl transition-all duration-150 group relative ${
                    expanded ? "gap-3 px-3 py-2.5" : "justify-center w-10 h-10 mx-auto"
                  } ${
                    active
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
                  )}
                  <item.icon className={`flex-shrink-0 transition-transform group-hover:scale-105 ${expanded ? "w-4.5 h-4.5" : "w-5 h-5"}`} style={{ width: expanded ? "1.1rem" : "1.25rem", height: expanded ? "1.1rem" : "1.25rem" }} />
                  {expanded && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                  {/* Messages badge */}
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

        {/* User profile chip + role badge + sign-out */}
        <div className="border-t border-sidebar-border flex-shrink-0 p-2 space-y-1">
          {me && (
            <>
              <Link
                href="/profile"
                className={`flex items-center rounded-xl hover:bg-sidebar-accent transition-colors ${expanded ? "gap-2.5 px-2.5 py-2" : "justify-center w-10 h-10 mx-auto"}`}
              >
                <img src={me.avatarUrl} alt={me.userName} className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/25 flex-shrink-0" />
                {expanded && (
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-sidebar-foreground truncate">{me.userName}</div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-primary" />
                      <span className="text-[10px] text-sidebar-foreground/60">{me.points} · {me.level.label}</span>
                    </div>
                  </div>
                )}
              </Link>
              {expanded && (
                <div className="h-1 bg-sidebar-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.max(4, me.level.progressPct)}%` }} />
                </div>
              )}
            </>
          )}

          {/* Role badge */}
          {expanded && auth.role && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold ${
              auth.role === "tutor"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : auth.role === "admin"
                ? "bg-purple-50 text-purple-700 border border-purple-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              <ShieldCheck className="w-3 h-3" />
              <span className="capitalize">{auth.role}</span>
              <span className="ml-auto text-current/50">Role</span>
            </div>
          )}

          {/* Sign out */}
          {auth.isLoggedIn && (
            <button
              onClick={() => { clearAuthState(); setLocation("/login"); }}
              className={`w-full flex items-center rounded-xl text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-rose-600 transition-colors ${expanded ? "gap-2 px-2.5 py-2" : "justify-center w-10 h-10 mx-auto"}`}
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              {expanded && <span className="text-xs">Sign out</span>}
            </button>
          )}
        </div>
      </aside>

      {/* ─── Mega drawer ─── */}
      <MegaDrawer open={megaOpen} onClose={() => setMegaOpen(false)} unreadCount={unreadCount} />

      {/* ─── Main content ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background/90 backdrop-blur sticky top-0 z-20 flex-shrink-0">
          <button onClick={() => setMegaOpen(true)} className="relative w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <Menu className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-destructive" />}
          </button>
          <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
            <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="font-black text-base text-foreground">EduConnect</span>
          </Link>
          {me && (
            <Link href="/profile">
              <img src={me.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20" />
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
              placeholder="Search people, questions, reels, topics…"
              className="pl-10 h-9 bg-muted/50 border-transparent focus-visible:bg-background"
              data-testid="input-header-search"
            />
          </form>
        </div>

        {/* Page content */}
        <div className="flex-1 pb-20 md:pb-0">{children}</div>
      </main>

      {/* ─── Mobile bottom nav ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-lg border-t border-border flex items-stretch">
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`relative transition-all ${active ? "scale-110" : ""}`}>
                <item.icon className="w-5 h-5" />
                {item.href === "/messages" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-primary" : ""}`}>{item.label}</span>
              {active && <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />}
            </Link>
          );
        })}
        {/* Extra: hamburger slot */}
        <button onClick={() => setMegaOpen(true)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-muted-foreground hover:text-foreground transition-colors">
          <div className="relative">
            <Menu className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />}
          </div>
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </div>
  );
}
