"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectSchema, type ProjectFormData } from "@/lib/validations"
import { useCreateProject } from "@/app/hooks/useProjects"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ProjectFormProps {
  onSuccess?: () => void
}

export default function ProjectForm({ onSuccess }: ProjectFormProps) {
  const { mutate: createProject, isPending } = useCreateProject()
  
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      repositoryUrl: "",
      framework: "nextjs",
      database: ["postgresql"],
      isPrivate: false,
    },
  })

  function onSubmit(data: ProjectFormData) {
    
    console.log('Form data:', data)

    createProject({
      name: data.name,
      description: data.description,
      repositoryUrl: data.repositoryUrl,
      framework: data.framework,
      databases: data.database,
      isPrivate: data.isPrivate,
    }, {
      onSuccess: () => {
        toast.success("Project created successfully")
        form.reset()
        if (onSuccess) onSuccess()
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create project")
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="My Awesome Project" 
                  {...field} 
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project..."
                  className="min-h-[100px]"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="repositoryUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://github.com/username/repo" 
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Project"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  )
}
