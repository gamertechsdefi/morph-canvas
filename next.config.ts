import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none", // Relax COOP for development
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless", // Relax COEP
          },
        ],
      },
    ];
  },

  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
