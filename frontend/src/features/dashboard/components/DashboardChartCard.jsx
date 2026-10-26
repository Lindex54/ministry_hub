import { Clock3 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DashboardChartCard({ title, description, footer, tone = "blue", children }) {
  const surfaces = { blue: "bg-[#147DDB]", cyan: "bg-[#087F9C]", navy: "bg-[#17243B]" };
  return (
    <Card className="min-w-0 gap-4 pt-0">
      <CardContent className="px-4">
        <div className={`-mt-5 rounded-xl p-3 shadow-lg shadow-slate-900/15 ${surfaces[tone]}`}>{children}</div>
      </CardContent>
      <CardHeader className="gap-2 px-5">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="mx-5 border-t px-0 pt-3! text-xs text-muted-foreground">
        <Clock3 className="mr-2 size-3.5" />{footer}
      </CardFooter>
    </Card>
  );
}

export const raisedAxis = {
  axisLabel: { color: "#FFFFFF", fontSize: 10 },
  axisLine: { show: false },
  axisTick: { show: false },
  splitLine: { lineStyle: { color: "rgba(255,255,255,0.2)", type: "dashed" } },
};
