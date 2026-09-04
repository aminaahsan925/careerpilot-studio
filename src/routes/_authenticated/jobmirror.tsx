import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/jobmirror")({
  beforeLoad: () => {
    throw redirect({ to: "/flightplan" });
  },
});
