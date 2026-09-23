import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import {
  ListNotificationsResponse,
  MarkNotificationReadParams,
  MarkNotificationReadResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notifications", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);
  res.json(
    ListNotificationsResponse.parse(
      rows.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
        link: n.link,
      })),
    ),
  );
});

router.post(
  "/notifications/:notificationId/read",
  async (req, res): Promise<void> => {
    const params = MarkNotificationReadParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [row] = await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.id, params.data.notificationId))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.json(
      MarkNotificationReadResponse.parse({
        id: row.id,
        type: row.type,
        title: row.title,
        body: row.body,
        read: row.read,
        createdAt: row.createdAt.toISOString(),
        link: row.link,
      }),
    );
  },
);

export default router;
