import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetExpenses, useCreateExpense, useDeleteExpense, useGetExpensesByCategory, getGetExpensesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["hsl(191,97%,31%)", "hsl(262,83%,58%)", "hsl(45,93%,47%)", "hsl(142,71%,45%)", "hsl(350,89%,60%)", "hsl(200,70%,50%)"];

interface ExpenseForm { date: string; category: string; description: string; amount: string; status: string; submittedBy: string; }

export default function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const { data: expenses, isLoading } = useGetExpenses();
  const { data: byCategory } = useGetExpensesByCategory();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<ExpenseForm>({ defaultValues: { status: "approved", date: new Date().toISOString().split("T")[0] } });

  const onSubmit = async (data: ExpenseForm) => {
    await createExpense.mutateAsync({ data: { ...data, amount: parseFloat(data.amount) } });
    queryClient.invalidateQueries({ queryKey: getGetExpensesQueryKey() });
    reset(); setOpen(false);
    toast({ title: "Expense recorded" });
  };

  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6 text-primary" />Expenses</h2><p className="text-muted-foreground text-sm mt-1">Expense tracking and categorization</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-expense"><Plus className="w-4 h-4 mr-2" />Add Expense</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date</Label><Input type="date" {...register("date")} /></div>
                  <div><Label>Amount ($)</Label><Input type="number" step="0.01" {...register("amount")} /></div>
                  <div><Label>Category</Label><Input placeholder="Office, Travel, Software..." {...register("category")} /></div>
                  <div><Label>Submitted By</Label><Input {...register("submittedBy")} /></div>
                  <div><Label>Status</Label>
                    <Select onValueChange={(v) => setValue("status", v)} defaultValue="approved">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="approved">Approved</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Description</Label><Input {...register("description")} /></div>
                <Button type="submit" className="w-full" disabled={createExpense.isPending}>Record Expense</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Expenses</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">₹{totalExpenses.toLocaleString("en-IN")}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">This Month</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{expenses?.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7))).length ?? 0} entries</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Categories</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{byCategory?.length ?? 0}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Submitted By</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow> : expenses?.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No expenses yet.</TableCell></TableRow> : expenses?.map(e => (
                      <TableRow key={e.id} data-testid={`row-expense-${e.id}`}>
                        <TableCell className="text-sm">{e.date}</TableCell>
                        <TableCell><Badge variant="outline">{e.category}</Badge></TableCell>
                        <TableCell className="text-sm">{e.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{e.submittedBy}</TableCell>
                        <TableCell className="text-right font-bold">₹{e.amount.toLocaleString("en-IN")}</TableCell>
                        <TableCell><Badge className={e.status === "approved" ? "bg-green-500/10 text-green-600 border-green-500/20" : e.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"} variant="outline">{e.status}</Badge></TableCell>
                        <TableCell><Button variant="ghost" size="sm" onClick={() => { deleteExpense.mutate({ id: e.id }); queryClient.invalidateQueries({ queryKey: getGetExpensesQueryKey() }); }}>Delete</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">By Category</CardTitle></CardHeader>
              <CardContent>
                {byCategory && byCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart><Pie data={byCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={70}>{byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} /><Legend /></PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
