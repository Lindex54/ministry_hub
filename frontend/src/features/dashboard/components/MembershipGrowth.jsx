import { EChart } from "@/components/charts/EChart";
import { DashboardChartCard, raisedAxis } from "./DashboardChartCard";

export function MembershipGrowth({ data }) {
  const peak = Math.max(0, ...data.values);
  const option = {
    animation: false,
    legend: { show: false },
    tooltip: { trigger: "axis", confine: true, axisPointer: { type: "shadow", shadowStyle: { color: "rgba(255,255,255,0.04)" } } },
    grid: { left: 4, right: 8, top: 28, bottom: 4, containLabel: true },
    xAxis: {
      ...raisedAxis, type: "category", data: data.labels,
      axisLabel: { color: "#D7E6F7", fontSize: 10, margin: 14, hideOverlap: true },
      splitLine: { show: false },
    },
    yAxis: {
      ...raisedAxis, type: "value", min: 0, minInterval: 1, splitNumber: 3,
      max: Math.max(4, Math.ceil(peak * 1.3)),
      axisLabel: { color: "#A6B5CE", fontSize: 10, margin: 10 },
      splitLine: { lineStyle: { color: "rgba(166,181,206,0.12)", type: "dashed" } },
    },
    series: [{
      name: "New members", type: "bar",
      data: data.values.map((value) => ({ value, itemStyle: { color: value === peak ? "#19D3F3" : "#299FFF" } })),
      barWidth: "42%", barMaxWidth: 42,
      itemStyle: { borderRadius: [6, 6, 0, 0] },
      label: { show: true, position: "top", distance: 8, color: "#F8FAFC", fontSize: 12, fontWeight: 700 },
      emphasis: { itemStyle: { color: "#B4EBFF" } },
    }],
  };

  return (
    <DashboardChartCard tone="navy" title="Membership growth" description={`${data.values.reduce((sum, value) => sum + value, 0)} new members welcomed in the selected period.`} footer="Cyan highlights the strongest growth">
      <EChart option={option} height={200} />
    </DashboardChartCard>
  );
}
