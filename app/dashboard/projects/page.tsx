"use client"

import { useState } from "react"
import { useProjects, useDeleteProject } from "@/app/hooks/useProjects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ProjectForm from "@/components/project-form"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"
import ProjectDeployButton from "@/app/components/project-deploy-button"

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false)
  const { data: projects = [], isLoading, error } = useProjects()
  const deleteMutation = useDeleteProject()

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Project deleted")
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to delete project")
        }
      })
    }
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading projects: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            {projects.length} projects
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "View Projects" : "New Project"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectForm onSuccess={() => setShowForm(false)} />
          </CardContent>
        </Card>
      ) : (
        <>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No projects yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowForm(true)}
                >
                  Create your first project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.framework} • {project.databases.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={project.status === "active" ? "default" : "secondary"}>
                          {project.status}
                        </Badge>
                        
                        <ProjectDeployButton 
                          projectId={project.id} 
                          projectName={project.name} 
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.description}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                      {project.lastDeployedAt && (
                        <span>Last deploy: {new Date(project.lastDeployedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}