import { ArrowUpRight, Clock3 } from "lucide-react";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const accentGradients = [
  "linear-gradient(135deg, #243457 0%, #0B1220 100%)",
  "linear-gradient(135deg, #2F9CFF 0%, #0F5FA8 100%)",
  "linear-gradient(135deg, #0EA5B7 0%, #0B5E68 100%)",
  "linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)",
];

export function StatCard({ title, value, detail, change, trend = "up", icon: Icon, className, accentIndex = 0 }) {
  const TrendIcon = trend === "down" ? Clock3 : ArrowUpRight;
  const gradient = accentGradients[accentIndex % accentGradients.length];

  return (
    <Card
      className={cn("relative mt-0 min-w-0 gap-4 border-0 bg-transparent px-5 pt-5 pb-4 text-white shadow-[0_10px_26px_-10px_rgba(10,20,40,0.45)]", className)}
      style={{ backgroundImage: gradient }}
    >
      <div className="flex items-start justify-between gap-3">
        {Icon ? <div className="-mt-10 flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white shadow-lg shadow-slate-900/20 ring-1 ring-white/25 backdrop-blur-sm">
          <Icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
        </div> : null}
        <div className="min-w-0 flex-1 text-right">
          <CardDescription className="text-xs text-white/75">{title}</CardDescription>
          <CardTitle className="mt-1 text-3xl font-extrabold tracking-tight text-white tabular-nums">{value}</CardTitle>
        </div>
      </div>
      {detail || change ? <div className="border-t border-white/20 pt-3">
        {change ? (
          <div className="flex items-center gap-1 text-xs font-semibold text-white/90">
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {change}
          </div>
        ) : null}
        {detail ? <p className={cn("text-[11px] text-white/70", change && "mt-1")}>{detail}</p> : null}
      </div> : null}
    </Card>
  );
}
