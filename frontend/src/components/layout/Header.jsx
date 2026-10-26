"use client";

import { usePathname } from "next/navigation";
import { Bell, Church, CircleUserRound, LogOut, Settings, UserRound } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const currentPage = pathname.split("/").filter(Boolean).at(-1) ?? "Home";
  const title = currentPage
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <header className="sticky top-2 z-20 mx-3 mt-2 mb-3 flex h-20 shrink-0 items-center gap-3 rounded-xl bg-header px-4 shadow-(--header-shadow) sm:mx-5 sm:px-6 lg:mx-8">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden sm:inline-flex">Ministry Hub</BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="hidden items-center gap-2 text-sm font-medium lg:flex">
        <Church className="size-4 text-primary" />
        Kampala Community Church
      </div>
      <Separator orientation="vertical" className="hidden h-5 lg:block" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
            <Bell />
            <Badge className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]">3</Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex-col items-start gap-1 py-3">
            <span className="font-medium">Six follow-ups are overdue</span>
            <span className="text-xs text-muted-foreground">Review assignments requiring attention.</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex-col items-start gap-1 py-3">
            <span className="font-medium">Attendance record completed</span>
            <span className="text-xs text-muted-foreground">Sunday Main Service was recorded.</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2" aria-label="Open administrator menu">
            <CircleUserRound className="size-5" />
            <span className="hidden text-sm sm:inline">Administrator</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Admin account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem><UserRound />Profile</DropdownMenuItem>
          <DropdownMenuItem><Settings />Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem><LogOut />Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

