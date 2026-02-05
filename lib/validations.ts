import { z } from "zod"

export const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  repositoryUrl: z.string().url("Must be a valid URL"),
  framework: z.enum(["nextjs", "nestjs", "express", "react", "vue"]),
  database: z.array(z.enum(["postgresql", "mongodb", "mysql", "redis"])),
  isPrivate: z.boolean(),
})

export type ProjectFormData = z.infer<typeof projectSchema>