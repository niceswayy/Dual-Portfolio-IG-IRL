import type { Metadata } from "next";
import "./globals.css";
import ToastContainer from "@/components/shared/Toast";

export const metadata: Metadata = {
  title: "Braincells - Agent Orchestration Interface",
  description:
    "Real-time AI agent management with MCP, skill building, and project orchestration",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
