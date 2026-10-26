"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  CalendarDays,
  ChartNoAxesCombined,
  Church,
  ClipboardCheck,
  HandHeart,
  LayoutDashboard,
  Megaphone,
  Network,
  ShieldCheck,
  Settings,
  UserRoundPlus,
  Users,
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navigationGroups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { title: "Members", href: "/members", icon: Users },
      { title: "Visitors", href: "/visitors", icon: UserRoundPlus },
      { title: "Follow-ups", href: "/follow-ups", icon: HandHeart },
    ],
  },
  {
    label: "Church Operations",
    items: [
      { title: "Attendance", href: "/attendance", icon: ClipboardCheck },
      { title: "Evangelism", href: "/evangelism", icon: Megaphone },
      { title: "Ministries", href: "/ministries", icon: Network },
      { title: "Services & Events", href: "/services", icon: CalendarDays },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Communications", href: "/communications", icon: BellRing },
      { title: "Reports", href: "/reports", icon: ChartNoAxesCombined },
      { title: "Users & Roles", href: "/users", icon: ShieldCheck },
    ],
  },
];

export function AppSidebar(props) {
  const pathname = usePathname();

  return (
    <ShadcnSidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Ministry Hub">
              <Link href="/">
                <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Church className="size-4" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Ministry Hub</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    Church management
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className="h-10 rounded-lg data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-md data-[active=true]:shadow-primary/20"
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </ShadcnSidebar>
  );
}

