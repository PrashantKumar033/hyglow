import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetSupportTickets, useCreateSupportTicket, useUpdateSupportTicket, getGetSupportTicketsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, LifeBuoy, HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface TicketForm { title: string; description: string; category: string; priority: string; submittedBy: string; }

export default function SupportPage() {
  const [open, setOpen] = useState(false);
  const { data: tickets, isLoading } = useGetSupportTickets();
  const createTicket = useCreateSupportTicket();
  const updateTicket = useUpdateSupportTicket();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<TicketForm>({ defaultValues: { priority: "medium", category: "general" } });

  const onSubmit = async (data: TicketForm) => {
    await createTicket.mutateAsync({ data: { ...data, status: "open" } });
    queryClient.invalidateQueries({ queryKey: getGetSupportTicketsQueryKey() });
    reset(); setOpen(false);
    toast({ title: "Support ticket submitted" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><LifeBuoy className="w-6 h-6 text-primary" />Help & Support</h2><p className="text-muted-foreground text-sm mt-1">Submit and track support tickets</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-submit-ticket"><Plus className="w-4 h-4 mr-2" />Submit Ticket</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Submit Support Ticket</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div><Label>Title</Label><Input {...register("title")} placeholder="Brief description of your issue" /></div>
                <div><Label>Description</Label><Input {...register("description")} placeholder="Detailed description" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Category</Label>
                    <Select onValueChange={(v) => setValue("category", v)} defaultValue="general">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="technical">Technical</SelectItem><SelectItem value="billing">Billing</SelectItem><SelectItem value="feature">Feature Request</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Priority</Label>
                    <Select onValueChange={(v) => setValue("priority", v)} defaultValue="medium">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Your Name</Label><Input {...register("submittedBy")} /></div>
                <Button type="submit" className="w-full" disabled={createTicket.isPending}>Submit Ticket</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-500">{tickets?.filter(t => t.status === "open").length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">{tickets?.filter(t => t.status === "in-progress").length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{tickets?.filter(t => t.status === "resolved").length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Critical</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">{tickets?.filter(t => t.priority === "critical").length ?? 0}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Priority</TableHead><TableHead>Submitted By</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow> : tickets?.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No tickets submitted yet.</TableCell></TableRow> : tickets?.map(t => (
                  <TableRow key={t.id} data-testid={`row-ticket-${t.id}`}>
                    <TableCell><div><p className="font-medium text-sm">{t.title}</p><p className="text-xs text-muted-foreground">{t.description.slice(0, 60)}...</p></div></TableCell>
                    <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                    <TableCell><Badge className={t.priority === "critical" ? "bg-red-500/10 text-red-600 border-red-500/20" : t.priority === "high" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-muted text-muted-foreground"} variant="outline">{t.priority}</Badge></TableCell>
                    <TableCell className="text-sm">{t.submittedBy}</TableCell>
                    <TableCell><Badge className={t.status === "resolved" ? "bg-green-500/10 text-green-600 border-green-500/20" : t.status === "in-progress" ? "bg-primary/10 text-primary border-primary/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"} variant="outline">{t.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => { updateTicket.mutate({ id: t.id, data: { ...t, status: "resolved" } }); queryClient.invalidateQueries({ queryKey: getGetSupportTicketsQueryKey() }); }}>Resolve</Button></TableCell>
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
