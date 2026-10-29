"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ClipboardList, HeartHandshake, Sparkles, ThumbsUp, UserPlus, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { FadeIn } from "@/components/shared/Motion";
import { PageHeader, ResponsiveGrid } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useOutreach } from "@/features/outreach/OutreachProvider";
import { useEvangelism } from "../EvangelismProvider";
import { branches, getLatestEncounter } from "../data/evangelism.mock";
import { countPositiveResponses, countSoulsAccepted, peopleEvangelized } from "../evangelism-utils.mjs";
import { ActivitiesSection } from "./ActivitiesSection";
import { EvangelismAnalytics } from "./EvangelismAnalytics";
import { EvangelismRecordsTable } from "./EvangelismRecordsTable";

const defaultRange = { from: new Date(2026, 8, 1), to: new Date(2026, 10, 10) };

export function EvangelismOverview() {
  const { records, activities } = useEvangelism();
  const { getPersonTasks } = useOutreach();
  const [branch, setBranch] = useState("all");
  const [dateRange, setDateRange] = useState(defaultRange);

  const from = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : null;
  const to = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : from;

  const filteredRecords = useMemo(() => records.filter((record) => {
    if (branch !== "all" && record.branch !== branch) return false;
    const latest = getLatestEncounter(record);
    if (!latest) return false;
    if (from && latest.date < from) return false;
    if (to && latest.date > to) return false;
    return true;
  }), [records, branch, from, to]);

  const filteredActivities = useMemo(() => activities.filter((activity) => (
    (branch === "all" || activity.branch === branch) && (!from || activity.date >= from) && (!to || activity.date <= to)
  )), [activities, branch, from, to]);

  const pendingFollowUps = filteredRecords.filter((record) => record.followUpNeeded && !getPersonTasks(`evangelism:${record.id}`).some((task) => task.status === "Completed")).length;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
      <PageHeader title="Evangelism" description="Record outreach activities, track souls reached, and coordinate follow-up." actions={<Button asChild><Link href="/evangelism/new"><UserPlus />Record soul</Link></Button>} />
      <Alert className="border-primary/20 bg-primary/5"><HeartHandshake /><AlertTitle>Demonstration data</AlertTitle><AlertDescription>Evangelism records, activities, and responses are kept only in memory and reset when the browser is refreshed. No messages are sent automatically.</AlertDescription></Alert>
      <Card><CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="evangelism-branch">Church branch</Label><Select value={branch} onValueChange={setBranch}><SelectTrigger id="evangelism-branch" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All branches</SelectItem>{branches.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Date range</Label><DateRangePicker value={dateRange} onChange={setDateRange} className="w-full" /></div>
      </CardContent></Card>
      <FadeIn><ResponsiveGrid>
        <StatCard title="People evangelized" value={peopleEvangelized(filteredRecords, filteredActivities).toLocaleString()} detail="Individually registered + aggregate headcounts" icon={Users} />
        <StatCard title="New souls recorded" value={countSoulsAccepted(filteredRecords).toLocaleString()} detail="Accepted Christ at least once" icon={Sparkles} />
        <StatCard title="Positive responses" value={countPositiveResponses(filteredRecords).toLocaleString()} detail="Latest response is Accepted Christ or Interested" icon={ThumbsUp} />
        <StatCard title="Pending follow-ups" value={pendingFollowUps.toLocaleString()} detail="Flagged for follow-up, not yet completed" icon={ClipboardList} />
      </ResponsiveGrid></FadeIn>
      <Card><CardHeader className="border-b"><CardTitle>Evangelism records</CardTitle><CardDescription>Search, filter, sort, and manage individually recorded people.</CardDescription></CardHeader><CardContent><EvangelismRecordsTable records={filteredRecords} /></CardContent></Card>
      <ActivitiesSection activities={filteredActivities} records={records} branch={branch} />
      <EvangelismAnalytics records={filteredRecords} activities={filteredActivities} />
    </div>
  );
}
