import { AuditLogsPage } from "@/features/audit-logs/components/AuditLogsPage";

export const metadata = {
  title: "System Activity Logs | Ministry Hub",
  description: "Administrator audit trail for Ministry Hub activity.",
};

export default function LogsPage() {
  return <AuditLogsPage />;
}
