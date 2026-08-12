import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/chekapy/")({
  beforeLoad: () => {
    throw redirect({ to: "/checkups", statusCode: 301 });
  },
});
