import type { NextConfig } from "next";

// Content-Security-Policy — voorlopig Report-Only: de browser rapporteert
// overtredingen (console) maar blokkeert niets, zodat de site niet kan breken.
// Na een paar dagen zonder relevante violations omzetten naar de afdwingende
// header-naam "Content-Security-Policy". Externe origins: formspree (contact),
// supabase (afbeeldingen). next/font self-host de fonts, dus geen externe font-calls.
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://formspree.io https://*.supabase.co",
  "form-action 'self' https://formspree.io",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
];

const nextConfig: NextConfig = {
  // X-Powered-By: Next.js niet lekken (security-scan 2026-06-05, P2).
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Cache Components: data is request-time by default; published content wordt
  // expliciet gecacht via 'use cache' in src/lib/supabase/content.ts.
  cacheComponents: true,
  // Next 16.4 wil deze keuze expliciet. `false` houdt het prefetchgedrag van 16.1.6 (ISS-071 in
  // het Siteup-portaal: alleen de beveiligingsupgrade, geen gedragswijziging). Aanzetten is een
  // eigen keuze, met een meting ervoor en erna.
  partialPrefetching: false,
  images: {
    remotePatterns: [
      {
        // Portal-project (Siteup-portaal). Beelden komen uit de gedeelde
        // public bucket tenant-assets onder {tenant_id}/...
        protocol: "https",
        hostname: "rixcftsqezmvtucuwupc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
