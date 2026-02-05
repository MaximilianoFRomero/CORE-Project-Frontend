"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useProjects, useDeployments } from "@/app/hooks/index"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Rocket, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { useAuth } from '@/app/providers/auth-provider'
import { LogOut } from 'lucide-react'

export default function DashboardNav() {
  const { logout, user } = useAuth()
  const pathname = usePathname()
  const { data: projects = [], isLoading: projectsLoading } = useProjects()
  const { data: deployments = [], isLoading: deploymentsLoading } = useDeployments()

  const activeProjects = projects.filter(p => p.status === 'active').length
  const runningDeployments = deployments.filter(d => d.status === 'running').length

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { 
      href: "/dashboard/projects", 
      label: "Projects", 
      icon: FileText, 
      badge: projectsLoading ? (
        <Skeleton className="h-5 w-5" />
      ) : (
        activeProjects.toString()
      )
    },
    { 
      href: "/dashboard/deployments", 
      label: "Deployments", 
      icon: Rocket, 
      badge: deploymentsLoading ? (
        <Skeleton className="h-5 w-5" />
      ) : (
        runningDeployments.toString()
      )
    },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]
  return (
    <nav className="p-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center">
                {item.badge}
              </Badge>
            )}
          </Link>
          
        )
        
      })}
<nav className="flex flex-col v-screen px-4 py-4">

  <div className="space-y-2">

  </div>

  <div className="mt-auto pt-4 border-t">
    <div className="px-3 py-2 text-xs text-muted-foreground">
      Logged in as {user?.email}
    </div>

    <button
      onClick={logout}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 w-full"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </button>
  </div>
</nav>


    </nav>
    
  )
  
  
}