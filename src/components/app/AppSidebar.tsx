import { Link, useRouterState } from "@tanstack/react-router";
import {
  Award,
  Briefcase,
  Crown,
  FileText,
  FolderClosed,
  LayoutGrid,
  Map,
  MessageCircle,
  Mic,
  Send,
  Settings,
  Sparkles,
  Target,
  User,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { useCurrentUser } from "@/data/user";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: typeof LayoutGrid;
  to?: string;
};

const NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutGrid, to: "/dashboard" },
  { label: "AI Mentor", icon: MessageCircle, to: "/mentor" },
  { label: "Roadmap", icon: Map, to: "/roadmap" },
  { label: "Skills", icon: Target },
  { label: "Projects", icon: FolderClosed },
  { label: "Resumes", icon: FileText, to: "/resume" },
  { label: "Jobs", icon: Briefcase },
  { label: "Applications", icon: Send },
  { label: "Mock Interview", icon: Mic },
  { label: "Certificates", icon: Award },
  { label: "Profile", icon: User },
  { label: "Settings", icon: Settings },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: user } = useCurrentUser();

  return (
    <div className="flex h-full w-[220px] shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground">
      <div className="px-2">
        <Sparkles className="h-6 w-6 text-sidebar-primary-foreground" strokeWidth={1.5} />
        <p className="mt-3 text-[17px] font-extrabold tracking-[0.14em] text-sidebar-primary-foreground">
          CAREERPILOT
        </p>
        <p className="text-[13px] font-semibold tracking-[0.16em] text-terracotta">AI</p>
      </div>

      <nav className="mt-8 flex-1 space-y-0.5 overflow-y-auto pr-1">
        {NAV.map(({ label, icon: Icon, to }) => {
          const active = to ? pathname === to : false;
          const className = cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors",
            active
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          );
          const inner = (
            <>
              <Icon className="h-[17px] w-[17px]" strokeWidth={1.7} />
              <span>{label}</span>
            </>
          );
          return to ? (
            <Link key={label} to={to} onClick={onNavigate} className={className}>
              {inner}
            </Link>
          ) : (
            <button
              key={label}
              type="button"
              onClick={() => toast(`${label} is coming soon`)}
              className={className}
            >
              {inner}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-sidebar-primary-foreground">Unlock Premium</p>
          <Crown className="h-4 w-4 text-terracotta" />
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-sidebar-foreground/60">
          Get full access to AI features and advanced analytics
        </p>
        <button
          type="button"
          onClick={() => toast("Premium plans are coming soon")}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-terracotta px-3 py-2.5 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Upgrade Now <span aria-hidden>→</span>
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-sidebar-border bg-card px-3 py-3">
        <img
          src={user?.avatar ?? undefined}
          alt=""
          loading="lazy"
          className="h-9 w-9 shrink-0 rounded-full bg-muted object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-foreground">{user?.fullName}</p>
          <p className="truncate text-[11.5px] text-muted-foreground">{user?.role}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
