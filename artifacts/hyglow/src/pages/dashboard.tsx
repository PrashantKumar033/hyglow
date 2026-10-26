import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  useGetDashboardSummary,
  useGetRecentActivity,
  useGetRevenueChart,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  FileText,
  AlertTriangle,
  Bell,
  ShoppingCart,
  CreditCard,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Link } from "wouter";

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  prefix = "",
  suffix = "",
  href,
  color = "text-foreground",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  prefix?: string;
  suffix?: string;
  href?: string;
  color?: string;
}) {
  const content = (
    <Card className="hover:shadow-md transition-all hover:border-primary/20 group cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{prefix}{typeof value === "number" ? value.toLocaleString("en-IN") : value}{suffix}</div>
        {change !== undefined && (
          <p className={`text-xs flex items-center gap-1 mt-1 ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: chartData } = useGetRevenueChart();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const quickActions = [
    { label: "Record Sale", href: "/sales", icon: TrendingUp },
    { label: "Create Invoice", href: "/invoices", icon: FileText },
    { label: "Add Employee", href: "/hr", icon: Users },
    { label: "New Shipment", href: "/logistics", icon: Truck },
    { label: "Add Product", href: "/products", icon: Package },
    { label: "Log Expense", href: "/expenses", icon: CreditCard },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {greeting}, {user?.name?.split(" ")[0] ?? "Admin"} 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Here's your business overview for today.
            </p>
          </div>
          <Badge variant="outline" className="text-xs hidden md:flex">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </Badge>
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Revenue"
            value={summary?.totalRevenue ?? 0}
            icon={DollarSign}
            change={summary?.revenueGrowth}
            prefix="₹"
            href="/sales"
            color="text-primary"
          />
          <StatCard
            title="Total Expenses"
            value={summary?.totalExpenses ?? 0}
            icon={CreditCard}
            prefix="₹"
            href="/expenses"
            color="text-red-500"
          />
          <StatCard
            title="Total Orders"
            value={summary?.totalOrders ?? 0}
            icon={ShoppingCart}
            change={summary?.ordersGrowth}
            href="/orders/sales"
          />
          <StatCard
            title="Total Employees"
            value={summary?.totalEmployees ?? 0}
            icon={Users}
            href="/hr"
          />
        </div>

        {/* Charts + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">Revenue Overview</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Monthly revenue trend</p>
                </div>
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                    View Reports <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData ?? []}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(191,97%,31%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(191,97%,31%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(191,97%,31%)"
                    strokeWidth={2}
                    fill="url(#revGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Recent Activity
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
                  </div>
                ) : activity?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                ) : activity?.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-3 h-3 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/invoices">
            <Card className="hover:border-primary/20 transition-colors cursor-pointer bg-amber-500/5 border-amber-500/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Pending Invoices</p>
                    <p className="text-xl font-bold mt-1 text-amber-600">{summary?.pendingInvoices ?? 0}</p>
                  </div>
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/inventory">
            <Card className="hover:border-primary/20 transition-colors cursor-pointer bg-red-500/5 border-red-500/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Low Stock Items</p>
                    <p className="text-xl font-bold mt-1 text-red-500">{summary?.lowStockAlerts ?? 0}</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/support">
            <Card className="hover:border-primary/20 transition-colors cursor-pointer">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Open Tickets</p>
                    <p className="text-xl font-bold mt-1">{(summary as any)?.openTickets ?? 0}</p>
                  </div>
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/notifications">
            <Card className="hover:border-primary/20 transition-colors cursor-pointer bg-primary/5 border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Unread Notifications</p>
                    <p className="text-xl font-bold mt-1 text-primary">{(summary as any)?.unreadNotifications ?? 0}</p>
                  </div>
                  <Bell className="w-5 h-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <action.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
