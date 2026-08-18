import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseReady — guided support intake",
  description:
    "Turn one support conversation into clear customer, support and engineering outputs without sending case data to a backend.",
  applicationName: "CaseReady",
  authors: [{ name: "Athanasios Zaprios" }],
  openGraph: {
    title: "CaseReady — guided support intake",
    description:
      "One guided intake. Clear outputs for customers, support and engineering.",
    type: "website",
    images: [
      {
        url: "/social-preview.svg",
        width: 1280,
        height: 640,
        alt: "CaseReady — guided support intake by Athanasios Zaprios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CaseReady — guided support intake",
    description:
      "One guided intake. Clear outputs for customers, support and engineering.",
    images: ["/social-preview.svg"],
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#14242d",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
