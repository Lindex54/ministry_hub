"use client";

import { useState } from "react";
import { EChart } from "@/components/charts/EChart";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAttendance } from "../AttendanceProvider";
import { branches } from "../data/attendance.mock";

export function AttendanceAnalytics() {
  const { occurrences, scope, totals } = useAttendance();
  const [comparisonBranches, setComparisonBranches] = useState(branches);
  const trend = occurrences.filter((item) => item.branch === scope.branch && item.service === scope.service && item.date <= scope.date).sort((a, b) => a.date.localeCompare(b.date)).slice(-8);
  const comparison = comparisonBranches.map((branch) => ({ branch, occurrence: occurrences.find((item) => item.branch === branch && item.service === scope.service && item.date === scope.date) }));
  const grid = { left: 12, right: 16, top: 40, bottom: 72, containLabel: true };
  const legend = { data: ["Members", "Visitors"], top: "auto", bottom: 4, itemGap: 24 };
  return <div className="grid min-w-0 gap-6 xl:grid-cols-2">
    <Card className="min-w-0"><CardHeader><CardTitle>Attendance trends</CardTitle><CardDescription>{scope.branch} · {scope.service} · Up to {scope.date}</CardDescription></CardHeader><CardContent><EChart empty={!trend.length} height={300} option={{ tooltip: { trigger: "axis" }, legend, grid, xAxis: { type: "category", data: trend.map((item) => item.date.slice(5)), axisLabel: { margin: 16 } }, yAxis: { type: "value", minInterval: 1 }, series: [{ name: "Members", type: "line", data: trend.map((item) => totals(item).members), smooth: true }, { name: "Visitors", type: "line", data: trend.map((item) => totals(item).visitors), smooth: true }] }} /></CardContent></Card>
    <Card className="min-w-0"><CardHeader><CardTitle>Branch comparison</CardTitle><CardDescription>{scope.service} · {scope.date}. Missing registers appear as no data, not zero attendance.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-3">{branches.map((branch) => <Label key={branch} className="flex items-center gap-2 text-xs"><Checkbox checked={comparisonBranches.includes(branch)} onCheckedChange={(checked) => setComparisonBranches((current) => checked ? branches.filter((item) => item === branch || current.includes(item)) : current.filter((item) => item !== branch))} />{branch}</Label>)}</div><EChart empty={!comparison.length || !comparison.some((item) => item.occurrence)} height={260} option={{ tooltip: { trigger: "axis" }, legend, grid, xAxis: { type: "category", data: comparison.map((item) => item.branch.replace(" Branch", "").replace(" Campus", "")), axisLabel: { interval: 0, fontSize: 11, margin: 16 } }, yAxis: { type: "value", minInterval: 1 }, series: [{ name: "Members", type: "bar", stack: "attendance", barMaxWidth: 36, data: comparison.map((item) => item.occurrence ? totals(item.occurrence).members : null) }, { name: "Visitors", type: "bar", stack: "attendance", barMaxWidth: 36, data: comparison.map((item) => item.occurrence ? totals(item.occurrence).visitors : null) }] }} /></CardContent></Card>
  </div>;
}
