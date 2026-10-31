"use client";

import { useState } from "react";
import { Mail, CircleCheckBig, MessageSquare, ListChecks } from "lucide-react";
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
import { personalizeMessage } from "../outreach-utils.mjs";
import { CampaignComposer } from "./CampaignComposer";

export function CommunicationsPage() {
  const { campaigns, campaignsError } = useOutreach();
  const [selected, setSelected] = useState(null);
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
      id: "sentAt",
      header: "Sent",
      accessorFn: (campaign) => campaign.sentAt ? new Date(campaign.sentAt).toLocaleString() : "Not sent",
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
        </div>
      ),
    },
  ];
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
      <PageHeader
        title="Communications"
        description="Send personalized email campaigns to consenting members and visitors."
      />
      <Alert className="border-primary/20 bg-primary/5">
        <Mail />
        <AlertTitle>SMTP email delivery</AlertTitle>
        <AlertDescription>
          Confirmed campaigns send real email immediately and their delivery results are saved.
          SMS and scheduled delivery are not enabled yet.
        </AlertDescription>
      </Alert>
      {campaignsError ? <Alert variant="destructive"><AlertTitle>Could not load communication history</AlertTitle><AlertDescription>{campaignsError.message}</AlertDescription></Alert> : null}
      <ResponsiveGrid>
        <StatCard
          title="Total campaigns"
          value={campaigns.length}
          icon={ListChecks}
        />
        <StatCard
          title="Sent successfully"
          value={
            campaigns.filter(
              (campaign) => campaign.status === "Sent",
            ).length
          }
          icon={CircleCheckBig}
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
                Saved SMTP campaigns and per-recipient delivery outcomes.
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
                  { accessorKey: "deliveryStatus", header: "Delivery" },
                  { accessorKey: "errorMessage", header: "Error" },
                ]}
                data={selected.recipients}
                enableSelection={false}
              />
              <p className="text-xs text-muted-foreground">
                Recipient snapshot and SMTP outcome recorded when the campaign was sent.
              </p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
