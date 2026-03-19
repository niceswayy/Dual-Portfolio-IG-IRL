"use client";

import Shell from "@/components/layout/Shell";
import Header from "@/components/layout/Header";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import AgentNetwork from "@/components/dashboard/AgentNetwork";

export default function DashboardPage() {
  return (
    <Shell>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        <StatsGrid />
        <div className="grid grid-cols-2 gap-6">
          <AgentNetwork />
          <ActivityFeed />
        </div>
      </div>
    </Shell>
  );
}
