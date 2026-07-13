import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old per-game route → new SEO "-result" URL.
      {
        source: "/game/:slug",
        destination: "/:slug-result",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
