"use client";

import { EChart } from "@/components/charts/EChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLatestEncounter, responseOptions } from "../data/evangelism.mock";

function monthKey(dateString) {
  return dateString.slice(0, 7);
}

function monthLabel(key) {
  return new Intl.DateTimeFormat("en-UG", { month: "short", year: "2-digit" }).format(new Date(`${key}-01T00:00:00`));
}

export function EvangelismAnalytics({ records, activities }) {
  const months = [...new Set([
    ...records.flatMap((record) => record.history.map((entry) => monthKey(entry.date))),
    ...activities.map((activity) => monthKey(activity.date)),
  ])].sort().slice(-6);

  const trend = months.map((month) => {
    const individualCount = new Set(records.filter((record) => record.history.some((entry) => monthKey(entry.date) === month)).map((record) => record.id)).size;
    const headcount = activities.filter((activity) => monthKey(activity.date) === month).reduce((total, activity) => total + (Number(activity.headcount) || 0), 0);
    return { month, individualCount, headcount };
  });

  const responseCounts = responseOptions.map((response) => records.filter((record) => getLatestEncounter(record)?.response === response).length);
  const grid = { left: 12, right: 16, top: 40, bottom: 72, containLabel: true };
  const legend = { data: ["Individually registered", "Aggregate headcount"], bottom: 4, itemGap: 24 };

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
      <Card className="min-w-0">
        <CardHeader><CardTitle>Outreach trend</CardTitle><CardDescription>People reached per month, for the selected branch and date range.</CardDescription></CardHeader>
        <CardContent>
          <EChart empty={!trend.length} height={300} option={{
            tooltip: { trigger: "axis" }, legend, grid,
            xAxis: { type: "category", data: trend.map((item) => monthLabel(item.month)), axisLabel: { margin: 16 } },
            yAxis: { type: "value", minInterval: 1 },
            series: [
              { name: "Individually registered", type: "bar", stack: "reached", barMaxWidth: 36, data: trend.map((item) => item.individualCount) },
              { name: "Aggregate headcount", type: "bar", stack: "reached", barMaxWidth: 36, data: trend.map((item) => item.headcount) },
            ],
          }} />
        </CardContent>
      </Card>
      <Card className="min-w-0">
        <CardHeader><CardTitle>Response breakdown</CardTitle><CardDescription>Latest recorded response for each individually registered person.</CardDescription></CardHeader>
        <CardContent>
          <EChart empty={!records.length} height={300} option={{
            tooltip: { trigger: "axis" }, grid,
            xAxis: { type: "category", data: responseOptions, axisLabel: { interval: 0, fontSize: 10, margin: 16, rotate: 20 } },
            yAxis: { type: "value", minInterval: 1 },
            series: [{ name: "People", type: "bar", barMaxWidth: 42, data: responseCounts }],
          }} />
        </CardContent>
      </Card>
    </div>
  );
}
