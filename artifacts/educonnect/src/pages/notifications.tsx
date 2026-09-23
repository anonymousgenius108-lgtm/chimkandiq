import { Link } from "wouter";
import {
  useListNotifications,
  useMarkNotificationRead,
} from "@workspace/api-client-react";
import { Bell, Calendar, MessageSquare, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/format";

const ICONS: Record<string, React.ElementType> = {
  booking_confirmed: Calendar,
  session_reminder: Calendar,
  message: MessageSquare,
  review_request: Star,
};

export default function Notifications() {
  const { data: notifications = [], isLoading, refetch } = useListNotifications();
  const markRead = useMarkNotificationRead();

  const markAll = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(
      unread.map((n) =>
        markRead.mutateAsync({ notificationId: n.id }).catch(() => null),
      ),
    );
    refetch();
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Reminders, messages, and updates about your sessions.
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAll}
            data-testid="button-mark-all-read"
          >
            Mark all as read
          </Button>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-bold text-lg mb-1">No notifications</h3>
            <p className="text-muted-foreground">
              You're all caught up.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            const handleClick = () => {
              if (!n.read) {
                markRead.mutate({ notificationId: n.id });
              }
            };
            const Wrapper = ({ children }: { children: React.ReactNode }) =>
              n.link ? (
                <Link
                  href={n.link}
                  onClick={handleClick}
                  data-testid={`link-notification-${n.id}`}
                >
                  {children}
                </Link>
              ) : (
                <div onClick={handleClick}>{children}</div>
              );
            return (
              <Wrapper key={n.id}>
                <Card
                  className={`cursor-pointer hover-elevate active-elevate-2 ${
                    !n.read ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`p-2 rounded-md ${!n.read ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className={`text-sm ${!n.read ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                          {n.title}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatRelative(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {n.body}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    )}
                  </CardContent>
                </Card>
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}
