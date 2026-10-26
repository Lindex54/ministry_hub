import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:px-8 lg:pt-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

