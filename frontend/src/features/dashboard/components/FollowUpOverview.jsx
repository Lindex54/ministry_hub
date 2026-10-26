import { CalendarClock, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FollowUpOverview({ data }) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div><CardTitle>People to connect with</CardTitle><p className="mt-2 text-xs text-muted-foreground">Small conversations. Lasting connections.</p></div>
        <Badge variant="secondary">{data.length} highlighted</Badge>
      </CardHeader>
      <CardContent className="space-y-1">
        {data.map((item) => (
          <div key={item.id} className="relative flex flex-col gap-3 border-l-2 border-primary/20 py-4 pl-5 last:pb-0 sm:flex-row sm:items-center">
            <span className={`absolute top-5 -left-[6px] size-2.5 rounded-full ring-4 ring-card ${item.status === "Overdue" ? "bg-warning" : "bg-primary"}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{item.name}</p>
                <Badge variant={item.status === "Overdue" ? "destructive" : "secondary"}>{item.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.type}</p>
            </div>
            <div className="grid shrink-0 gap-1 text-xs text-muted-foreground sm:text-right">
              <span className="flex items-center gap-1 sm:justify-end"><UserRound className="size-3.5" />{item.assignee}</span>
              <span className="flex items-center gap-1 sm:justify-end"><CalendarClock className="size-3.5" />Due {item.due}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

