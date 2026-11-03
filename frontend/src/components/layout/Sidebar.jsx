"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  Church,
  ClipboardCheck,
  HandHeart,
  LayoutDashboard,
  Megaphone,
  Network,
  ScrollText,
  ShieldCheck,
  Settings,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navigation = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    title: "People",
    icon: Users,
    items: [
      { title: "Members", href: "/members", icon: Users },
      { title: "Visitors", href: "/visitors", icon: UserRoundPlus },
      { title: "Follow-ups", href: "/follow-ups", icon: HandHeart },
    ],
  },
  {
    title: "Church Operations",
    icon: Church,
    items: [
      { title: "Attendance", href: "/attendance", icon: ClipboardCheck },
      { title: "Evangelism", href: "/evangelism", icon: Megaphone },
      { title: "Ministries", href: "/ministries", icon: Network },
      { title: "Services & Events", href: "/services", icon: CalendarDays },
    ],
  },
  {
    title: "Administration",
    icon: ShieldCheck,
    items: [
      { title: "Communications", href: "/communications", icon: BellRing },
      { title: "Reports", href: "/reports", icon: ChartNoAxesCombined },
      { title: "Users & Roles", href: "/users", icon: ShieldCheck },
      { title: "System Logs", href: "/admin/logs", icon: ScrollText },
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((entry) => {
                if (!entry.items) {
                  const isActive = pathname === entry.href || pathname.startsWith(`${entry.href}/`);
                  return (
                    <SidebarMenuItem key={entry.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={entry.title}
                        className="h-10 rounded-lg data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-md data-[active=true]:shadow-primary/20"
                      >
                        <Link href={entry.href}>
                          <entry.icon />
                          <span>{entry.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                const groupIsActive = entry.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
                return (
                  <Collapsible key={entry.title} defaultOpen={groupIsActive} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={groupIsActive} tooltip={entry.title} className="h-10 rounded-lg">
                          <entry.icon />
                          <span>{entry.title}</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {entry.items.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                              <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton asChild isActive={isActive}>
                                  <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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

