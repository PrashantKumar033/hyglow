import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetTracking, useGetShipments, getGetTrackingQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, Clock, CheckCircle } from "lucide-react";

function TrackingResult({ trackingNumber }: { trackingNumber: string }) {
  const { data, isLoading, error } = useGetTracking(trackingNumber, { query: { enabled: !!trackingNumber, queryKey: getGetTrackingQueryKey(trackingNumber) } });

  if (isLoading) return <Card><CardContent className="py-8 text-center">Searching...</CardContent></Card>;
  if (error) return <Card><CardContent className="py-8 text-center text-red-500">Tracking number not found.</CardContent></Card>;
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div><CardTitle className="text-lg font-bold">{data.trackingNumber}</CardTitle><p className="text-sm text-muted-foreground mt-1">Current: {data.currentLocation}</p></div>
          <Badge className={data.status === "delivered" ? "bg-green-500/10 text-green-600 border-green-500/20" : data.status === "in-transit" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"} variant="outline">{data.status}</Badge>
        </div>
        <p className="text-sm mt-2"><span className="text-muted-foreground">Est. Delivery:</span> <span className="font-medium">{data.estimatedDelivery}</span></p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tracking History</h4>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {data.events.map((event, i) => (
                <div key={i} className="flex items-start gap-4 pl-10 relative">
                  <div className={`absolute left-2 w-4 h-4 rounded-full border-2 ${i === data.events.length - 1 ? "bg-primary border-primary" : "bg-background border-border"}`} />
                  <div>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1"><MapPin className="w-3 h-3" />{event.location} <Clock className="w-3 h-3 ml-2" />{new Date(event.timestamp).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrackingPage() {
  const [searchInput, setSearchInput] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const { data: shipments } = useGetShipments();

  const handleSearch = () => { setTrackingNumber(searchInput.trim()); };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h2 className="text-2xl font-bold flex items-center gap-2"><MapPin className="w-6 h-6 text-primary" />Live Tracking</h2><p className="text-muted-foreground text-sm mt-1">Real-time shipment location tracking</p></div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input placeholder="Enter tracking number (e.g. SHP-1001)" value={searchInput} onChange={e => setSearchInput(e.target.value)} data-testid="input-tracking-number" onKeyDown={e => e.key === "Enter" && handleSearch()} className="max-w-md" />
              <Button onClick={handleSearch} data-testid="button-track">Track Shipment</Button>
            </div>
            {shipments && shipments.length > 0 && (
              <div className="mt-4"><p className="text-xs text-muted-foreground mb-2">Recent tracking numbers:</p><div className="flex flex-wrap gap-2">{shipments.slice(0, 5).map(s => <button key={s.id} onClick={() => { setSearchInput(s.trackingNumber); setTrackingNumber(s.trackingNumber); }} className="text-xs font-mono bg-muted hover:bg-primary/10 hover:text-primary px-2 py-1 rounded transition-colors">{s.trackingNumber}</button>)}</div></div>
            )}
          </CardContent>
        </Card>

        {trackingNumber && <TrackingResult trackingNumber={trackingNumber} />}

        {!trackingNumber && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Enter a tracking number above to see live shipment status</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
