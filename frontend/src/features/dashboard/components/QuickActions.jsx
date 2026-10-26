"use client";

import { CalendarPlus, ChartNoAxesCombined, ClipboardPlus, HandHeart, UserPlus, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  { label: "Add Member", icon: UserPlus },
  { label: "Register Visitor", icon: UserRoundPlus },
  { label: "Record Attendance", icon: ClipboardPlus },
  { label: "Create Follow-up", icon: HandHeart },
  { label: "Schedule Event", icon: CalendarPlus },
  { label: "View Reports", icon: ChartNoAxesCombined },
];

export function QuickActions() {
  function showPlaceholder(label) {
    toast.info(`${label} is a demonstration action. The module will be connected later.`);
  }

  return (
    <Card className="xl:col-span-3">
      <CardHeader><CardTitle>Quick Actions</CardTitle><CardDescription>Shortcuts to common administration tasks.</CardDescription></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {actions.map((action) => (
          <Button key={action.label} variant="outline" className="h-auto flex-col gap-3 whitespace-normal rounded-xl bg-muted/30 px-2 py-5 text-xs hover:border-primary/40 hover:bg-primary/5" onClick={() => showPlaceholder(action.label)}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><action.icon className="size-5" /></span>{action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
