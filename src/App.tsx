import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { NotificationPermissionBanner } from "./components/notifications/NotificationPermissionBanner";
import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import Index from "./pages/Index";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/Admin/Dashboard";
import CreatePoll from "./pages/Admin/CreatePoll";
import CreateQuiz from "./pages/Admin/CreateQuiz";
import TownsList from "./pages/Towns/TownsList";
import TownDetail from "./pages/Towns/TownDetail";
import StoriesList from "./pages/Stories/StoriesList";
import StoryDetail from "./pages/Stories/StoryDetail";
import SubmitStory from "./pages/Stories/SubmitStory";
import SearchStories from "./pages/Stories/SearchStories";
import MemoryWall from "./pages/MemoryWall/MemoryWall";
import SubmitTribute from "./pages/MemoryWall/SubmitTribute";
import PollsList from "./pages/Polls/PollsList";
import PollDetail from "./pages/Polls/PollDetail";
import QuizzesList from "./pages/Quizzes/QuizzesList";
import QuizDetail from "./pages/Quizzes/QuizDetail";
import Leaderboard from "./pages/Leaderboard";
import PartnersList from "./pages/Partners/PartnersList";
import PartnerDetail from "./pages/Partners/PartnerDetail";
import SubmitPartner from "./pages/Partners/SubmitPartner";
import VoicesAbroad from "./pages/Diaspora/VoicesAbroad";
import SubmitPost from "./pages/Diaspora/SubmitPost";
import Timeline from "./pages/Heritage/Timeline";
import SubmitTimeline from "./pages/Heritage/SubmitTimeline";
import FamilyTreeBuilder from "./pages/FamilyTree/FamilyTreeBuilder";
import AddMember from "./pages/FamilyTree/AddMember";
import ToursList from "./pages/VirtualTours/ToursList";
import CreateTour from "./pages/VirtualTours/CreateTour";
import EventsCalendar from "./pages/Events/EventsCalendar";
import CreateEvent from "./pages/Events/CreateEvent";
import CampaignsList from "./pages/Crowdfunding/CampaignsList";
import CreateCampaign from "./pages/Crowdfunding/CreateCampaign";
import CampaignDetail from "./pages/Crowdfunding/CampaignDetail";
import ManageDonations from "./pages/Admin/ManageDonations";
import ManageCampaigns from "./pages/Admin/ManageCampaigns";
import About from "./pages/About";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Auth from "./pages/Auth/Auth";
import TimeCapsuleList from "./pages/TimeCapsule/TimeCapsuleList";
import CreateTimeCapsule from "./pages/TimeCapsule/CreateTimeCapsule";
import TimeCapsuleDetail from "./pages/TimeCapsule/TimeCapsuleDetail";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NewsList from "./pages/News/NewsList";
import NewsDetail from "./pages/News/NewsDetail";
import AdminNewsForm from "./pages/Admin/AdminNewsForm";
import AdminNewsManagement from "./pages/Admin/AdminNewsManagement";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationPermissionBanner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <GoogleAnalytics />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/polls/create"
              element={
                <ProtectedRoute requireAdmin>
                  <CreatePoll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/quizzes/create"
              element={
                <ProtectedRoute requireAdmin>
                  <CreateQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/donations"
              element={
                <ProtectedRoute requireAdmin>
                  <ManageDonations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/campaigns"
              element={
                <ProtectedRoute requireAdmin>
                  <ManageCampaigns />
                </ProtectedRoute>
              }
            />
            <Route path="/towns" element={<TownsList />} />
            <Route path="/towns/:slug" element={<TownDetail />} />
            <Route path="/stories" element={<StoriesList />} />
            <Route path="/stories/search" element={<SearchStories />} />
            <Route path="/stories/:id" element={<StoryDetail />} />
            <Route path="/submit" element={<SubmitStory />} />
            <Route path="/memory-wall" element={<MemoryWall />} />
            <Route path="/memory-wall/submit" element={<ProtectedRoute><SubmitTribute /></ProtectedRoute>} />
            <Route path="/polls" element={<PollsList />} />
            <Route path="/polls/:id" element={<PollDetail />} />
            <Route path="/quizzes" element={<QuizzesList />} />
            <Route path="/quizzes/:id" element={<QuizDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/partners" element={<PartnersList />} />
            <Route path="/partners/:id" element={<PartnerDetail />} />
            <Route path="/partners/submit" element={<ProtectedRoute><SubmitPartner /></ProtectedRoute>} />
            <Route path="/voices-abroad" element={<VoicesAbroad />} />
            <Route path="/diaspora" element={<VoicesAbroad />} />
            <Route path="/voices-abroad/submit" element={<ProtectedRoute><SubmitPost /></ProtectedRoute>} />
            <Route path="/diaspora/submit" element={<ProtectedRoute><SubmitPost /></ProtectedRoute>} />
            <Route path="/heritage" element={<Timeline />} />
            <Route path="/heritage/timeline" element={<Timeline />} />
            <Route path="/heritage/timeline/submit" element={<ProtectedRoute><SubmitTimeline /></ProtectedRoute>} />
            <Route path="/family-tree" element={<ProtectedRoute><FamilyTreeBuilder /></ProtectedRoute>} />
            <Route path="/family-tree/add" element={<ProtectedRoute><AddMember /></ProtectedRoute>} />
            <Route path="/virtual-tours" element={<ToursList />} />
            <Route path="/virtual-tours/create" element={<ProtectedRoute><CreateTour /></ProtectedRoute>} />
            <Route path="/events" element={<EventsCalendar />} />
            <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
            <Route path="/crowdfunding" element={<CampaignsList />} />
            <Route path="/crowdfunding/:id" element={<CampaignDetail />} />
            <Route path="/crowdfunding/create" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/install" element={<Install />} />
            <Route path="/time-capsule" element={<TimeCapsuleList />} />
            <Route path="/time-capsule/create" element={<ProtectedRoute><CreateTimeCapsule /></ProtectedRoute>} />
            <Route path="/time-capsule/:id" element={<TimeCapsuleDetail />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/news" element={<NewsList />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/admin/news" element={<ProtectedRoute requireAdmin><AdminNewsManagement /></ProtectedRoute>} />
            <Route path="/admin/news/create" element={<ProtectedRoute requireAdmin><AdminNewsForm /></ProtectedRoute>} />
            <Route path="/admin/news/:id/edit" element={<ProtectedRoute requireAdmin><AdminNewsForm /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
  </ErrorBoundary>
);

export default App;
