import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetLedgerEntries, useGetLedgerSummary, useCreateLedgerEntry, useDeleteLedgerEntry, getGetLedgerEntriesQueryKey, getGetLedgerSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface LedgerForm { date: string; description: string; account: string; type: string; debit: string; credit: string; reference: string; }

export default function Ledger() {
  const [open, setOpen] = useState(false);
  const { data: entries, isLoading } = useGetLedgerEntries();
  const { data: summary } = useGetLedgerSummary();
  const createEntry = useCreateLedgerEntry();
  const deleteEntry = useDeleteLedgerEntry();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<LedgerForm>({ defaultValues: { type: "debit", date: new Date().toISOString().split("T")[0] } });

  const onSubmit = async (data: LedgerForm) => {
    await createEntry.mutateAsync({ data: { ...data, debit: parseFloat(data.debit) || 0, credit: parseFloat(data.credit) || 0 } });
    queryClient.invalidateQueries({ queryKey: getGetLedgerEntriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetLedgerSummaryQueryKey() });
    reset(); setOpen(false);
    toast({ title: "Entry added successfully" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" />Account Ledger</h2><p className="text-muted-foreground text-sm mt-1">Double-entry bookkeeping records</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-entry"><Plus className="w-4 h-4 mr-2" />New Entry</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Ledger Entry</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date</Label><Input type="date" {...register("date")} /></div>
                  <div><Label>Reference</Label><Input placeholder="REF-001" {...register("reference")} /></div>
                </div>
                <div><Label>Description</Label><Input placeholder="Transaction description" {...register("description")} /></div>
                <div><Label>Account</Label><Input placeholder="e.g. Cash, Revenue" {...register("account")} /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Type</Label>
                    <Select onValueChange={(v) => setValue("type", v)} defaultValue="debit">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="debit">Debit</SelectItem><SelectItem value="credit">Credit</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Debit ($)</Label><Input type="number" step="0.01" placeholder="0.00" {...register("debit")} /></div>
                  <div><Label>Credit ($)</Label><Input type="number" step="0.01" placeholder="0.00" {...register("credit")} /></div>
                </div>
                <Button type="submit" className="w-full" disabled={createEntry.isPending}>Add Entry</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4" />Total Debit</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">₹{(summary?.totalDebit ?? 0).toLocaleString("en-IN")}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><TrendingDown className="w-4 h-4" />Total Credit</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">₹{(summary?.totalCredit ?? 0).toLocaleString("en-IN")}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Wallet className="w-4 h-4" />Net Balance</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${(summary?.balance ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>₹{(summary?.balance ?? 0).toLocaleString("en-IN")}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Reference</TableHead><TableHead>Description</TableHead><TableHead>Account</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead><TableHead className="text-right">Balance</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow> : entries?.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No entries yet. Add your first transaction.</TableCell></TableRow> : entries?.map((entry) => (
                  <TableRow key={entry.id} data-testid={`row-ledger-${entry.id}`}>
                    <TableCell className="text-sm">{entry.date}</TableCell>
                    <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{entry.reference}</code></TableCell>
                    <TableCell className="text-sm">{entry.description}</TableCell>
                    <TableCell className="text-sm font-medium">{entry.account}</TableCell>
                    <TableCell><Badge variant={entry.type === "debit" ? "default" : "secondary"}>{entry.type}</Badge></TableCell>
                    <TableCell className="text-right text-green-600">{entry.debit > 0 ? `₹${entry.debit.toLocaleString("en-IN")}` : "-"}</TableCell>
                    <TableCell className="text-right text-red-500">{entry.credit > 0 ? `₹${entry.credit.toLocaleString("en-IN")}` : "-"}</TableCell>
                    <TableCell className="text-right font-medium">₹{entry.balance.toLocaleString("en-IN")}</TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => { deleteEntry.mutate({ id: entry.id }); queryClient.invalidateQueries({ queryKey: getGetLedgerEntriesQueryKey() }); }}>Delete</Button></TableCell>
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
