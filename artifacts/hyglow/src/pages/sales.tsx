import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetSales, useCreateSale, useDeleteSale, useGetTopCustomers, getGetSalesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Search, Trophy } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface SaleForm { date: string; customer: string; product: string; quantity: string; amount: string; status: string; paymentMethod: string; }

export default function SalesPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: sales, isLoading } = useGetSales();
  const { data: topCustomers } = useGetTopCustomers();
  const createSale = useCreateSale();
  const deleteSale = useDeleteSale();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<SaleForm>({ defaultValues: { status: "completed", paymentMethod: "card", date: new Date().toISOString().split("T")[0], quantity: "1" } });

  const onSubmit = async (data: SaleForm) => {
    await createSale.mutateAsync({ data: { ...data, quantity: parseInt(data.quantity), amount: parseFloat(data.amount) } });
    queryClient.invalidateQueries({ queryKey: getGetSalesQueryKey() });
    reset(); setOpen(false);
    toast({ title: "Sale recorded" });
  };

  const q = search.toLowerCase();
  const filtered = sales?.filter(s =>
    !q || s.customer.toLowerCase().includes(q) || s.product.toLowerCase().includes(q)
  ) ?? [];

  const totalRevenue = sales?.reduce((sum, s) => sum + s.amount, 0) ?? 0;
  const completedCount = sales?.filter(s => s.status === "completed").length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="w-6 h-6 text-primary" />Sales</h2><p className="text-muted-foreground text-sm mt-1">Sales records and customer analytics</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-sale"><Plus className="w-4 h-4 mr-2" />Record Sale</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Record New Sale</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date</Label><Input type="date" {...register("date")} /></div>
                  <div><Label>Customer</Label><Input {...register("customer")} /></div>
                  <div><Label>Product</Label><Input {...register("product")} /></div>
                  <div><Label>Quantity</Label><Input type="number" {...register("quantity")} /></div>
                  <div><Label>Amount ($)</Label><Input type="number" step="0.01" {...register("amount")} /></div>
                  <div><Label>Payment Method</Label>
                    <Select onValueChange={(v) => setValue("paymentMethod", v)} defaultValue="card">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="card">Card</SelectItem><SelectItem value="cash">Cash</SelectItem><SelectItem value="transfer">Bank Transfer</SelectItem><SelectItem value="check">Check</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Status</Label>
                    <Select onValueChange={(v) => setValue("status", v)} defaultValue="completed">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="completed">Completed</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createSale.isPending}>Record Sale</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">₹{totalRevenue.toLocaleString("en-IN")}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{sales?.length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Completed</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{completedCount}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Order Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">₹{sales?.length ? Math.round(totalRevenue / sales.length).toLocaleString("en-IN") : 0}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-sm font-medium">Sales Records</CardTitle>
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customer or product..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-9 h-8 text-sm"
                      data-testid="input-search-sales"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Customer</TableHead><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{search ? "No sales match your search." : "No sales recorded yet."}</TableCell></TableRow>
                    ) : filtered.map(sale => (
                      <TableRow key={sale.id} data-testid={`row-sale-${sale.id}`}>
                        <TableCell className="text-sm">{sale.date}</TableCell>
                        <TableCell className="font-medium text-sm">{sale.customer}</TableCell>
                        <TableCell className="text-sm">{sale.product}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell className="font-medium">₹{sale.amount.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-sm capitalize">{sale.paymentMethod}</TableCell>
                        <TableCell><Badge className={sale.status === "completed" ? "bg-green-500/10 text-green-600 border-green-500/20" : sale.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"} variant="outline">{sale.status}</Badge></TableCell>
                        <TableCell><Button variant="ghost" size="sm" onClick={() => { deleteSale.mutate({ id: sale.id }); queryClient.invalidateQueries({ queryKey: getGetSalesQueryKey() }); }}>Delete</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filtered.length > 0 && (
                  <div className="px-4 py-2 border-t text-xs text-muted-foreground">
                    Showing {filtered.length} of {sales?.length ?? 0} records
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" />Top Customers</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCustomers?.slice(0, 5).map((c, i) => (
                    <div key={c.customer} className="flex items-center gap-3">
                      <span className={`text-xs font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-slate-100 text-slate-500" : i === 2 ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.customer}</p>
                        <div className="w-full bg-muted rounded-full h-1 mt-1">
                          <div className="bg-primary h-1 rounded-full" style={{ width: `${topCustomers[0] ? (c.totalSales / topCustomers[0].totalSales) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary flex-shrink-0">₹{c.totalSales.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                  {!topCustomers?.length && <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
