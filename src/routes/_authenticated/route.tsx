import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  // Sessions live in localStorage, which the server cannot read.
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.pathname } });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", data.user.id)
      .maybeSingle();

    const onboarded = profile?.onboarding_completed === true;
    const onOnboarding = location.pathname.startsWith("/onboarding");

    if (!onboarded && !onOnboarding) throw redirect({ to: "/onboarding" });
    if (onboarded && onOnboarding) throw redirect({ to: "/dashboard" });

    return { user: data.user };
  },
  component: () => <Outlet />,
  pendingComponent: AuthPending,
});

function AuthPending() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
        Checking your session…
      </div>
    </div>
  );
}
