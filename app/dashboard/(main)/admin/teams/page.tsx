"use client"

import { AgentTeamDashboard } from "@/components/agents/team-dashboard"
import { RouteGuard } from "@/components/auth/route-guard"

export default function TeamsModePage() {
  return (
    <RouteGuard requiredRole="admin">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <AgentTeamDashboard />
      </div>
    </RouteGuard>
  )
}
