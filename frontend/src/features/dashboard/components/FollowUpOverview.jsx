import { CalendarClock, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FollowUpOverview({ data }) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Follow-ups Requiring Attention</CardTitle>
        <Button variant="outline" size="sm">View All Follow-ups</Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {data.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 border-b py-4 last:border-0 sm:flex-row sm:items-center">
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

