import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetPurchaseOrders, useCreatePurchaseOrder, useDeletePurchaseOrder, useGetSalesOrders, useCreateSalesOrder, useDeleteSalesOrder, getGetPurchaseOrdersQueryKey, getGetSalesOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface OrderForm { date: string; vendor: string; items: string; totalAmount: string; status: string; deliveryDate: string; }

function OrderTable({ orders, isLoading, onDelete, search }: { orders: any[] | undefined; isLoading: boolean; onDelete: (id: number) => void; search: string }) {
  const q = search.toLowerCase();
  const filtered = orders?.filter(o => !q || o.vendor.toLowerCase().includes(q) || o.orderNumber?.toLowerCase().includes(q)) ?? [];

  return (
    <div>
      <Table>
        <TableHeader><TableRow><TableHead>Order #</TableHead><TableHead>Date</TableHead><TableHead>Vendor/Customer</TableHead><TableHead className="text-right">Items</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead>Delivery</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{search ? "No orders match your search." : "No orders yet."}</TableCell></TableRow>
          ) : filtered.map(o => (
            <TableRow key={o.id}>
              <TableCell><code className="text-xs font-bold">{o.orderNumber}</code></TableCell>
              <TableCell className="text-sm">{o.date}</TableCell>
              <TableCell className="font-medium text-sm">{o.vendor}</TableCell>
              <TableCell className="text-right">{o.items}</TableCell>
              <TableCell className="text-right font-bold">₹{o.totalAmount.toLocaleString("en-IN")}</TableCell>
              <TableCell>
                <Badge className={
                  o.status === "approved" || o.status === "delivered"
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : o.status === "pending"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : o.status === "cancelled"
                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                    : "bg-muted text-muted-foreground"
                } variant="outline">{o.status}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{o.deliveryDate ?? "TBD"}</TableCell>
              <TableCell><Button variant="ghost" size="sm" onClick={() => onDelete(o.id)}>Delete</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filtered.length > 0 && (
        <div className="px-4 py-2 border-t text-xs text-muted-foreground">
          Showing {filtered.length} of {orders?.length ?? 0} orders
        </div>
      )}
    </div>
  );
}

export default function OrdersPage({ type }: { type: "purchase" | "sales" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: poOrders, isLoading: poLoading } = useGetPurchaseOrders();
  const { data: soOrders, isLoading: soLoading } = useGetSalesOrders();
  const createPO = useCreatePurchaseOrder();
  const deletePO = useDeletePurchaseOrder();
  const createSO = useCreateSalesOrder();
  const deleteSO = useDeleteSalesOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<OrderForm>({ defaultValues: { status: "pending", date: new Date().toISOString().split("T")[0], items: "1" } });

  const orders = type === "purchase" ? poOrders : soOrders;
  const isLoading = type === "purchase" ? poLoading : soLoading;

  const totalValue = orders?.reduce((s, o) => s + o.totalAmount, 0) ?? 0;
  const pendingCount = orders?.filter(o => o.status === "pending").length ?? 0;
  const approvedCount = orders?.filter(o => o.status === "approved" || o.status === "delivered").length ?? 0;

  const onSubmit = async (data: OrderForm) => {
    const payload = { date: data.date, vendor: data.vendor, items: parseInt(data.items), totalAmount: parseFloat(data.totalAmount), status: data.status, deliveryDate: data.deliveryDate || null };
    if (type === "purchase") {
      await createPO.mutateAsync({ data: payload });
      queryClient.invalidateQueries({ queryKey: getGetPurchaseOrdersQueryKey() });
    } else {
      await createSO.mutateAsync({ data: payload });
      queryClient.invalidateQueries({ queryKey: getGetSalesOrdersQueryKey() });
    }
    reset(); setOpen(false);
    toast({ title: `${type === "purchase" ? "Purchase" : "Sales"} order created` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-primary" />
              {type === "purchase" ? "Purchase Orders" : "Sales Orders"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">{type === "purchase" ? "Vendor purchase orders (PO)" : "Customer sales orders (SO)"}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-order"><Plus className="w-4 h-4 mr-2" />New Order</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create {type === "purchase" ? "Purchase" : "Sales"} Order</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date</Label><Input type="date" {...register("date")} /></div>
                  <div><Label>{type === "purchase" ? "Vendor" : "Customer"}</Label><Input {...register("vendor")} /></div>
                  <div><Label>Items Count</Label><Input type="number" {...register("items")} /></div>
                  <div><Label>Total Amount ($)</Label><Input type="number" step="0.01" {...register("totalAmount")} /></div>
                  <div><Label>Delivery Date</Label><Input type="date" {...register("deliveryDate")} /></div>
                  <div><Label>Status</Label>
                    <Select onValueChange={(v) => setValue("status", v)} defaultValue="pending">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createPO.isPending || createSO.isPending}>Create Order</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{orders?.length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-500">{pendingCount}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">₹{totalValue.toLocaleString("en-IN")}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium">Order List</CardTitle>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Search by ${type === "purchase" ? "vendor" : "customer"} or order #...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm"
                  data-testid="input-search-orders"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {type === "purchase"
              ? <OrderTable orders={poOrders} isLoading={poLoading} search={search} onDelete={(id) => { deletePO.mutate({ id }); queryClient.invalidateQueries({ queryKey: getGetPurchaseOrdersQueryKey() }); }} />
              : <OrderTable orders={soOrders} isLoading={soLoading} search={search} onDelete={(id) => { deleteSO.mutate({ id }); queryClient.invalidateQueries({ queryKey: getGetSalesOrdersQueryKey() }); }} />
            }
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
