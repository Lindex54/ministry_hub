import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComponentShowcase } from "@/components/shared/ComponentShowcase";

export const metadata = {
  title: "Component Showcase | Ministry Hub",
};

export default function ComponentsPage() {
  return (
    <DashboardLayout>
      <ComponentShowcase />
    </DashboardLayout>
  );
}
