import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MembersProvider } from "@/features/members/MembersProvider";

export default function DashboardRouteLayout({ children }) {
  return (
    <MembersProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </MembersProvider>
  );
}

