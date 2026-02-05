"use client"

import { useProjectsStats, useDeploymentsStats } from "../hooks/index"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MetricsChart from "@/components/metrics-chart"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { 
    data: projectsStats, 
    isLoading: projectsLoading 
  } = useProjectsStats()
  
  const { 
    data: deploymentsStats, 
    isLoading: deploymentsLoading 
  } = useDeploymentsStats()

  const isLoading = projectsLoading || deploymentsLoading

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <p className="text-2xl font-bold">{projectsStats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {projectsStats?.active || 0} active • {projectsStats?.inactive || 0} inactive
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <p className="text-2xl font-bold">{deploymentsStats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {deploymentsStats?.success || 0} success • {deploymentsStats?.failed || 0} failed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <p className="text-2xl font-bold">
                  {deploymentsStats?.successRate ? deploymentsStats.successRate.toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {deploymentsStats?.today || 0} deployments today
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="min-w-0">
            <MetricsChart />
          </div>
        </CardContent>
      </Card>
      
    </div>
  )
}