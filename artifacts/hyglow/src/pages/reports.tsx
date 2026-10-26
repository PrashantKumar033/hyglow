import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetFinancialReport, useGetSalesReport, useGetInventoryReport } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { BarChart2, TrendingUp, Package, DollarSign } from "lucide-react";

const PIE_COLORS = ["hsl(191,97%,31%)", "hsl(262,83%,58%)", "hsl(45,93%,47%)", "hsl(142,71%,45%)", "hsl(350,89%,60%)", "hsl(200,70%,50%)"];

export default function ReportsPage() {
  const { data: financial, isLoading: finLoading } = useGetFinancialReport();
  const { data: salesReport } = useGetSalesReport();
  const { data: invReport } = useGetInventoryReport();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="w-6 h-6 text-primary" />Reports & Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1">Financial, sales and inventory analytics</p>
        </div>

        <Tabs defaultValue="financial">
          <TabsList className="mb-2">
            <TabsTrigger value="financial" className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Financial</TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />Sales</TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2"><Package className="w-4 h-4" />Inventory</TabsTrigger>
          </TabsList>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold text-primary">₹{(financial?.totalRevenue ?? 0).toLocaleString("en-IN")}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Expenses</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold text-red-500">₹{(financial?.totalExpenses ?? 0).toLocaleString("en-IN")}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Profit</CardTitle></CardHeader>
                <CardContent><p className={`text-2xl font-bold ${(financial?.netProfit ?? 0) >= 0 ? "text-green-600" : "text-red-500"}`}>₹{(financial?.netProfit ?? 0).toLocaleString("en-IN")}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Profit Margin</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{(financial?.profitMargin ?? 0).toFixed(1)}%</p>
                  <p className={`text-xs mt-1 font-medium ${(financial?.profitMargin ?? 0) > 20 ? "text-green-600" : "text-amber-500"}`}>
                    {(financial?.profitMargin ?? 0) > 20 ? "Healthy margin" : "Below target"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardHeader><CardTitle className="text-sm font-medium">Revenue vs Expenses (Monthly)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={financial?.monthlyData ?? []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(191,97%,31%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(191,97%,31%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(350,89%,60%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(350,89%,60%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(191,97%,31%)" fill="url(#colorRevenue)" name="Revenue" />
                      <Area type="monotone" dataKey="expenses" stroke="hsl(350,89%,60%)" fill="url(#colorExpenses)" name="Expenses" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Financial Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Revenue", value: financial?.totalRevenue ?? 0, color: "bg-primary" },
                    { label: "Expenses", value: financial?.totalExpenses ?? 0, color: "bg-red-500" },
                    { label: "Net Profit", value: financial?.netProfit ?? 0, color: "bg-green-500" },
                  ].map(item => {
                    const max = Math.max(financial?.totalRevenue ?? 1, 1);
                    const pct = Math.min(100, Math.abs(item.value) / max * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-semibold">₹{item.value.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Sales</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">₹{(salesReport?.totalSales ?? 0).toLocaleString("en-IN")}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{salesReport?.totalOrders ?? 0}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Order Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">₹{(salesReport?.avgOrderValue ?? 0).toFixed(0)}</p></CardContent></Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Top Customers by Revenue</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={salesReport?.topProducts ?? []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="customer" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                      <Bar dataKey="totalSales" fill="hsl(191,97%,31%)" radius={[0, 4, 4, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Top Customers Ranking</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(salesReport?.topProducts ?? []).slice(0, 5).map((c, i) => (
                      <div key={c.customer} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-slate-100 text-slate-500" : i === 2 ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{c.customer}</p>
                          <div className="w-full bg-muted h-1.5 rounded-full mt-1 overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${salesReport?.topProducts[0] ? (c.totalSales / salesReport.topProducts[0].totalSales) * 100 : 0}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-primary">₹{c.totalSales.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    {!salesReport?.topProducts?.length && <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Items</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{invReport?.totalItems ?? 0}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">₹{(invReport?.totalValue ?? 0).toLocaleString("en-IN")}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Low Stock</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-500">{invReport?.lowStockCount ?? 0}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Out of Stock</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">{invReport?.outOfStockCount ?? 0}</p></CardContent></Card>
            </div>

            {(invReport as any)?.categoryBreakdown && (invReport as any).categoryBreakdown.length > 0 && (
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Inventory by Category</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={(invReport as any).categoryBreakdown} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={({ category, percent }: any) => `${category} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {(invReport as any).categoryBreakdown.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Category Details</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(invReport as any).categoryBreakdown.map((cat: any, i: number) => (
                        <div key={cat.category} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-sm flex-1">{cat.category}</span>
                          <Badge variant="outline">{cat.count} items</Badge>
                          <span className="text-sm font-bold">₹{cat.value.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
