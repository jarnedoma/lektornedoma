import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://www.lektornedoma.cz"),
  title: {
    default: "Jaroslav Nedoma – lektor Excel, Microsoft 365 a Copilot",
    template: "%s | Lektor Nedoma",
  },
  description:
    "Firemní i veřejná školení Microsoft Excel, Microsoft 365 a Copilot. Praktické kurzy na míru od lektora s praxí od roku 2009 a tisíci proškolených účastníků.",
  openGraph: { locale: "cs_CZ", type: "website", siteName: "Lektor Nedoma" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
