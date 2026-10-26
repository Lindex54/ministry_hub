import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MembersProvider } from "@/features/members/MembersProvider";
import { VisitorsProvider } from "@/features/visitors/VisitorsProvider";
import { OutreachProvider } from "@/features/outreach/OutreachProvider";

export default function DashboardRouteLayout({ children }) {
  return (
    <VisitorsProvider>
      <MembersProvider>
        <OutreachProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </OutreachProvider>
      </MembersProvider>
    </VisitorsProvider>
  );
}

