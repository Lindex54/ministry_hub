"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, ChevronLeft, ChevronRight, Search, ShieldAlert, UserRoundCheck, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, ResponsiveGrid } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";

const ACTIONS = ["Login", "Logout", "View", "Create", "Update", "Delete", "Action"];

function formatTimestamp(value) {
  const timestamp = typeof value === "string" && !value.includes("T") ? `${value.replace(" ", "T")}Z` : value;
  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Kampala",
  }).format(new Date(timestamp));
}

function actionVariant(action) {
  if (action === "Delete") return "destructive";
  if (["Create", "Login"].includes(action)) return "default";
  return "secondary";
}

function LogsSkeleton() {
  return <div className="space-y-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-14 w-full" />)}</div>;
}

export function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ total: 0, today: 0, failed: 0, activeUsers: 0 });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [action, setAction] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => { setPage(1); setDebouncedSearch(search.trim()); }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (user?.role !== "Administrator") return;
    const params = new URLSearchParams({ page: String(page) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (action !== "all") params.set("action", action);
    if (outcome !== "all") params.set("outcome", outcome);
    setLoading(true);
    api(`/audit-logs?${params}`)
      .then((result) => {
        setLogs(result.data);
        setSummary(result.summary);
        setPagination(result.pagination);
        setError(null);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [user?.role, page, debouncedSearch, action, outcome]);

  if (user?.role !== "Administrator") {
    return <div className="mx-auto w-full max-w-3xl"><Alert variant="destructive"><ShieldAlert /><AlertTitle>Administrator access required</AlertTitle><AlertDescription>System activity logs contain security-sensitive information and are available only to administrators.</AlertDescription></Alert></div>;
  }

  return <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
    <PageHeader title="System activity logs" description="Review who used Ministry Hub, what they accessed or changed, and whether each request succeeded." />

    <ResponsiveGrid>
      <StatCard title="Total activity" value={summary.total.toLocaleString()} detail="All recorded system actions" icon={Activity} accentIndex={0} />
      <StatCard title="Activity today" value={summary.today.toLocaleString()} detail="Actions recorded today" icon={CheckCircle2} accentIndex={1} />
      <StatCard title="Tracked users" value={summary.activeUsers.toLocaleString()} detail="Distinct authenticated users" icon={UserRoundCheck} accentIndex={2} />
      <StatCard title="Failed requests" value={summary.failed.toLocaleString()} detail="Requests requiring review" icon={ShieldAlert} accentIndex={3} />
    </ResponsiveGrid>

    <Card>
      <CardHeader className="border-b">
        <CardTitle>Audit trail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-[minmax(16rem,1fr)_12rem_12rem]">
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search user, resource, path, or IP address" aria-label="Search activity logs" /></div>
          <Select value={action} onValueChange={(value) => { setAction(value); setPage(1); }}><SelectTrigger className="w-full" aria-label="Filter by action"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All actions</SelectItem>{ACTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
          <Select value={outcome} onValueChange={(value) => { setOutcome(value); setPage(1); }}><SelectTrigger className="w-full" aria-label="Filter by outcome"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All outcomes</SelectItem><SelectItem value="Success">Successful</SelectItem><SelectItem value="Failed">Failed</SelectItem></SelectContent></Select>
        </div>

        {error ? <Alert variant="destructive"><XCircle /><AlertTitle>Could not load activity logs</AlertTitle><AlertDescription>{error.message ?? "Check the server connection and try again."}</AlertDescription></Alert> : loading ? <LogsSkeleton /> : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader><TableRow><TableHead>Date & time</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Resource</TableHead><TableHead>Outcome</TableHead><TableHead>IP address</TableHead></TableRow></TableHeader>
              <TableBody>
                {logs.length ? logs.map((log) => <TableRow key={log.id}>
                  <TableCell><p className="font-medium">{formatTimestamp(log.created_at)}</p><p className="text-xs text-muted-foreground">{log.method}</p></TableCell>
                  <TableCell><p className="font-medium">{log.actor_name || "Unknown user"}</p><p className="text-xs text-muted-foreground">{log.actor_username ? `@${log.actor_username}` : log.actor_role || "Role unavailable"}</p></TableCell>
                  <TableCell><Badge variant={actionVariant(log.action)}>{log.action}</Badge></TableCell>
                  <TableCell><p className="font-medium capitalize">{log.resource.replaceAll("-", " ")}{log.resource_id ? ` #${log.resource_id}` : ""}</p><p className="max-w-72 truncate text-xs text-muted-foreground" title={log.path}>{log.path}</p></TableCell>
                  <TableCell>{log.outcome === "Success" ? <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="size-4" />{log.status_code}</span> : <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive"><XCircle className="size-4" />{log.status_code}</span>}</TableCell>
                  <TableCell className="font-mono text-xs">{log.ip_address || "—"}</TableCell>
                </TableRow>) : <TableRow><TableCell colSpan={6} className="h-28 text-center text-muted-foreground">No activity logs match the selected filters.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{pagination.total.toLocaleString()} record{pagination.total === 1 ? "" : "s"} · 10 per page</span>
          <div className="flex items-center gap-2"><span>Page {pagination.page} of {pagination.totalPages}</span><Button type="button" variant="outline" size="icon-sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={loading || pagination.page <= 1} aria-label="Previous page"><ChevronLeft /></Button><Button type="button" variant="outline" size="icon-sm" onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))} disabled={loading || pagination.page >= pagination.totalPages} aria-label="Next page"><ChevronRight /></Button></div>
        </div>
      </CardContent>
    </Card>
  </div>;
}
