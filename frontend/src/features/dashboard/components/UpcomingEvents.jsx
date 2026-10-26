import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UpcomingEvents({ data }) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader>
      <CardContent className="space-y-1">
        {data.map((event) => (
          <div key={event.id} className="flex gap-3 border-b py-4 first:pt-0 last:border-0 last:pb-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><CalendarDays className="size-5" /></div>
            <div className="min-w-0">
              <p className="font-medium">{event.name}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{event.date}</span>
                <span className="flex items-center gap-1"><Clock3 className="size-3.5" />{event.time}</span>
                <span className="flex items-center gap-1"><MapPin className="size-3.5" />{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

