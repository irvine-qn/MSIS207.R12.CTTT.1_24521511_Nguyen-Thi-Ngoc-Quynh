import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/audio/:file*",
        destination: "https://www.soundhelix.com/examples/mp3/:file*",
      },
    ];
  },
};

export default nextConfig;
