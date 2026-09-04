import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  // Sessions live in localStorage, which the server cannot read.
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.pathname, reset: undefined } });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, current_status")
      .eq("user_id", data.user.id)
      .maybeSingle();

    const onboarded = profile?.onboarding_completed === true;
    const phase1Done = profile?.current_status != null;
    const onOnboarding = location.pathname.startsWith("/onboarding");

    // Need onboarding if: never completed original onboarding, OR
    // legacy user who hasn't completed Phase 1 "Know Me" yet.
    if ((!onboarded || !phase1Done) && !onOnboarding) {
      throw redirect({ to: "/onboarding" });
    }
    // Returning users (onboarded + phase1Done) may freely access
    // /onboarding to edit their "Know Me" profile — no redirect.

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
