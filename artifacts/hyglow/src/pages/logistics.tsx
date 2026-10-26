import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetShipments, useCreateShipment, getGetShipmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Truck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface ShipmentForm { origin: string; destination: string; carrier: string; status: string; shipDate: string; estimatedDelivery: string; weight: string; description: string; }

export default function LogisticsPage() {
  const [open, setOpen] = useState(false);
  const { data: shipments, isLoading } = useGetShipments();
  const createShipment = useCreateShipment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<ShipmentForm>({ defaultValues: { status: "pending", shipDate: new Date().toISOString().split("T")[0] } });

  const onSubmit = async (data: ShipmentForm) => {
    await createShipment.mutateAsync({ data: { ...data, weight: parseFloat(data.weight), estimatedDelivery: data.estimatedDelivery || null } });
    queryClient.invalidateQueries({ queryKey: getGetShipmentsQueryKey() });
    reset(); setOpen(false);
    toast({ title: "Shipment created" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><Truck className="w-6 h-6 text-primary" />Logistics & Transport</h2><p className="text-muted-foreground text-sm mt-1">Shipment management and tracking</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-create-shipment"><Plus className="w-4 h-4 mr-2" />New Shipment</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Shipment</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Origin</Label><Input {...register("origin")} /></div>
                  <div><Label>Destination</Label><Input {...register("destination")} /></div>
                  <div><Label>Carrier</Label><Input {...register("carrier")} /></div>
                  <div><Label>Weight (kg)</Label><Input type="number" step="0.1" {...register("weight")} /></div>
                  <div><Label>Ship Date</Label><Input type="date" {...register("shipDate")} /></div>
                  <div><Label>Est. Delivery</Label><Input type="date" {...register("estimatedDelivery")} /></div>
                  <div><Label>Status</Label>
                    <Select onValueChange={(v) => setValue("status", v)} defaultValue="pending">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="in-transit">In Transit</SelectItem><SelectItem value="delivered">Delivered</SelectItem><SelectItem value="delayed">Delayed</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Description</Label><Input {...register("description")} /></div>
                <Button type="submit" className="w-full" disabled={createShipment.isPending}>Create Shipment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Shipments</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{shipments?.length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Transit</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">{shipments?.filter(s => s.status === "in-transit").length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Delivered</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{shipments?.filter(s => s.status === "delivered").length ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Delayed</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">{shipments?.filter(s => s.status === "delayed").length ?? 0}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Tracking #</TableHead><TableHead>Origin</TableHead><TableHead>Destination</TableHead><TableHead>Carrier</TableHead><TableHead>Ship Date</TableHead><TableHead>Est. Delivery</TableHead><TableHead>Weight</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow> : shipments?.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No shipments yet.</TableCell></TableRow> : shipments?.map(s => (
                  <TableRow key={s.id} data-testid={`row-shipment-${s.id}`}>
                    <TableCell><code className="text-xs font-bold">{s.trackingNumber}</code></TableCell>
                    <TableCell className="text-sm">{s.origin}</TableCell>
                    <TableCell className="text-sm">{s.destination}</TableCell>
                    <TableCell><Badge variant="outline">{s.carrier}</Badge></TableCell>
                    <TableCell className="text-sm">{s.shipDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.estimatedDelivery ?? "TBD"}</TableCell>
                    <TableCell className="text-sm">{s.weight}kg</TableCell>
                    <TableCell><Badge className={s.status === "delivered" ? "bg-green-500/10 text-green-600 border-green-500/20" : s.status === "in-transit" ? "bg-primary/10 text-primary border-primary/20" : s.status === "delayed" ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-muted text-muted-foreground"} variant="outline">{s.status}</Badge></TableCell>
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
