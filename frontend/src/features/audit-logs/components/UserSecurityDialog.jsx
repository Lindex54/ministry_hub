"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, AtSign, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Eye, Globe2, LoaderCircle, Mail, MapPin, Search, ShieldCheck, UserRound, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";

function toDate(value) {
  if (!value) return null;
  const normalized = typeof value === "string" && !value.includes("T") ? `${value.replace(" ", "T")}Z` : value;
  return new Date(normalized);
}

function formatTimestamp(value) {
  const date = toDate(value);
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-UG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Kampala" }).format(date);
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return "Not available";
  return new Intl.DateTimeFormat("en-UG", { dateStyle: "medium", timeZone: "Africa/Kampala" }).format(date);
}

function deviceLabel(userAgent) {
  if (!userAgent) return "Unknown device";
  const browser = userAgent.includes("Edg/") ? "Edge" : userAgent.includes("Firefox/") ? "Firefox" : userAgent.includes("Chrome/") ? "Chrome" : userAgent.includes("Safari/") ? "Safari" : "Browser";
  const platform = userAgent.includes("Android") ? "Android" : userAgent.includes("iPhone") || userAgent.includes("iPad") ? "iOS" : userAgent.includes("Windows") ? "Windows" : userAgent.includes("Mac OS") ? "macOS" : userAgent.includes("Linux") ? "Linux" : "unknown device";
  return `${browser} on ${platform}`;
}

function ProfileDetail({ icon: Icon, label, value }) {
  return <div className="flex min-w-0 gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" /></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-sm font-medium" title={value}>{value || "Not provided"}</p></div></div>;
}

function Metric({ icon: Icon, label, value, tone = "default" }) {
  const toneClass = tone === "success" ? "text-emerald-600 dark:text-emerald-400" : tone === "danger" ? "text-destructive" : "text-foreground";
  return <div className="rounded-xl border bg-muted/20 p-4"><div className={`flex items-center gap-2 ${toneClass}`}><Icon className="size-4" /><span className="text-xs font-medium">{label}</span></div><p className={`mt-2 text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p></div>;
}

function SecuritySkeleton() {
  return <div className="space-y-5"><Skeleton className="h-20 w-full" /><div className="grid grid-cols-3 gap-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div><Skeleton className="h-52 w-full" /></div>;
}

export function UserSecurityDialog({ userId, open, onOpenChange }) {
  const [data, setData] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [debouncedHistorySearch, setDebouncedHistorySearch] = useState("");
  const [historyOutcome, setHistoryOutcome] = useState("all");
  const [historyRange, setHistoryRange] = useState("all");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => { setHistoryPage(1); setDebouncedHistorySearch(historySearch.trim()); }, 300);
    return () => clearTimeout(timeout);
  }, [historySearch]);

  useEffect(() => {
    if (!open || !userId) return;
    let cancelled = false;
    const params = new URLSearchParams({ page: String(showFullHistory ? historyPage : 1) });
    if (showFullHistory) {
      if (debouncedHistorySearch) params.set("search", debouncedHistorySearch);
      if (historyOutcome !== "all") params.set("outcome", historyOutcome);
      params.set("range", historyRange);
      if (historyRange === "custom" && historyFrom) params.set("from", historyFrom);
      if (historyRange === "custom" && historyTo) params.set("to", historyTo);
    }
    setLoading(true);
    api(`/audit-logs/users/${userId}?${params}`)
      .then((result) => { if (!cancelled) { setData(result); setError(null); } })
      .catch((requestError) => { if (!cancelled) setError(requestError); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, userId, showFullHistory, historyPage, debouncedHistorySearch, historyOutcome, historyRange, historyFrom, historyTo]);

  function resetHistoryFilters() {
    setHistoryPage(1);
    setHistorySearch("");
    setDebouncedHistorySearch("");
    setHistoryOutcome("all");
    setHistoryRange("all");
    setHistoryFrom("");
    setHistoryTo("");
  }

  function handleOpenChange(value) {
    if (!value) {
      resetHistoryFilters();
      setShowFullHistory(false);
      setData(null);
      setError(null);
    }
    onOpenChange(value);
  }

  const recentHistory = (data?.loginHistory.data ?? []).slice(0, 3);
  const initials = data?.user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return <Dialog open={open} onOpenChange={handleOpenChange}>
    <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
      <DialogHeader><DialogTitle>Account security check</DialogTitle></DialogHeader>
      {loading && !data ? <SecuritySkeleton /> : error ? <Alert variant="destructive"><XCircle /><AlertTitle>Could not load security information</AlertTitle><AlertDescription>{error.message ?? "Please try again."}</AlertDescription></Alert> : data ? <div className="space-y-6">
        <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4"><span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{initials || <UserRound />}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-bold">{data.user.name}</h3><Badge variant={data.user.status === "Active" ? "default" : "outline"}>{data.user.status}</Badge></div><p className="text-sm text-muted-foreground">{data.user.role || "No role assigned"}</p></div></div>
            <div className="text-left sm:text-right"><p className="text-xs text-muted-foreground">Last successful login</p><p className="text-sm font-semibold">{formatTimestamp(data.stats.lastSuccessfulLogin || data.user.lastLoginAt)}</p></div>
          </div>
          <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileDetail icon={AtSign} label="Username" value={data.user.username ? `@${data.user.username}` : "Not provided"} />
            <ProfileDetail icon={Mail} label="Email address" value={data.user.email} />
            <ProfileDetail icon={MapPin} label="Branch" value={data.user.branch || "Not assigned"} />
            <ProfileDetail icon={UserRound} label="Linked staff profile" value={data.user.staffName || "Not linked"} />
            <ProfileDetail icon={CalendarDays} label="Account created" value={formatDate(data.user.createdAt)} />
            <ProfileDetail icon={Globe2} label="Known login IPs" value={`${data.stats.distinctIps} address${data.stats.distinctIps === 1 ? "" : "es"}`} />
          </div>
        </section>

        <section><h3 className="mb-3 text-sm font-semibold">Login security summary</h3><div className="grid gap-3 sm:grid-cols-3"><Metric icon={ShieldCheck} label="Total attempts" value={data.stats.totalAttempts} /><Metric icon={CheckCircle2} label="Successful" value={data.stats.successful} tone="success" /><Metric icon={XCircle} label="Unsuccessful" value={data.stats.failed} tone="danger" /></div></section>

        {data.stats.failed > 0 ? <Alert className="border-amber-500/30 bg-amber-500/5"><AlertTriangle className="text-amber-600" /><AlertTitle>Unsuccessful login activity detected</AlertTitle><AlertDescription>The latest unsuccessful attempt was {formatTimestamp(data.stats.lastFailedAttempt)}. Review the IP addresses and devices below for anything unfamiliar.</AlertDescription></Alert> : null}

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="text-sm font-semibold">{showFullHistory ? "All login activity" : "Recent login activity"}</h3><p className="text-xs text-muted-foreground">Dates and times are shown in Kampala time.</p></div>
            {!showFullHistory ? <Button type="button" variant="outline" size="sm" onClick={() => { setHistoryPage(1); setShowFullHistory(true); }}><Eye />View all logins</Button> : <Button type="button" variant="ghost" size="sm" onClick={() => { resetHistoryFilters(); setShowFullHistory(false); }}>Back to summary</Button>}
          </div>

          {showFullHistory ? <>
            <div className="grid gap-3 rounded-xl border bg-muted/20 p-3 md:grid-cols-[minmax(14rem,1fr)_10rem_11rem]">
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} className="pl-9" placeholder="Search IP address or device" aria-label="Search login history" /></div>
              <Select value={historyOutcome} onValueChange={(value) => { setHistoryOutcome(value); setHistoryPage(1); }}><SelectTrigger className="w-full" aria-label="Filter login outcome"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All outcomes</SelectItem><SelectItem value="Success">Successful</SelectItem><SelectItem value="Failed">Unsuccessful</SelectItem></SelectContent></Select>
              <Select value={historyRange} onValueChange={(value) => { setHistoryRange(value); setHistoryPage(1); }}><SelectTrigger className="w-full" aria-label="Filter login time range"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All time</SelectItem><SelectItem value="today">Today</SelectItem><SelectItem value="7d">Last 7 days</SelectItem><SelectItem value="30d">Last 30 days</SelectItem><SelectItem value="90d">Last 90 days</SelectItem><SelectItem value="custom">Custom dates</SelectItem></SelectContent></Select>
              {historyRange === "custom" ? <div className="grid gap-3 border-t pt-3 md:col-span-3 sm:grid-cols-2"><label className="space-y-1 text-xs font-medium text-muted-foreground"><span>From date</span><Input type="date" value={historyFrom} max={historyTo || undefined} onChange={(event) => { setHistoryFrom(event.target.value); setHistoryPage(1); }} /></label><label className="space-y-1 text-xs font-medium text-muted-foreground"><span>To date</span><Input type="date" value={historyTo} min={historyFrom || undefined} onChange={(event) => { setHistoryTo(event.target.value); setHistoryPage(1); }} /></label></div> : null}
            </div>
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader><TableRow><TableHead>Date & time</TableHead><TableHead>Outcome</TableHead><TableHead>IP address</TableHead><TableHead>Device</TableHead><TableHead>Code</TableHead></TableRow></TableHeader>
                <TableBody>{data.loginHistory.data.length ? data.loginHistory.data.map((entry) => <TableRow key={entry.id}><TableCell className="font-medium">{formatTimestamp(entry.created_at)}</TableCell><TableCell>{entry.outcome === "Success" ? <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="size-4" />Successful</span> : <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive"><XCircle className="size-4" />Unsuccessful</span>}</TableCell><TableCell className="font-mono text-xs">{entry.ip_address || "Unavailable"}</TableCell><TableCell><p className="max-w-52 truncate text-sm" title={entry.user_agent || ""}>{deviceLabel(entry.user_agent)}</p></TableCell><TableCell><Badge variant={entry.outcome === "Success" ? "outline" : "destructive"}>{entry.status_code}</Badge></TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No login attempts match these security filters.</TableCell></TableRow>}</TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>{data.loginHistory.pagination.total} matching login attempt{data.loginHistory.pagination.total === 1 ? "" : "s"} · 10 per page</span><div className="flex items-center gap-2"><span>Page {data.loginHistory.pagination.page} of {data.loginHistory.pagination.totalPages}</span><Button type="button" variant="outline" size="icon-sm" onClick={() => setHistoryPage((current) => Math.max(1, current - 1))} disabled={loading || data.loginHistory.pagination.page <= 1} aria-label="Previous login history page"><ChevronLeft /></Button><Button type="button" variant="outline" size="icon-sm" onClick={() => setHistoryPage((current) => Math.min(data.loginHistory.pagination.totalPages, current + 1))} disabled={loading || data.loginHistory.pagination.page >= data.loginHistory.pagination.totalPages} aria-label="Next login history page"><ChevronRight /></Button></div></div>
          </> : <div className="overflow-hidden rounded-xl border">{recentHistory.length ? <div className="divide-y">{recentHistory.map((entry) => <div key={entry.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(12rem,1fr)_minmax(10rem,1fr)_auto] sm:items-center"><div className="flex items-start gap-3">{entry.outcome === "Success" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />}<div><p className="text-sm font-semibold">{entry.outcome === "Success" ? "Successful login" : "Unsuccessful attempt"}</p><p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />{formatTimestamp(entry.created_at)}</p></div></div><div><p className="text-sm font-medium">{entry.ip_address || "IP unavailable"}</p><p className="max-w-64 truncate text-xs text-muted-foreground" title={entry.user_agent || ""}>{deviceLabel(entry.user_agent)}</p></div><Badge variant={entry.outcome === "Success" ? "outline" : "destructive"}>{entry.status_code}</Badge></div>)}</div> : <p className="p-8 text-center text-sm text-muted-foreground">No login activity has been recorded for this user yet.</p>}</div>}
        </section>
      </div> : null}
      <DialogFooter><Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Close</Button></DialogFooter>
      {loading && data ? <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-background/50"><LoaderCircle className="size-6 animate-spin text-primary" /></div> : null}
    </DialogContent>
  </Dialog>;
}
