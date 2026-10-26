import { EChart } from "@/components/charts/EChart";
import { DashboardChartCard, raisedAxis } from "./DashboardChartCard";

export function ServiceAttendance({ data }) {
  const option = {
    tooltip: { trigger: "axis" },
    grid: { left: 0, right: 8, top: 18, bottom: 0, containLabel: true },
    xAxis: { ...raisedAxis, type: "category", data: data.map((row) => row.date.replace(", 2026", "")), splitLine: { show: false } },
    yAxis: { ...raisedAxis, type: "value" },
    series: [{ name: "Attendance", type: "line", data: data.map((row) => row.attendance), symbolSize: 7, itemStyle: { color: "#19D3F3" }, lineStyle: { width: 3 }, areaStyle: { color: "#19D3F3", opacity: 0.08 } }],
  };
  return <DashboardChartCard tone="navy" title="Recent gatherings" description="Attendance across the five latest recorded services." footer="Latest service records · demonstration"><EChart option={option} height={200} /></DashboardChartCard>;
}
