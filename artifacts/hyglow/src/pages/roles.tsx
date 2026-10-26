import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetRoles, useCreateRole, useDeleteRole, getGetRolesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Shield } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const ALL_PERMISSIONS = ["view_dashboard","manage_users","manage_employees","manage_sales","manage_products","manage_inventory","manage_orders","manage_invoices","manage_expenses","manage_logistics","view_reports","manage_support","manage_admin","manage_roles","manage_promotions"];

interface RoleForm { name: string; description: string; permissions: string[]; }

export default function RolesPage() {
  const [open, setOpen] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const { data: roles, isLoading } = useGetRoles();
  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<RoleForm>({ defaultValues: { permissions: [] } });

  const togglePerm = (p: string) => setSelectedPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const onSubmit = async (data: RoleForm) => {
    await createRole.mutateAsync({ data: { name: data.name, description: data.description, permissions: selectedPerms } });
    queryClient.invalidateQueries({ queryKey: getGetRolesQueryKey() });
    reset(); setSelectedPerms([]); setOpen(false);
    toast({ title: "Role created" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-primary" />Role Permissions</h2><p className="text-muted-foreground text-sm mt-1">Define roles and manage access control</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-create-role"><Plus className="w-4 h-4 mr-2" />Create Role</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create New Role</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div><Label>Role Name</Label><Input {...register("name")} /></div>
                <div><Label>Description</Label><Input {...register("description")} /></div>
                <div>
                  <Label className="mb-3 block">Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {ALL_PERMISSIONS.map(p => (
                      <div key={p} className="flex items-center gap-2">
                        <Checkbox id={p} checked={selectedPerms.includes(p)} onCheckedChange={() => togglePerm(p)} />
                        <label htmlFor={p} className="text-xs cursor-pointer">{p.replace(/_/g, " ")}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createRole.isPending}>Create Role</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {isLoading ? <p className="text-muted-foreground col-span-2 text-center py-8">Loading...</p> : roles?.length === 0 ? <Card className="col-span-2 border-dashed"><CardContent className="py-16 text-center"><Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No roles defined yet.</p></CardContent></Card> : roles?.map(role => (
            <Card key={role.id} data-testid={`card-role-${role.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between"><CardTitle className="text-sm font-bold">{role.name}</CardTitle><Badge variant="outline">{role.userCount} users</Badge></div>
                <p className="text-xs text-muted-foreground">{role.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map(p => <Badge key={p} variant="secondary" className="text-xs">{p.replace(/_/g, " ")}</Badge>)}
                  {role.permissions.length === 0 && <p className="text-xs text-muted-foreground">No permissions assigned</p>}
                </div>
                <Button variant="ghost" size="sm" className="mt-3 text-destructive hover:text-destructive" onClick={() => { deleteRole.mutate({ id: role.id }); queryClient.invalidateQueries({ queryKey: getGetRolesQueryKey() }); }}>Delete Role</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
