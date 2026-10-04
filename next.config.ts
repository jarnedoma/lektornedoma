import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  // Staré adresy z předchozí verze webu → nové stránky (301, zachová pozice ve vyhledávačích)
  async redirects() {
    return [
      { source: "/lektor", destination: "/o-lektorovi", permanent: true },
      { source: "/nabidka", destination: "/terminy", permanent: true },
      { source: "/reference-jednotlivci", destination: "/reference?typ=jednotlivci", permanent: true },
      { source: "/hodnoceni", destination: "/reference?typ=jednotlivci", permanent: true },
      { source: "/kurzy-excel", destination: "/kurzy#excel", permanent: true },
      { source: "/kurzy-:aplikace", destination: "/kurzy#microsoft-365", permanent: true },
      { source: "/:stranka.php", destination: "/:stranka", permanent: true },
    ];
  },
};

export default nextConfig;
