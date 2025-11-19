import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "@/pages/home";
import Schedule from "@/pages/schedule";
import Scan from "@/pages/scan";
import History from "@/pages/history";
import Settings from "@/pages/settings";
import Caregivers from "@/pages/caregivers";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/scan" component={Scan} />
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      <Route path="/caregivers" component={Caregivers} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
