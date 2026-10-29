"use client";

import { useState } from "react";
import { Mail, CalendarClock, MessageSquare, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, ResponsiveGrid } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable } from "@/components/tables/DataTable";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOutreach } from "../OutreachProvider";
import { events } from "../data/outreach.mock";
import { personalizeMessage, resolveRecipients } from "../outreach-utils.mjs";
import { CampaignComposer } from "./CampaignComposer";

export function CommunicationsPage() {
  const { campaigns, people, updateCampaign } = useOutreach();
  const [selected, setSelected] = useState(null);
  function simulate(campaign) {
    const result = resolveRecipients(
      people,
      campaign.selection,
      campaign.channel,
      events,
    );
    if (!result.eligible.length) {
      toast.error("No eligible recipients remain. Campaign was not simulated.");
      return;
    }
    updateCampaign(campaign.id, {
      status: "Simulation recorded — not sent",
      simulatedAt: new Date().toISOString(),
      recipientCount: result.eligible.length,
      recipients: result.eligible.map((person) => ({
        key: person.key,
        name: person.name,
        destination: campaign.channel === "sms" ? person.phone : person.email,
      })),
    });
    toast.success("Simulation recorded. No SMS or email was sent.");
  }
  const columns = [
    { accessorKey: "title", header: "Campaign" },
    {
      accessorKey: "channel",
      header: "Channel",
      cell: ({ row }) => row.original.channel.toUpperCase(),
    },
    { accessorKey: "recipientCount", header: "Recipients" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
    },
    {
      id: "schedule",
      header: "Scheduled (Kampala)",
      accessorFn: (campaign) =>
        campaign.timing === "scheduled"
          ? campaign.scheduledAt.replace("T", " ")
          : "Immediate simulation",
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(row.original)}
          >
            Details
          </Button>
          {row.original.status === "Scheduled (mock)" ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => simulate(row.original)}
              >
                Simulate now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  updateCampaign(row.original.id, {
                    status: "Cancelled (mock)",
                  })
                }
              >
                Cancel
              </Button>
            </>
          ) : null}
        </div>
      ),
    },
  ];
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
      <PageHeader
        title="Communications"
        description="Compose bulk SMS and email campaigns for church groups or selected individuals."
      />
      <Alert className="border-primary/20 bg-primary/5">
        <Mail />
        <AlertTitle>Campaign simulation · temporary data</AlertTitle>
        <AlertDescription>
          Compose, preview, schedule, and simulate campaigns. No messages are
          sent and no delivery is reported. Data resets on refresh.
          Administrator and communications-officer permissions will be enforced
          when the backend is implemented.
        </AlertDescription>
      </Alert>
      <ResponsiveGrid>
        <StatCard
          title="Total campaigns"
          value={campaigns.length}
          icon={ListChecks}
        />
        <StatCard
          title="Scheduled"
          value={
            campaigns.filter(
              (campaign) => campaign.status === "Scheduled (mock)",
            ).length
          }
          icon={CalendarClock}
        />
        <StatCard
          title="SMS campaigns"
          value={
            campaigns.filter((campaign) => campaign.channel === "sms").length
          }
          icon={MessageSquare}
        />
        <StatCard
          title="Email campaigns"
          value={
            campaigns.filter((campaign) => campaign.channel === "email").length
          }
          icon={Mail}
        />
      </ResponsiveGrid>
      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Compose campaign</TabsTrigger>
          <TabsTrigger value="history">
            Communication history ({campaigns.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="compose" className="mt-6">
          <CampaignComposer />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Communication history</CardTitle>
              <CardDescription>
                Mock schedules and simulations. Campaigns never create
                individual follow-up assignments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={campaigns}
                enableSelection={false}
                searchPlaceholder="Search campaigns, channel, status..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected?.status} · {selected?.recipientCount} recipients ·{" "}
              {selected?.channel.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <>
              <p className="text-sm text-muted-foreground">
                Association:{" "}
                {selected.association === "none"
                  ? "None"
                  : selected.association.startsWith("event:")
                    ? events.find(
                        (event) => `event:${event.id}` === selected.association,
                      )?.name
                    : selected.association.replace("service:", "")}
              </p>
              {selected.channel === "email" ? (
                <p className="font-semibold">{selected.subject}</p>
              ) : null}
              <p className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
                {personalizeMessage(selected.body, selected.recipients[0])}
              </p>
              <DataTable
                columns={[
                  { accessorKey: "name", header: "Recipient" },
                  { accessorKey: "destination", header: "Destination" },
                ]}
                data={selected.recipients}
                enableSelection={false}
              />
              <p className="text-xs text-muted-foreground">
                Recipient snapshot at confirmation. Delivery: not attempted. No
                real messages were sent.
              </p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
