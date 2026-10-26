import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetPromotions, useCreatePromotion, useDeletePromotion, getGetPromotionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface PromoForm { title: string; code: string; type: string; discount: string; startDate: string; endDate: string; status: string; usageLimit: string; }

export default function PromotionsPage() {
  const [open, setOpen] = useState(false);
  const { data: promotions, isLoading } = useGetPromotions();
  const createPromotion = useCreatePromotion();
  const deletePromotion = useDeletePromotion();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<PromoForm>({ defaultValues: { type: "percentage", status: "active", startDate: new Date().toISOString().split("T")[0] } });

  const onSubmit = async (data: PromoForm) => {
    await createPromotion.mutateAsync({ data: { ...data, discount: parseFloat(data.discount), usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null } });
    queryClient.invalidateQueries({ queryKey: getGetPromotionsQueryKey() });
    reset(); setOpen(false);
    toast({ title: "Promotion created" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><Tag className="w-6 h-6 text-primary" />Promotion Control</h2><p className="text-muted-foreground text-sm mt-1">Manage discount codes and promotional campaigns</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-create-promo"><Plus className="w-4 h-4 mr-2" />Create Promotion</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Promotion</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Title</Label><Input {...register("title")} /></div>
                  <div><Label>Code</Label><Input placeholder="SAVE20" {...register("code")} className="uppercase" /></div>
                  <div><Label>Type</Label>
                    <Select onValueChange={(v) => setValue("type", v)} defaultValue="percentage">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="percentage">Percentage %</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem><SelectItem value="free-shipping">Free Shipping</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Discount</Label><Input type="number" step="0.01" {...register("discount")} /></div>
                  <div><Label>Start Date</Label><Input type="date" {...register("startDate")} /></div>
                  <div><Label>End Date</Label><Input type="date" {...register("endDate")} /></div>
                  <div><Label>Usage Limit</Label><Input type="number" placeholder="Unlimited" {...register("usageLimit")} /></div>
                  <div><Label>Status</Label>
                    <Select onValueChange={(v) => setValue("status", v)} defaultValue="active">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createPromotion.isPending}>Create Promotion</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Promotions</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{promotions?.length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{promotions?.filter(p => p.status === "active").length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Uses</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">{promotions?.reduce((sum, p) => sum + p.usageCount, 0) ?? 0}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Discount</TableHead><TableHead>Period</TableHead><TableHead>Usage</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow> : promotions?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No promotions yet.</TableCell></TableRow> : promotions?.map(p => (
                  <TableRow key={p.id} data-testid={`row-promo-${p.id}`}>
                    <TableCell className="font-medium text-sm">{p.title}</TableCell>
                    <TableCell><code className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">{p.code}</code></TableCell>
                    <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                    <TableCell className="font-bold">{p.type === "percentage" ? `${p.discount}%` : `₹${p.discount}`}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.startDate} — {p.endDate}</TableCell>
                    <TableCell className="text-sm">{p.usageCount}{p.usageLimit ? `/${p.usageLimit}` : ""}</TableCell>
                    <TableCell><Badge className={p.status === "active" ? "bg-green-500/10 text-green-600 border-green-500/20" : p.status === "scheduled" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"} variant="outline">{p.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => { deletePromotion.mutate({ id: p.id }); queryClient.invalidateQueries({ queryKey: getGetPromotionsQueryKey() }); }}>Delete</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
