import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetMessages, useCreateMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface MessageForm { recipient: string; content: string; }

export default function MessagesPage() {
  const [open, setOpen] = useState(false);
  const { data: messages, isLoading } = useGetMessages();
  const createMessage = useCreateMessage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<MessageForm>();

  const onSubmit = async (data: MessageForm) => {
    await createMessage.mutateAsync({ data });
    queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
    reset(); setOpen(false);
    toast({ title: "Message sent" });
  };

  const unread = messages?.filter(m => !m.read).length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="w-6 h-6 text-primary" />Messages</h2><p className="text-muted-foreground text-sm mt-1">{unread} unread messages</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-compose"><Plus className="w-4 h-4 mr-2" />Compose</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Message</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div><Label>To</Label><Input placeholder="Recipient name" {...register("recipient")} /></div>
                <div><Label>Message</Label><Input placeholder="Write your message..." {...register("content")} /></div>
                <Button type="submit" className="w-full" disabled={createMessage.isPending}><Send className="w-4 h-4 mr-2" />Send Message</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {isLoading ? <Card><CardContent className="py-8 text-center">Loading...</CardContent></Card> : messages?.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-16 text-center"><MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No messages yet. Compose one above.</p></CardContent></Card>
          ) : messages?.map(msg => (
            <Card key={msg.id} className={`cursor-pointer hover:border-primary/30 transition-colors ${!msg.read ? "bg-primary/5 border-primary/20" : ""}`} data-testid={`card-message-${msg.id}`}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-9 h-9"><AvatarFallback className="bg-primary text-primary-foreground text-sm">{msg.sender.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2"><p className="font-semibold text-sm">{msg.sender}</p><div className="flex items-center gap-2">{!msg.read && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs" variant="outline">New</Badge>}<p className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleString("en-IN")}</p></div></div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{msg.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
