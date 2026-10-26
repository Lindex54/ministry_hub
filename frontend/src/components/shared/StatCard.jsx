import { ArrowUpRight, Clock3 } from "lucide-react";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function iconColor(title) {
  const label = title.toLowerCase();
  if (/^total|example total/.test(label)) return "bg-[#17243B]";
  if (/pending|inactive|absent|email/.test(label)) return "bg-[#7C3AED]";
  if (/new|visitors present|sms|completed/.test(label)) return "bg-[#087F9C]";
  return "bg-[#147DDB]";
}

export function StatCard({ title, value, detail, change, trend = "up", icon: Icon, className }) {
  const TrendIcon = trend === "down" ? Clock3 : ArrowUpRight;

  return (
    <Card className={cn("relative mt-5 min-w-0 gap-4 border-border/55 px-5 pt-5 pb-4 shadow-[0_4px_18px_-6px_rgba(23,36,59,0.12)]", className)}>
      <div className="flex items-start justify-between gap-3">
        {Icon ? <div className={cn("-mt-10 flex size-14 shrink-0 items-center justify-center rounded-xl text-white shadow-lg shadow-slate-900/15", iconColor(title))}>
          <Icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
        </div> : null}
        <div className="min-w-0 flex-1 text-right">
          <CardDescription className="text-xs">{title}</CardDescription>
          <CardTitle className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums">{value}</CardTitle>
        </div>
      </div>
      {detail || change ? <div className="border-t pt-3">
        {change ? (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold",
              trend === "down" ? "text-warning" : "text-success"
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {change}
          </div>
        ) : null}
        {detail ? <p className={cn("text-[11px] text-muted-foreground", change && "mt-1")}>{detail}</p> : null}
      </div> : null}
    </Card>
  );
}

