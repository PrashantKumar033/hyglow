import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetInventory, useCreateInventoryItem, useDeleteInventoryItem, useGetLowStockItems, getGetInventoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, Warehouse, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface InvForm { productId: string; productName: string; sku: string; warehouse: string; quantity: string; minStock: string; maxStock: string; }

export default function InventoryPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const { data: inventory, isLoading } = useGetInventory();
  const { data: lowStock } = useGetLowStockItems();
  const createItem = useCreateInventoryItem();
  const deleteItem = useDeleteInventoryItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<InvForm>({ defaultValues: { quantity: "0", minStock: "10", maxStock: "100" } });

  const onSubmit = async (data: InvForm) => {
    await createItem.mutateAsync({ data: { productId: parseInt(data.productId), productName: data.productName, sku: data.sku, warehouse: data.warehouse, quantity: parseInt(data.quantity), minStock: parseInt(data.minStock), maxStock: parseInt(data.maxStock) } });
    queryClient.invalidateQueries({ queryKey: getGetInventoryQueryKey() });
    reset(); setOpen(false);
    toast({ title: "Inventory item added" });
  };

  const warehouses = Array.from(new Set(inventory?.map(i => i.warehouse) ?? []));

  const q = search.toLowerCase();
  const filtered = inventory?.filter(item =>
    (warehouseFilter === "all" || item.warehouse === warehouseFilter) &&
    (!q || item.productName.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || item.warehouse.toLowerCase().includes(q))
  ) ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><Warehouse className="w-6 h-6 text-primary" />Inventory</h2><p className="text-muted-foreground text-sm mt-1">Stock management across warehouses</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-inventory"><Plus className="w-4 h-4 mr-2" />Add Item</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Product ID</Label><Input type="number" {...register("productId")} /></div>
                  <div><Label>Product Name</Label><Input {...register("productName")} /></div>
                  <div><Label>SKU</Label><Input {...register("sku")} /></div>
                  <div><Label>Warehouse</Label><Input {...register("warehouse")} /></div>
                  <div><Label>Quantity</Label><Input type="number" {...register("quantity")} /></div>
                  <div><Label>Min Stock</Label><Input type="number" {...register("minStock")} /></div>
                  <div><Label>Max Stock</Label><Input type="number" {...register("maxStock")} /></div>
                </div>
                <Button type="submit" className="w-full" disabled={createItem.isPending}>Add to Inventory</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Items</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{inventory?.length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Low Stock</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-500">{lowStock?.length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Warehouses</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{warehouses.length}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Stock</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">{inventory?.reduce((s, i) => s + i.quantity, 0).toLocaleString("en-IN") ?? 0}</p></CardContent></Card>
        </div>

        {lowStock && lowStock.length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600"><AlertTriangle className="w-4 h-4" />Low Stock Warning — {lowStock.length} item{lowStock.length > 1 ? "s" : ""} need restocking</CardTitle></CardHeader>
            <CardContent><div className="flex flex-wrap gap-2">{lowStock.map(item => <Badge key={item.id} variant="outline" className="border-amber-500/30 text-amber-600">{item.productName} ({item.quantity} / {item.minStock} min)</Badge>)}</div></CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <CardTitle className="text-sm font-medium flex-1">Stock Levels</CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={warehouseFilter}
                  onChange={e => setWarehouseFilter(e.target.value)}
                  className="h-8 text-sm border rounded-md px-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All Warehouses</option>
                  {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search product or SKU..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 h-8 text-sm w-56"
                    data-testid="input-search-inventory"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Warehouse</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Min</TableHead><TableHead className="text-right">Max</TableHead><TableHead>Fill Rate</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">{search || warehouseFilter !== "all" ? "No items match your filters." : "No inventory items."}</TableCell></TableRow>
                ) : filtered.map(item => {
                  const isLow = item.quantity < item.minStock;
                  const fillRate = item.maxStock > 0 ? Math.min(100, Math.round((item.quantity / item.maxStock) * 100)) : 0;
                  return (
                    <TableRow key={item.id} data-testid={`row-inventory-${item.id}`}>
                      <TableCell className="font-medium text-sm">{item.productName}</TableCell>
                      <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{item.sku}</code></TableCell>
                      <TableCell><Badge variant="outline">{item.warehouse}</Badge></TableCell>
                      <TableCell className={`text-right font-bold ${isLow ? "text-red-500" : "text-green-600"}`}>{item.quantity}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">{item.minStock}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">{item.maxStock}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${fillRate < 20 ? "bg-red-500" : fillRate < 50 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${fillRate}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{fillRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge className={isLow ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-green-500/10 text-green-600 border-green-500/20"} variant="outline">{isLow ? "Low" : "OK"}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => { deleteItem.mutate({ id: item.id }); queryClient.invalidateQueries({ queryKey: getGetInventoryQueryKey() }); }}>Remove</Button></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filtered.length > 0 && (
              <div className="px-4 py-2 border-t text-xs text-muted-foreground">
                Showing {filtered.length} of {inventory?.length ?? 0} items
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
