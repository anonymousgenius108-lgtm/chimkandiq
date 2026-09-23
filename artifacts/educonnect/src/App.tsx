import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { ProtectedRoute, TutorRoute, AuthedRoute } from "@/components/protected-route";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Home from "@/pages/home";
import Tutors from "@/pages/tutors";
import TutorDetail from "@/pages/tutor-detail";
import Bookings from "@/pages/bookings";
import BookingDetail from "@/pages/booking-detail";
import Messages from "@/pages/messages";
import MessageThread from "@/pages/message-thread";
import Dashboard from "@/pages/dashboard";
import Notifications from "@/pages/notifications";
import QnA from "@/pages/qna";
import QnAAsk from "@/pages/qna-ask";
import QnADetail from "@/pages/qna-detail";
import Reels from "@/pages/reels";
import ReelsUpload from "@/pages/reels-upload";
import LuckyRoyal from "@/pages/lucky-royal";
import LuckyRoyalRoom from "@/pages/lucky-royal-room";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import SearchPage from "@/pages/search";
import Wallet from "@/pages/wallet";
import TutorDashboard from "@/pages/tutor-dashboard";
import Codelab from "@/pages/codelab";
import CodelabIde from "@/pages/codelab-ide";
import Library from "@/pages/library";
import LibraryReader from "@/pages/library-reader";
import Marketplace from "@/pages/marketplace";
import MarketplaceItem from "@/pages/marketplace-item";
import Focus from "@/pages/focus";
import StudyRooms from "@/pages/study-rooms";
import StudyRoomDetail from "@/pages/study-room-detail";
import Signup from "@/pages/signup";
import OnboardingStudent from "@/pages/onboarding-student";
import OnboardingTutor from "@/pages/onboarding-tutor";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* ── Public routes ──────────────────────────────────────────────── */}
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/signup">
        <Signup />
      </Route>
      <Route path="/onboarding/student">
        <OnboardingStudent />
      </Route>
      <Route path="/onboarding/tutor">
        <OnboardingTutor />
      </Route>

      {/* ── Tutor-only routes (students see Access Denied) ─────────────── */}
      <Route path="/tutor-dashboard">
        <TutorRoute>
          <TutorDashboard />
        </TutorRoute>
      </Route>

      {/* ── Tutor-only: Reels upload (host/creator feature) ───────────── */}
      <Route path="/reels/upload">
        <TutorRoute>
          <ReelsUpload />
        </TutorRoute>
      </Route>

      {/* ── Study room: full-screen layout (no sidebar) ───────────────── */}
      <Route path="/study-rooms/:roomId">
        <ProtectedRoute>
          <StudyRoomDetail />
        </ProtectedRoute>
      </Route>

      {/* ── Shared authenticated routes (both students and tutors) ─────── */}
      <Route path="/">
        <AuthedRoute><Home /></AuthedRoute>
      </Route>
      <Route path="/tutors">
        <AuthedRoute><Tutors /></AuthedRoute>
      </Route>
      <Route path="/tutors/:tutorId">
        <AuthedRoute><TutorDetail /></AuthedRoute>
      </Route>
      <Route path="/bookings">
        <AuthedRoute><Bookings /></AuthedRoute>
      </Route>
      <Route path="/bookings/:bookingId">
        <AuthedRoute><BookingDetail /></AuthedRoute>
      </Route>
      <Route path="/messages">
        <AuthedRoute><Messages /></AuthedRoute>
      </Route>
      <Route path="/messages/:tutorId">
        <AuthedRoute><MessageThread /></AuthedRoute>
      </Route>
      <Route path="/dashboard">
        <AuthedRoute><Dashboard /></AuthedRoute>
      </Route>
      <Route path="/notifications">
        <AuthedRoute><Notifications /></AuthedRoute>
      </Route>
      <Route path="/qna/ask">
        <AuthedRoute><QnAAsk /></AuthedRoute>
      </Route>
      <Route path="/qna/:questionId">
        <AuthedRoute><QnADetail /></AuthedRoute>
      </Route>
      <Route path="/qna">
        <AuthedRoute><QnA /></AuthedRoute>
      </Route>
      <Route path="/reels">
        <AuthedRoute><Reels /></AuthedRoute>
      </Route>
      <Route path="/lucky-royal/:id">
        <AuthedRoute><LuckyRoyalRoom /></AuthedRoute>
      </Route>
      <Route path="/lucky-royal">
        <AuthedRoute><LuckyRoyal /></AuthedRoute>
      </Route>
      <Route path="/leaderboard">
        <AuthedRoute><Leaderboard /></AuthedRoute>
      </Route>
      <Route path="/search">
        <AuthedRoute><SearchPage /></AuthedRoute>
      </Route>
      <Route path="/wallet">
        <AuthedRoute><Wallet /></AuthedRoute>
      </Route>
      <Route path="/profile">
        <AuthedRoute><Profile /></AuthedRoute>
      </Route>
      <Route path="/profile/:userName">
        <AuthedRoute><Profile /></AuthedRoute>
      </Route>
      <Route path="/codelab/:slug">
        <AuthedRoute><CodelabIde /></AuthedRoute>
      </Route>
      <Route path="/codelab">
        <AuthedRoute><Codelab /></AuthedRoute>
      </Route>
      <Route path="/library/:id">
        <AuthedRoute><LibraryReader /></AuthedRoute>
      </Route>
      <Route path="/library">
        <AuthedRoute><Library /></AuthedRoute>
      </Route>
      <Route path="/marketplace/:id">
        <AuthedRoute><MarketplaceItem /></AuthedRoute>
      </Route>
      <Route path="/marketplace">
        <AuthedRoute><Marketplace /></AuthedRoute>
      </Route>
      <Route path="/focus">
        <AuthedRoute><Focus /></AuthedRoute>
      </Route>
      <Route path="/study-rooms">
        <AuthedRoute><StudyRooms /></AuthedRoute>
      </Route>

      {/* ── 404 ───────────────────────────────────────────────────────── */}
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
