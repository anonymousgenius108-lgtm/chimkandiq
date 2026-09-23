import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subjectsRouter from "./subjects";
import tutorsRouter from "./tutors";
import bookingsRouter from "./bookings";
import messagesRouter from "./messages";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import questionsRouter from "./questions";
import reelsRouter from "./reels";
import gamificationRouter from "./gamification";
import profilesRouter from "./profiles";
import searchRouter from "./search";
import walletRouter from "./wallet";
import tutorDashboardRouter from "./tutor-dashboard";
import codelabRouter from "./codelab";
import libraryRouter from "./library";
import marketplaceRouter from "./marketplace";
import luckyRoyalRouter from "./lucky-royal";
import roomsRouter from "./rooms";
import { requireTutor } from "../middleware/auth";

const router: IRouter = Router();

// ── Public / student routes ───────────────────────────────────────────────────
router.use(healthRouter);
router.use(subjectsRouter);
router.use(tutorsRouter);
router.use(bookingsRouter);
router.use(messagesRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(questionsRouter);
router.use(reelsRouter);
router.use(gamificationRouter);
router.use(profilesRouter);
router.use(searchRouter);
router.use(walletRouter);
router.use(codelabRouter);
router.use(libraryRouter);
router.use(marketplaceRouter);
router.use(luckyRoyalRouter);
router.use(roomsRouter);

// ── Tutor-only routes ─────────────────────────────────────────────────────────
// Apply requireTutor as a path-guard: any request to /tutor-dashboard/*
// must carry X-User-Role: tutor (or admin). The router itself retains its
// full paths (/tutor-dashboard/overview etc.) by mounting at root.
router.use("/tutor-dashboard", requireTutor);
router.use(tutorDashboardRouter);

export default router;
