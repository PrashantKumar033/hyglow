import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetEmployees, useCreateEmployee, useDeleteEmployee, useGetDepartmentStats, getGetEmployeesQueryKey, getGetDepartmentStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, UserCheck, UserX, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EmployeeForm { name: string; email: string; department: string; position: string; salary: string; status: string; joinDate: string; phone: string; }

export default function HRPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: employees, isLoading } = useGetEmployees();
  const { data: deptStats } = useGetDepartmentStats();
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<EmployeeForm>({ defaultValues: { status: "active", joinDate: new Date().toISOString().split("T")[0] } });

  const onSubmit = async (data: EmployeeForm) => {
    await createEmployee.mutateAsync({ data: { ...data, salary: parseFloat(data.salary), phone: data.phone || null } });
    queryClient.invalidateQueries({ queryKey: getGetEmployeesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDepartmentStatsQueryKey() });
    reset(); setOpen(false);
    toast({ title: "Employee added" });
  };

  const q = search.toLowerCase();
  const filtered = employees?.filter(e =>
    !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) ||
    e.department.toLowerCase().includes(q) || e.position.toLowerCase().includes(q)
  ) ?? [];

  const active = employees?.filter(e => e.status === "active").length ?? 0;
  const inactive = employees?.filter(e => e.status !== "active").length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-primary" />HR Department</h2><p className="text-muted-foreground text-sm mt-1">Employee management and workforce analytics</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-employee"><Plus className="w-4 h-4 mr-2" />Add Employee</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add New Employee</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Full Name</Label><Input {...register("name")} /></div>
                  <div><Label>Email</Label><Input type="email" {...register("email")} /></div>
                  <div><Label>Department</Label><Input {...register("department")} /></div>
                  <div><Label>Position</Label><Input {...register("position")} /></div>
                  <div><Label>Salary</Label><Input type="number" {...register("salary")} /></div>
                  <div><Label>Phone</Label><Input {...register("phone")} /></div>
                  <div><Label>Join Date</Label><Input type="date" {...register("joinDate")} /></div>
                  <div><Label>Status</Label>
                    <Select onValueChange={(v) => setValue("status", v)} defaultValue="active">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="on-leave">On Leave</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createEmployee.isPending}>Add Employee</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Employees</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{employees?.length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><UserCheck className="w-4 h-4" />Active</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{active}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><UserX className="w-4 h-4" />Inactive/Leave</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-500">{inactive}</p></CardContent></Card>
        </div>

        {deptStats && deptStats.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Department Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptStats}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="department" tick={{ fontSize: 12 }} /><YAxis /><Tooltip /><Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium">All Employees</CardTitle>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, dept, position..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm"
                  data-testid="input-search-employees"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Department</TableHead><TableHead>Position</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Salary</TableHead><TableHead>Join Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{search ? "No employees match your search." : "No employees found."}</TableCell></TableRow>
                ) : filtered.map(emp => (
                  <TableRow key={emp.id} data-testid={`row-employee-${emp.id}`}>
                    <TableCell><div className="flex items-center gap-3"><Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-primary text-primary-foreground">{emp.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div><p className="font-medium text-sm">{emp.name}</p><p className="text-xs text-muted-foreground">{emp.email}</p></div></div></TableCell>
                    <TableCell><Badge variant="outline">{emp.department}</Badge></TableCell>
                    <TableCell className="text-sm">{emp.position}</TableCell>
                    <TableCell><Badge className={emp.status === "active" ? "bg-green-500/10 text-green-600 border-green-500/20" : emp.status === "on-leave" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-muted text-muted-foreground"} variant="outline">{emp.status}</Badge></TableCell>
                    <TableCell className="text-right font-medium">₹{emp.salary.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{emp.joinDate}</TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => { deleteEmployee.mutate({ id: emp.id }); queryClient.invalidateQueries({ queryKey: getGetEmployeesQueryKey() }); }}>Remove</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length > 0 && (
              <div className="px-4 py-2 border-t text-xs text-muted-foreground">
                Showing {filtered.length} of {employees?.length ?? 0} employees
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
