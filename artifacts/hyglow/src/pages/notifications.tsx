import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getGetNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useGetNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;

  const getIcon = (type: string) => {
    switch (type) {
      case "alert": return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success": return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><Bell className="w-6 h-6 text-primary" />Notifications</h2><p className="text-muted-foreground text-sm mt-1">{unreadCount} unread notifications</p></div>
          {unreadCount > 0 && <Button variant="outline" size="sm" onClick={() => { markAllRead.mutate(); queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() }); }} data-testid="button-mark-all-read"><CheckCheck className="w-4 h-4 mr-2" />Mark All Read</Button>}
        </div>

        <div className="space-y-3">
          {isLoading ? <Card><CardContent className="py-8 text-center">Loading...</CardContent></Card> : notifications?.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-16 text-center"><Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No notifications yet</p></CardContent></Card>
          ) : notifications?.map(n => (
            <Card key={n.id} className={`transition-colors ${!n.read ? "border-primary/30 bg-primary/5" : ""}`} data-testid={`card-notification-${n.id}`}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><p className="font-semibold text-sm">{n.title}</p>{!n.read && <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">New</Badge>}</div>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  {!n.read && <Button variant="ghost" size="sm" onClick={() => { markRead.mutate({ id: n.id }); queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() }); }} data-testid={`button-mark-read-${n.id}`}>Mark Read</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
