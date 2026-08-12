import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/chekapy/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/checkups/$slug",
      params: { slug: params.slug },
      statusCode: 301,
    });
  },
});
