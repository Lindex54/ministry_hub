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
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Button key={action.label} variant="outline" className="h-auto justify-start py-3" onClick={() => showPlaceholder(action.label)}>
            <action.icon />{action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
