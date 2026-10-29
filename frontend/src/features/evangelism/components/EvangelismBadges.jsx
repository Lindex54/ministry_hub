import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const responseStyles = {
  "Accepted Christ": "border-success/20 bg-success/10 text-success",
  Interested: "border-primary/20 bg-primary/10 text-primary",
  "Needs Further Discussion": "border-warning/20 bg-warning/10 text-warning",
  Declined: "border-destructive/20 bg-destructive/10 text-destructive",
  "General Outreach": "border-border bg-muted text-muted-foreground",
};

export function ResponseBadge({ response, className }) {
  return <Badge variant="outline" className={cn(responseStyles[response], className)}>{response}</Badge>;
}
