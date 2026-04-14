import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Funnels from "./pages/dashboard/Funnels";
import FunnelBuilder from "./pages/dashboard/FunnelBuilder";
import ChatPreview from "./pages/dashboard/ChatPreview";
import Leads from "./pages/dashboard/Leads";
import Analytics from "./pages/dashboard/Analytics";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import Profile from "./pages/dashboard/Profile";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import PublicFunnel from "./pages/PublicFunnel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/f/:slug" element={<PublicFunnel />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="funnels" element={<Funnels />} />
                <Route path="funnels/:funnelId/builder" element={<FunnelBuilder />} />
                <Route path="chat-preview" element={<ChatPreview />} />
                <Route path="leads" element={<Leads />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<DashboardSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
