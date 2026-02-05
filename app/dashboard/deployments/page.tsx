"use client"

import { useDeployments } from "@/app/hooks/useDeployments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, Clock, Play, AlertCircle } from "lucide-react"

export default function DeploymentsPage() {
  const { data: deployments = [], isLoading, error } = useDeployments()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'running': return <Play className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'running': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading deployments: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Deployments</h1>
          <p className="text-muted-foreground">
            {deployments.length} deployments
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : deployments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No deployments yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Go to Projects and click "Deploy" to create your first deployment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deployments.map((deployment) => (
            <Card key={deployment.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(deployment.status)}
                    <div>
                      <CardTitle className="text-lg">
                        {deployment.project?.name || 'Unknown Project'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {deployment.commitMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{deployment.environment}</Badge>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(deployment.status)}`} />
                      <Badge variant="secondary">{deployment.status}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Commit</p>
                    <code className="text-xs font-mono">
                      {deployment.commitHash.substring(0, 8)}
                    </code>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Started</p>
                    <p>{new Date(deployment.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p>
                      {deployment.buildTime 
                        ? `${deployment.buildTime}s` 
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">URL</p>
                    <p className="truncate">
                      {deployment.url ? (
                        <a 
                          href={deployment.url} 
                          target="_blank" 
                          className="text-primary hover:underline"
                        >
                          {deployment.url.replace('https://', '')}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}