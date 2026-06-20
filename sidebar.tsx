import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  FileSignature,
  Stamp,
  ScrollText,
  CalendarRange,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Reportorium Akta", url: "/reportorium", icon: BookOpen },
  { title: "Legalisasi", url: "/legalisasi", icon: FileSignature },
  { title: "Waarmerking", url: "/waarmerking", icon: Stamp },
  { title: "Protes & Wasiat", url: "/protes-wasiat", icon: ScrollText },
  { title: "Laporan Bulanan", url: "/laporan-bulanan", icon: CalendarRange },
  { title: "Pengaturan Notaris", url: "/pengaturan", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground font-serif text-lg font-bold">
            N
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-serif text-base font-semibold leading-tight text-sidebar-foreground">
              Buku Notaris
            </span>
            <span className="text-xs text-sidebar-foreground/60">Pelaporan Resmi</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Buku & Laporan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
