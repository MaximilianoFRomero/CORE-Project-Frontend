"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"
import { useCreateDeployment } from "@/app/hooks/useDeployments"
import { toast } from "sonner"

interface ProjectDeployButtonProps {
    projectId: string
    projectName: string
}

export default function ProjectDeployButton({
    projectId,
    projectName
}: ProjectDeployButtonProps) {
    const [isDeploying, setIsDeploying] = useState(false)
    const createDeployment = useCreateDeployment()

    const handleDeploy = async () => {
        if (!confirm(`Deploy project "${projectName}"?`)) return

        setIsDeploying(true)

        try {
            await createDeployment.mutateAsync({
                projectId,
                commitHash: generateCommitHash(),
                commitMessage: `Deploy ${projectName}`,
                environment: 'development'
            })

            toast.success(`Deployment started for "${projectName}"`)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            toast.error(`Failed to deploy: ${errorMessage}`)
        } finally {
            setIsDeploying(false)
        }
    }

    const generateCommitHash = () => {
        return Math.random().toString(36).substring(2, 9)
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDeploy}
            disabled={isDeploying || createDeployment.isPending}
        >
            <Rocket className="h-4 w-4 mr-2" />
            {isDeploying ? "Deploying..." : "Deploy"}
        </Button>
    )
}