import { EChart } from "@/components/charts/EChart";
import { DashboardChartCard, raisedAxis } from "./DashboardChartCard";

export function AttendanceTrends({ data }) {
  const option = {
    tooltip: { trigger: "axis" },
    legend: { data: ["Current period", "Previous period"], top: 0, textStyle: { color: "#FFFFFF", fontSize: 10 } },
    grid: { left: 0, right: 8, top: 48, bottom: 0, containLabel: true },
    xAxis: { ...raisedAxis, type: "category", boundaryGap: false, data: data.labels, splitLine: { show: false } },
    yAxis: { ...raisedAxis, type: "value" },
    series: [
      { name: "Current period", type: "line", smooth: true, symbolSize: 7, data: data.current, itemStyle: { color: "#FFFFFF" }, areaStyle: { opacity: 0.1 }, emphasis: { focus: "series" } },
      { name: "Previous period", type: "line", smooth: true, symbol: "none", lineStyle: { type: "dashed" }, itemStyle: { color: "#B4EBFF" }, data: data.previous, emphasis: { focus: "series" } },
    ],
  };

  return (
    <DashboardChartCard title="Attendance trends" description="Every gathering is a chance to grow together." footer="Compared with the previous period">
      <EChart option={option} height={200} />
    </DashboardChartCard>
  );
}

