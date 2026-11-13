import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

if (process.env.VERCEL === "1" && process.env.WORKFLOW_TARGET_WORLD
  && process.env.WORKFLOW_TARGET_WORLD !== "vercel") {
  throw new Error("Hosted simulation dispatch requires the authenticated Vercel Workflow World.");
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.105"],
  async redirects() {
    return [
      {
        source: "/app/workspaces/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default withWorkflow(nextConfig);
