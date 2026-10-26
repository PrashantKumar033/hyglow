import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice, useGetOverdueInvoices, getGetInvoicesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, FileText, AlertTriangle, MoreHorizontal, CheckCircle, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface InvoiceForm { client: string; amount: string; tax: string; issueDate: string; dueDate: string; status: string; notes: string; }

export default function InvoicesPage() {
  const [open, setOpen] = useState(false);
  const { data: invoices, isLoading } = useGetInvoices();
  const { data: overdue } = useGetOverdueInvoices();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<InvoiceForm>({ defaultValues: { status: "pending", issueDate: new Date().toISOString().split("T")[0], tax: "0" } });

  const onSubmit = async (data: InvoiceForm) => {
    await createInvoice.mutateAsync({ data: { ...data, amount: parseFloat(data.amount), tax: parseFloat(data.tax) || 0, notes: data.notes || null } });
    queryClient.invalidateQueries({ queryKey: getGetInvoicesQueryKey() });
    reset(); setOpen(false);
    toast({ title: "Invoice created" });
  };

  const markPaid = async (inv: NonNullable<typeof invoices>[0]) => {
    await updateInvoice.mutateAsync({ id: inv.id, data: { ...inv, status: "paid", notes: inv.notes ?? undefined } });
    queryClient.invalidateQueries({ queryKey: getGetInvoicesQueryKey() });
    toast({ title: "Invoice marked as paid" });
  };

  const totalPaid = invoices?.filter(i => i.status === "paid").reduce((sum, i) => sum + i.total, 0) ?? 0;
  const totalPending = invoices?.filter(i => i.status === "pending").reduce((sum, i) => sum + i.total, 0) ?? 0;
  const totalOverdue = invoices?.filter(i => i.status === "overdue").reduce((sum, i) => sum + i.total, 0) ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6 text-primary" />Invoices</h2><p className="text-muted-foreground text-sm mt-1">Invoice management and billing</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-create-invoice"><Plus className="w-4 h-4 mr-2" />Create Invoice</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div><Label>Client</Label><Input {...register("client")} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Amount ($)</Label><Input type="number" step="0.01" {...register("amount")} /></div>
                  <div><Label>Tax ($)</Label><Input type="number" step="0.01" {...register("tax")} /></div>
                  <div><Label>Issue Date</Label><Input type="date" {...register("issueDate")} /></div>
                  <div><Label>Due Date</Label><Input type="date" {...register("dueDate")} /></div>
                  <div><Label>Status</Label>
                    <Select onValueChange={(v) => setValue("status", v)} defaultValue="pending">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="overdue">Overdue</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Notes</Label><Input {...register("notes")} /></div>
                <Button type="submit" className="w-full" disabled={createInvoice.isPending}>Create Invoice</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Invoices</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{invoices?.length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Paid</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString("en-IN")}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-500">₹{totalPending.toLocaleString("en-IN")}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" />Overdue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">₹{totalOverdue.toLocaleString("en-IN")}</p></CardContent></Card>
        </div>

        {overdue && overdue.length > 0 && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="py-3 px-4">
              <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {overdue.length} invoice{overdue.length > 1 ? "s are" : " is"} overdue — {overdue.map(o => o.client).join(", ")}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Client</TableHead><TableHead>Issue Date</TableHead><TableHead>Due Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Tax</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : invoices?.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No invoices yet.</TableCell></TableRow>
                ) : invoices?.map(inv => (
                  <TableRow key={inv.id} data-testid={`row-invoice-${inv.id}`} className={inv.status === "overdue" ? "bg-red-500/5" : ""}>
                    <TableCell><code className="text-xs font-bold">{inv.invoiceNumber}</code></TableCell>
                    <TableCell className="font-medium text-sm">{inv.client}</TableCell>
                    <TableCell className="text-sm">{inv.issueDate}</TableCell>
                    <TableCell className="text-sm">{inv.dueDate}</TableCell>
                    <TableCell className="text-right">₹{inv.amount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right text-muted-foreground">₹{inv.tax.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right font-bold">₹{inv.total.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge className={
                        inv.status === "paid" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                        inv.status === "overdue" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                        inv.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        "bg-muted text-muted-foreground"
                      } variant="outline">{inv.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {inv.status !== "paid" && (
                            <DropdownMenuItem onClick={() => markPaid(inv)} className="text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => { deleteInvoice.mutate({ id: inv.id }); queryClient.invalidateQueries({ queryKey: getGetInvoicesQueryKey() }); }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
