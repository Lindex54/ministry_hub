import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({ title, value, detail, change, trend = "up", icon: Icon }) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-bold tabular-nums">{value}</CardTitle>
        {Icon ? (
          <CardAction className="rounded-lg border bg-muted p-2 text-muted-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </CardAction>
        ) : null}
        {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
        {change ? (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend === "down" ? "text-destructive" : "text-success"
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {change}
          </div>
        ) : null}
      </CardHeader>
    </Card>
  );
}

