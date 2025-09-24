import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react-router";
import SolanaProvider from "@/providers/SolanaProvider";
import Index from "./pages/Index";
import Auctions from "./pages/Auctions";
import Collections from "./pages/Collections";
import CreatorDashboard from "./pages/CreatorDashboard";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SolanaProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NuqsAdapter>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auctions" element={<Auctions />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/creator-dashboard" element={<CreatorDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NuqsAdapter>
      </TooltipProvider>
    </SolanaProvider>
  </QueryClientProvider>
);

export default App;
