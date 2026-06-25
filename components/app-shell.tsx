import Link from "next/link";
import {
  FlaskConicalIcon,
  FolderKanbanIcon,
  PlayCircleIcon,
  SettingsIcon,
  UploadCloudIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/", label: "Projects", icon: FolderKanbanIcon },
  { href: "/new-simulation", label: "New Simulation", icon: FlaskConicalIcon },
  { href: "/sources", label: "Sources", icon: UploadCloudIcon },
  { href: "/runs", label: "Runs", icon: PlayCircleIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-4 py-4 md:px-6">
        <header className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex flex-col gap-1">
            <span className="text-base font-semibold">before-the-launch</span>
            <span className="text-sm text-muted-foreground">
              Launch perception simulator
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button key={item.href} asChild variant="ghost" size="sm">
                  <Link href={item.href}>
                    <Icon data-icon="inline-start" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </header>
        <main className="flex-1 py-6">{children}</main>
        <Separator />
        <footer className="py-4 text-xs text-muted-foreground">
          Local-first by default. Demo simulations run without AI credentials.
        </footer>
      </div>
    </div>
  );
}
