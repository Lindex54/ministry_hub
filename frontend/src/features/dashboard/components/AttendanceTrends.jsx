import { EChart } from "@/components/charts/EChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AttendanceTrends({ data }) {
  const option = {
    tooltip: { trigger: "axis" },
    legend: { data: ["Current period", "Previous period"], top: 0 },
    grid: { left: 12, right: 18, top: 48, bottom: 12, containLabel: true },
    xAxis: { type: "category", boundaryGap: false, data: data.labels },
    yAxis: { type: "value" },
    series: [
      { name: "Current period", type: "line", smooth: true, symbolSize: 7, data: data.current, areaStyle: { opacity: 0.1 }, emphasis: { focus: "series" } },
      { name: "Previous period", type: "line", smooth: true, symbol: "none", lineStyle: { type: "dashed" }, data: data.previous, emphasis: { focus: "series" } },
    ],
  };

  return (
    <Card className="xl:col-span-2">
      <CardHeader><CardTitle>Attendance Trends</CardTitle><CardDescription>Weekly attendance compared with the previous equivalent period.</CardDescription></CardHeader>
      <CardContent><EChart option={option} height={330} /></CardContent>
    </Card>
  );
}

