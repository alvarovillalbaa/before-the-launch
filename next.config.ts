import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

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
