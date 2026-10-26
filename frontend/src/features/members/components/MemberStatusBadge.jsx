import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles = {
  Active: "border-success/20 bg-success/10 text-success",
  Inactive: "border-warning/20 bg-warning/10 text-warning",
  Transferred: "border-border bg-muted text-muted-foreground",
};

export function MemberStatusBadge({ status, className }) {
  return (
    <Badge variant="outline" className={cn(statusStyles[status], className)}>
      {status}
    </Badge>
  );
}
