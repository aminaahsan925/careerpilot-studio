import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";

import { AppSidebar } from "@/components/app/AppSidebar";

export function AppLayout({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen lg:block">
        <AppSidebar />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="h-full overflow-y-auto">
            <AppSidebar onNavigate={() => setOpen(false)} />
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            className="flex-1 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
        </div>
      ) : null}

      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-start gap-4">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="mt-1 rounded-lg border border-border bg-card p-2 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-foreground">{title}</h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="hidden items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-card md:flex md:w-[300px] lg:w-[340px]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search anything..."
                className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground"
              />
              <span className="rounded text-[11px] text-muted-foreground">⌘K</span>
            </label>
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-xl border border-border bg-card p-2.5 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-terracotta" />
            </button>
          </div>
        </header>

        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
