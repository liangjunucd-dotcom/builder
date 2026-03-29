import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AccountProvider } from "@/context/AccountContext";
import { BillingProvider } from "@/context/BillingContext";
import { ProjectsProvider } from "@/context/ProjectsContext";
import { ConditionalShell } from "@/components/ConditionalShell";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Aqara Builder",
  description: "Aqara Builder platform for spatial intelligence developers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body
        className="bg-black text-zinc-200 antialiased"
        suppressHydrationWarning
      >
        <AccountProvider>
          <BillingProvider>
          <ProjectsProvider>
            <Suspense
              fallback={
                <div className="flex h-screen items-center justify-center text-zinc-500">
                  Loading...
                </div>
              }
            >
              <ConditionalShell>{children}</ConditionalShell>
            </Suspense>
          </ProjectsProvider>
          </BillingProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
