import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, pointsEventsTable, userStatsTable } from "@workspace/db";
import {
  GetMyWalletResponse,
  RequestWithdrawBody,
  RequestWithdrawResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const CURRENT_USER = "Alex Morgan";
const MIN_WITHDRAW = 100;
const CURRENCY = "INR";

async function balanceFor(userName: string): Promise<{
  total: number;
  week: number;
  month: number;
}> {
  const [base] = await db
    .select({ p: userStatsTable.points })
    .from(userStatsTable)
    .where(eq(userStatsTable.userName, userName));
  const [evt] = await db
    .select({
      t: sql<number>`coalesce(sum(${pointsEventsTable.points}), 0)`.mapWith(
        Number,
      ),
    })
    .from(pointsEventsTable)
    .where(eq(pointsEventsTable.userName, userName));
  const total = (base?.p ?? 0) + (evt?.t ?? 0);

  const now = new Date();
  const weekCutoff = new Date(now);
  weekCutoff.setUTCDate(weekCutoff.getUTCDate() - 7);
  const monthCutoff = new Date(now);
  monthCutoff.setUTCDate(monthCutoff.getUTCDate() - 30);

  const [weekRow] = await db
    .select({
      t: sql<number>`coalesce(sum(${pointsEventsTable.points}), 0)`.mapWith(
        Number,
      ),
    })
    .from(pointsEventsTable)
    .where(
      sql`${pointsEventsTable.userName} = ${userName} and ${pointsEventsTable.awardedAt} >= ${weekCutoff.toISOString()}`,
    );
  const [monthRow] = await db
    .select({
      t: sql<number>`coalesce(sum(${pointsEventsTable.points}), 0)`.mapWith(
        Number,
      ),
    })
    .from(pointsEventsTable)
    .where(
      sql`${pointsEventsTable.userName} = ${userName} and ${pointsEventsTable.awardedAt} >= ${monthCutoff.toISOString()}`,
    );

  return {
    total: Math.max(0, total),
    week: weekRow?.t ?? 0,
    month: monthRow?.t ?? 0,
  };
}

router.get("/wallet/me", async (_req, res): Promise<void> => {
  const balance = await balanceFor(CURRENT_USER);
  const events = await db
    .select()
    .from(pointsEventsTable)
    .where(eq(pointsEventsTable.userName, CURRENT_USER))
    .orderBy(desc(pointsEventsTable.awardedAt))
    .limit(20);

  res.json(
    GetMyWalletResponse.parse({
      userName: CURRENT_USER,
      credits: balance.total,
      creditsThisWeek: balance.week,
      creditsThisMonth: balance.month,
      withdrawableCredits: balance.total >= MIN_WITHDRAW ? balance.total : 0,
      minWithdrawCredits: MIN_WITHDRAW,
      currency: CURRENCY,
      history: events.map((e) => ({
        id: e.id,
        kind: e.kind,
        amount: e.points,
        reference: e.reference,
        occurredAt: e.awardedAt.toISOString(),
      })),
    }),
  );
});

router.post("/wallet/withdraw", async (req, res): Promise<void> => {
  const body = RequestWithdrawBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const balance = await balanceFor(CURRENT_USER);
  if (balance.total < MIN_WITHDRAW) {
    res
      .status(400)
      .json({ error: `Need at least ${MIN_WITHDRAW} credits to withdraw.` });
    return;
  }
  const amount = Math.min(body.data.amount, balance.total);

  const [evt] = await db
    .insert(pointsEventsTable)
    .values({
      userName: CURRENT_USER,
      kind: "withdraw",
      points: -amount,
      reference: `Withdraw to bank · ${new Date().toISOString().slice(0, 10)}`,
    })
    .returning();

  const newBalance = balance.total - amount;
  res.json(
    RequestWithdrawResponse.parse({
      success: true,
      amount,
      currency: CURRENCY,
      creditsRemaining: newBalance,
      reference: evt?.id ?? "",
      message: `Demo only — in production, ${CURRENCY} ${amount} would be transferred to your bank.`,
    }),
  );
});

export default router;
