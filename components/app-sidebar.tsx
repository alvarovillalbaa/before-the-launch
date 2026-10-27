"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanbanIcon, SettingsIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  { href: "/", label: "Projects", icon: FolderKanbanIcon },
  { href: "/sources", label: "Sources", icon: UploadCloudIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeMobile = () => { if (isMobile) setOpenMobile(false); };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="gap-4 px-4 py-5">
        <div className="flex items-start justify-between gap-2">
          <Link href="/" onClick={closeMobile} className="rounded-md py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="block text-base font-semibold">before-the-launch</span>
            <span className="mt-1 block text-xs text-muted-foreground">Launch perception simulator</span>
          </Link>
          <Button type="button" variant="ghost" size="icon" className="min-h-11 min-w-11 md:hidden" aria-label="Close navigation" onClick={() => setOpenMobile(false)}>
            <XIcon aria-hidden="true" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <nav id="workspace-navigation" aria-label="Primary navigation">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => {
                  const active = item.href === "/"
                    ? pathname === "/" || pathname.startsWith("/projects") || pathname.startsWith("/runs") || pathname === "/new-simulation"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} className="min-h-11">
                        <Link href={item.href} aria-current={active ? "page" : undefined} onClick={closeMobile}>
                          <Icon aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>
      <SidebarFooter className="border-t px-4 py-4 text-xs leading-relaxed text-muted-foreground">
        Local-first workspace. Demo simulations run without AI credentials.
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebarToggle() {
  const { isMobile, openMobile, open } = useSidebar();
  return <SidebarTrigger aria-label="Toggle navigation" aria-controls="workspace-navigation" aria-expanded={isMobile ? openMobile : open} className="min-h-11 min-w-11" />;
}
