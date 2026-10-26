import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ApiSetup } from "@/lib/api-setup";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Ledger from "@/pages/ledger";
import HRPage from "@/pages/hr";
import SalesPage from "@/pages/sales";
import ProductsPage from "@/pages/products";
import InventoryPage from "@/pages/inventory";
import OrdersPage from "@/pages/orders";
import InvoicesPage from "@/pages/invoices";
import ExpensesPage from "@/pages/expenses";
import ReportsPage from "@/pages/reports";
import LogisticsPage from "@/pages/logistics";
import TrackingPage from "@/pages/tracking";
import NotificationsPage from "@/pages/notifications";
import MessagesPage from "@/pages/messages";
import SupportPage from "@/pages/support";
import AdminPanelPage from "@/pages/admin-panel";
import RolesPage from "@/pages/roles";
import PromotionsPage from "@/pages/promotions";
import ProfilePage from "@/pages/profile";
import LandingPage from "@/pages/landing";
import Signup from "@/pages/signup";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, componentProps }: { component: React.ComponentType<any>; componentProps?: any }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading Hyglow...</p>
      </div>
    </div>
  );
  if (!token) return <Redirect to="/login" />;

  return <Component {...(componentProps ?? {})} />;
}

function P({ component }: { component: React.ComponentType<any> }) {
  return <ProtectedRoute component={component} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={() => <P component={Dashboard} />} />
      <Route path="/ledger" component={() => <P component={Ledger} />} />
      <Route path="/hr" component={() => <P component={HRPage} />} />
      <Route path="/sales" component={() => <P component={SalesPage} />} />
      <Route path="/products" component={() => <P component={ProductsPage} />} />
      <Route path="/inventory" component={() => <P component={InventoryPage} />} />
      <Route path="/orders/purchase" component={() => <ProtectedRoute component={OrdersPage} componentProps={{ type: "purchase" }} />} />
      <Route path="/orders/sales" component={() => <ProtectedRoute component={OrdersPage} componentProps={{ type: "sales" }} />} />
      <Route path="/invoices" component={() => <P component={InvoicesPage} />} />
      <Route path="/expenses" component={() => <P component={ExpensesPage} />} />
      <Route path="/reports" component={() => <P component={ReportsPage} />} />
      <Route path="/logistics" component={() => <P component={LogisticsPage} />} />
      <Route path="/tracking" component={() => <P component={TrackingPage} />} />
      <Route path="/notifications" component={() => <P component={NotificationsPage} />} />
      <Route path="/messages" component={() => <P component={MessagesPage} />} />
      <Route path="/support" component={() => <P component={SupportPage} />} />
      <Route path="/admin/panel" component={() => <P component={AdminPanelPage} />} />
      <Route path="/admin/roles" component={() => <P component={RolesPage} />} />
      <Route path="/admin/promotions" component={() => <P component={PromotionsPage} />} />
      <Route path="/profile" component={() => <P component={ProfilePage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiSetup>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ApiSetup>
    </QueryClientProvider>
  );
}

export default App;
