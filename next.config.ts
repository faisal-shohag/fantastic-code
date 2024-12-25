import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  async rewrites() {
    
      return [
        {
          source: "/api/execution/python",
          destination: "/api/execution/python-v3",
        },
        {
          source: "/api/execution/python-v2",
          destination: "/api/execution/python-v3",
        },
      ];
  },
};

export default nextConfig;
