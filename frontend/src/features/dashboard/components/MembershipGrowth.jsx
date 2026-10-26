import { EChart } from "@/components/charts/EChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MembershipGrowth({ data }) {
  const option = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 12, right: 12, top: 16, bottom: 12, containLabel: true },
    xAxis: { type: "category", data: data.labels },
    yAxis: { type: "value", minInterval: 1 },
    series: [{ name: "New members", type: "bar", data: data.values, barMaxWidth: 32, itemStyle: { borderRadius: [5, 5, 0, 0] } }],
  };

  return (
    <Card>
      <CardHeader><CardTitle>Membership Growth</CardTitle><CardDescription>New-member registrations during the selected period.</CardDescription></CardHeader>
      <CardContent><EChart option={option} height={330} /></CardContent>
    </Card>
  );
}
