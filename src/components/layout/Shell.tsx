"use client";

import Sidebar from "./Sidebar";
import { useStore } from "@/store";

export default function Shell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useStore();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main
        className="transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "256px" : "80px" }}
      >
        {children}
      </main>
    </div>
  );
}
