import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MembersProvider } from "@/features/members/MembersProvider";
import { VisitorsProvider } from "@/features/visitors/VisitorsProvider";
import { OutreachProvider } from "@/features/outreach/OutreachProvider";
import { AttendanceProvider } from "@/features/attendance/AttendanceProvider";

export default function DashboardRouteLayout({ children }) {
  return (
    <VisitorsProvider>
      <MembersProvider>
        <AttendanceProvider>
          <OutreachProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </OutreachProvider>
        </AttendanceProvider>
      </MembersProvider>
    </VisitorsProvider>
  );
}

