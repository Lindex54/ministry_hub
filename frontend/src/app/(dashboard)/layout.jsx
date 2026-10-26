import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MembersProvider } from "@/features/members/MembersProvider";
import { VisitorsProvider } from "@/features/visitors/VisitorsProvider";

export default function DashboardRouteLayout({ children }) {
  return (
    <VisitorsProvider>
      <MembersProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </MembersProvider>
    </VisitorsProvider>
  );
}

