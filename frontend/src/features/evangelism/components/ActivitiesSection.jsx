"use client";

import { CalendarDays, MapPin, Megaphone, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { evangelismTeam } from "../data/evangelism.mock";
import { countIndividuallyLinked } from "../evangelism-utils.mjs";
import { NewActivityDialog } from "./ActivityDialogs";

export function ActivitiesSection({ activities, records, branch }) {
  return (
    <Card>
      <CardHeader className="flex-col items-start justify-between gap-3 border-b sm:flex-row sm:items-center">
        <div className="space-y-1"><CardTitle>Outreach activities</CardTitle><CardDescription>Door-to-door, street, campus, community outreach, and crusades, with aggregate headcounts.</CardDescription></div>
        <NewActivityDialog branch={branch} />
      </CardHeader>
      <CardContent>
        {activities.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activities.map((activity) => {
              const individuallyLinked = countIndividuallyLinked(records, activity.id);
              return (
                <div key={activity.id} className="space-y-3 rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="font-semibold">{activity.name}</p><Badge variant="secondary" className="mt-1"><Megaphone />{activity.type}</Badge></div>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><CalendarDays className="size-3.5" />{activity.date} · {activity.branch}</p>
                    <p className="flex items-center gap-2"><MapPin className="size-3.5" />{activity.location}</p>
                    <p className="flex items-center gap-2"><Users className="size-3.5" />{evangelismTeam.filter((worker) => activity.team.includes(worker.id)).map((worker) => worker.name).join(", ") || "No team assigned"}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                    <p><span className="font-semibold text-foreground">{activity.headcount}</span> reached without personal details recorded</p>
                    <p><span className="font-semibold text-foreground">{individuallyLinked}</span> individually registered (not double counted)</p>
                    <p className="mt-1 font-medium text-foreground">Total reached: {activity.headcount + individuallyLinked}</p>
                  </div>
                  {activity.notes ? <p className="text-xs text-muted-foreground">{activity.notes}</p> : null}
                </div>
              );
            })}
          </div>
        ) : <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No outreach activities recorded for this selection yet.</div>}
      </CardContent>
    </Card>
  );
}
