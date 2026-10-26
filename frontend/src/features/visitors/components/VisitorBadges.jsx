import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const followUpStyles = {
  Pending: "border-warning/20 bg-warning/10 text-warning",
  "In Progress": "border-primary/20 bg-primary/10 text-primary",
  Completed: "border-success/20 bg-success/10 text-success",
  "Unable to Reach": "border-destructive/20 bg-destructive/10 text-destructive",
  "Not Scheduled": "border-border bg-muted text-muted-foreground",
};

export function FollowUpStatusBadge({ status, className }) {
  return <Badge variant="outline" className={cn(followUpStyles[status], className)}>{status}</Badge>;
}

export function VisitTypeBadge({ type }) {
  return <Badge variant={type === "Returning" ? "default" : "secondary"}>{type}</Badge>;
}
