import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  useGetProfile,
  useFollowUser,
  useUnfollowUser,
  useListFollowers,
  useListFollowing,
  useListProfileActivity,
  getGetProfileQueryKey,
  getGetMyGamificationQueryKey,
  type ProfileSummary,
  type ActivityItem,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap,
  MapPin,
  CalendarDays,
  Wallet,
  UserPlus,
  UserMinus,
  Lock,
  MessageSquare,
  Trophy,
  Flame,
  HelpCircle,
  MessageSquareReply,
  Film,
  Sparkles,
  CheckCircle2,
  Library,
  Lightbulb,
  CalendarCheck,
  Award,
  Medal,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatRelative } from "@/lib/format";

const CURRENT_USER = "Alex Morgan";

const BADGE_ICONS: Record<string, LucideIcon> = {
  "help-circle": HelpCircle,
  "message-square-reply": MessageSquareReply,
  star: Sparkles,
  trophy: Trophy,
  flame: Flame,
  award: Award,
  library: Library,
  lightbulb: Lightbulb,
  "calendar-check": CalendarCheck,
};

export default function ProfilePage() {
  const params = useParams<{ userName?: string }>();
  const userName = params.userName
    ? decodeURIComponent(params.userName)
    : CURRENT_USER;
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useGetProfile(userName);
  const { data: activity = [] } = useListProfileActivity(userName);
  const { data: followers = [] } = useListFollowers(userName);
  const { data: following = [] } = useListFollowing(userName);
  const follow = useFollowUser();
  const unfollow = useUnfollowUser();

  const isMe = profile?.isMe ?? userName === CURRENT_USER;
  const isFollowing = profile?.isFollowedByMe ?? false;

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetProfileQueryKey(userName) });
    qc.invalidateQueries({
      queryKey: ["/api/profiles", userName, "followers"],
    });
    qc.invalidateQueries({ queryKey: getGetMyGamificationQueryKey() });
  }

  function onFollow() {
    follow.mutate(
      { userName },
      {
        onSuccess: () => {
          toast({ title: `Following ${profile?.profile.displayName}` });
          invalidate();
        },
      },
    );
  }
  function onUnfollow() {
    unfollow.mutate(
      { userName },
      {
        onSuccess: () => {
          toast({ title: `Unfollowed ${profile?.profile.displayName}` });
          invalidate();
        },
      },
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Skeleton className="h-44 rounded-xl" />
        <div className="mt-6 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const p = profile.profile;
  const a = profile.analytics;
  const initials = p.displayName
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/40" />
        <CardContent className="p-6 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <img
              src={p.avatarUrl}
              alt={p.displayName}
              className="w-24 h-24 rounded-full ring-4 ring-background object-cover bg-muted flex-shrink-0"
              data-testid="img-profile-avatar"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 flex-wrap">
                <div>
                  <h1
                    className="font-serif text-3xl font-bold text-foreground"
                    data-testid="text-profile-name"
                  >
                    {p.displayName}
                  </h1>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      {p.course || "Student"}
                      {p.yearOfStudy ? ` · ${p.yearOfStudy}` : ""}
                    </span>
                    {p.college && (
                      <span className="flex items-center gap-1.5">
                        <Library className="w-4 h-4" />
                        {p.college}
                      </span>
                    )}
                    {p.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {p.location}
                      </span>
                    )}
                    {p.isPrivate && (
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        data-testid="badge-private"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Private profile
                      </Badge>
                    )}
                  </div>
                  {!initials || null}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {isMe ? (
                    <Link href="/wallet">
                      <Button
                        variant="outline"
                        data-testid="button-open-wallet"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Wallet
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid="button-message"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      {isFollowing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onUnfollow}
                          disabled={unfollow.isPending}
                          data-testid="button-unfollow"
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Following
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={onFollow}
                          disabled={follow.isPending}
                          data-testid="button-follow"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {p.bio && (
                <p
                  className="mt-3 text-foreground/90 leading-relaxed"
                  data-testid="text-profile-bio"
                >
                  {p.bio}
                </p>
              )}
              <div className="mt-4 flex items-center gap-5 text-sm flex-wrap">
                <span data-testid="text-follower-count">
                  <span className="font-bold">{profile.followerCount}</span>{" "}
                  <span className="text-muted-foreground">followers</span>
                </span>
                <span data-testid="text-following-count">
                  <span className="font-bold">{profile.followingCount}</span>{" "}
                  <span className="text-muted-foreground">following</span>
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {new Date(p.joinedAt).toLocaleDateString()}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics row */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={Trophy}
          label="Rank"
          value={`#${a.rankAllTime}`}
          tone="primary"
        />
        <StatCard
          icon={Sparkles}
          label="Points"
          value={profile.points.toLocaleString()}
          tone="primary"
          sub={profile.levelLabel}
        />
        <StatCard
          icon={HelpCircle}
          label="Questions"
          value={a.questionsAsked}
        />
        <StatCard
          icon={MessageSquareReply}
          label="Answers"
          value={a.answersGiven}
        />
        <StatCard
          icon={CheckCircle2}
          label="Best"
          value={a.bestAnswers}
          tone="success"
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${profile.currentStreak}d`}
          tone="warning"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="about" className="mt-8">
        <TabsList>
          <TabsTrigger value="about" data-testid="tab-about">
            About
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            Activity
          </TabsTrigger>
          <TabsTrigger value="badges" data-testid="tab-badges">
            Badges
          </TabsTrigger>
          <TabsTrigger value="followers" data-testid="tab-followers">
            Followers
          </TabsTrigger>
          <TabsTrigger value="following" data-testid="tab-following">
            Following
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <ChipCard title="Subjects" items={p.subjects} />
            <ChipCard title="Skills" items={p.skills} />
            <ChipCard title="Interests" items={p.interests} />
            <ChipCard title="Activities" items={p.activities} />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityList items={activity} />
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          {profile.badges.length === 0 ? (
            <EmptyState text="No badges earned yet." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {profile.badges.map((b) => {
                const Icon = BADGE_ICONS[b.icon] ?? Award;
                return (
                  <Card key={b.code} data-testid={`badge-${b.code}`}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm">{b.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {b.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          <PeopleList items={followers} emptyText="No followers yet." />
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <PeopleList
            items={following}
            emptyText={
              isMe ? "You aren't following anyone yet." : "Not following anyone."
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "primary" | "success" | "warning";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "success"
        ? "bg-green-500/10 text-green-700"
        : tone === "warning"
          ? "bg-amber-500/10 text-amber-700"
          : "bg-muted text-foreground";
  return (
    <Card data-testid={`stat-${label.toLowerCase()}`}>
      <CardContent className="p-4">
        <div
          className={`w-9 h-9 rounded-md flex items-center justify-center ${toneClass}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="mt-2 text-2xl font-bold leading-none">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {label}
          {sub ? ` · ${sub}` : ""}
        </div>
      </CardContent>
    </Card>
  );
}

function ChipCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm font-semibold text-muted-foreground mb-3">
          {title}
        </div>
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground/70 italic">None yet</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {items.map((it) => (
              <Badge key={it} variant="secondary" className="font-normal">
                {it}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <EmptyState text="No recent activity." />;
  }
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const Icon =
          it.kind === "question"
            ? HelpCircle
            : it.kind === "answer"
              ? MessageSquareReply
              : Film;
        return (
          <Link key={it.id} href={it.href}>
            <Card
              className="cursor-pointer hover-elevate active-elevate-2"
              data-testid={`activity-${it.id}`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium line-clamp-1">{it.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {it.subtitle} · {formatRelative(it.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function PeopleList({
  items,
  emptyText,
}: {
  items: ProfileSummary[];
  emptyText: string;
}) {
  if (items.length === 0) return <EmptyState text={emptyText} />;
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((u) => (
        <Link
          key={u.userName}
          href={`/profile/${encodeURIComponent(u.userName)}`}
        >
          <Card
            className="cursor-pointer hover-elevate active-elevate-2"
            data-testid={`person-${u.userName.replace(/\s+/g, "-")}`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <img
                src={u.avatarUrl}
                alt={u.displayName}
                className="w-12 h-12 rounded-full object-cover bg-muted flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{u.displayName}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {u.course || u.bio || "EduConnect member"}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <Medal className="w-3 h-3 text-amber-600" />
                  <span className="text-muted-foreground">
                    {u.points.toLocaleString()} pts · {u.levelLabel}
                  </span>
                </div>
              </div>
              {u.isFollowedByMe && (
                <Badge variant="outline" className="text-[10px] flex-shrink-0">
                  Following
                </Badge>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        {text}
      </CardContent>
    </Card>
  );
}
