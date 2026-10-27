import { AppSidebar, AppSidebarToggle } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <a href="#main-content" className="sr-only left-4 top-4 z-[60] rounded-md bg-background px-4 py-3 shadow-md focus:not-sr-only focus:fixed focus-visible:ring-2 focus-visible:ring-ring">
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="flex min-h-16 items-center gap-3 border-b px-4 md:px-6">
          <AppSidebarToggle />
          <span className="text-sm text-muted-foreground">Launch workspace</span>
        </header>
        <div id="main-content" tabIndex={-1} className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-6 outline-none md:px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
