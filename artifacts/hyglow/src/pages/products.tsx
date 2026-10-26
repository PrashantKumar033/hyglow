import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetProducts, useCreateProduct, useDeleteProduct, getGetProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface ProductForm { name: string; sku: string; category: string; price: string; cost: string; stock: string; unit: string; description: string; status: string; }

export default function ProductsPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useGetProducts();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<ProductForm>({ defaultValues: { status: "active", unit: "pcs" } });

  const onSubmit = async (data: ProductForm) => {
    await createProduct.mutateAsync({ data: { ...data, price: parseFloat(data.price), cost: parseFloat(data.cost), stock: parseInt(data.stock), description: data.description || null } });
    queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
    reset(); setOpen(false);
    toast({ title: "Product added" });
  };

  const q = search.toLowerCase();
  const filtered = products?.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  ) ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6 text-primary" />Products</h2><p className="text-muted-foreground text-sm mt-1">Product catalog management</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-product"><Plus className="w-4 h-4 mr-2" />Add Product</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Product Name</Label><Input {...register("name")} /></div>
                  <div><Label>SKU</Label><Input placeholder="SKU-001" {...register("sku")} /></div>
                  <div><Label>Category</Label><Input {...register("category")} /></div>
                  <div><Label>Unit</Label><Input placeholder="pcs" {...register("unit")} /></div>
                  <div><Label>Price ($)</Label><Input type="number" step="0.01" {...register("price")} /></div>
                  <div><Label>Cost ($)</Label><Input type="number" step="0.01" {...register("cost")} /></div>
                  <div><Label>Stock</Label><Input type="number" {...register("stock")} /></div>
                  <div><Label>Status</Label>
                    <Select onValueChange={(v) => setValue("status", v)} defaultValue="active">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="discontinued">Discontinued</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Description</Label><Input {...register("description")} /></div>
                <Button type="submit" className="w-full" disabled={createProduct.isPending}>Add Product</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Products</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{products?.length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{products?.filter(p => p.status === "active").length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Inventory Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">₹{(products?.reduce((sum, p) => sum + p.price * p.stock, 0) ?? 0).toLocaleString("en-IN")}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium">Product Catalog</CardTitle>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, SKU, category..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm"
                  data-testid="input-search-products"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Stock</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{search ? "No products match your search." : "No products yet."}</TableCell></TableRow>
                ) : filtered.map(p => (
                  <TableRow key={p.id} data-testid={`row-product-${p.id}`}>
                    <TableCell><div><p className="font-medium text-sm">{p.name}</p>{p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}</div></TableCell>
                    <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{p.sku}</code></TableCell>
                    <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                    <TableCell className="text-right font-medium">₹{p.price.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right text-muted-foreground">₹{p.cost.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right"><span className={p.stock < 10 ? "text-red-500 font-bold" : "font-medium"}>{p.stock} {p.unit}</span></TableCell>
                    <TableCell><Badge className={p.status === "active" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground"} variant="outline">{p.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => { deleteProduct.mutate({ id: p.id }); queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() }); }}>Delete</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length > 0 && (
              <div className="px-4 py-2 border-t text-xs text-muted-foreground">
                Showing {filtered.length} of {products?.length ?? 0} products
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
