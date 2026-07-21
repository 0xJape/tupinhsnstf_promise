import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist, Geist_Mono, Nunito } from "next/font/google";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Clay display headings (Nunito rounded terminals) */
const nunito = Nunito({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

/** Clay body — app-wide */
const dmSans = DM_Sans({
  variable: "--font-clay-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "P.R.O.M.I.S.E.",
    template: "%s · P.R.O.M.I.S.E.",
  },
  description:
    "PCOS Risk Observation, Monitoring, Intervention, Screening, and Education — educational screening, not diagnosis.",
  // App Router also serves src/app/favicon.ico, icon.png, apple-icon.png
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/promise_logo_icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/brand/promise_logo_icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#9F2947",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col text-foreground">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
