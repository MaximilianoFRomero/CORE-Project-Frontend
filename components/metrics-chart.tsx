"use client"

import { useState, useEffect, useMemo } from 'react'
import { useDeployments } from '../app/hooks/index'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ReferenceLine
} from 'recharts'

export default function MetricsChart() {
  const [isMounted, setIsMounted] = useState(false)
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  
  const { data: deployments = [], isLoading, error } = useDeployments()
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { chartData, dateRange, interval } = useMemo(() => {
    if (!deployments || deployments.length === 0) {
      return { chartData: [], dateRange: 'No data', interval: 'day' as const }
    }

    const sortedDeployments = [...deployments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    
    const firstDate = new Date(sortedDeployments[0].createdAt)
    const lastDate = new Date(sortedDeployments[sortedDeployments.length - 1].createdAt)

    const timeRangeDays = Math.ceil(
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    let interval: 'hour' | 'day' | 'week' | 'month' = 'day'
    if (timeRangeDays <= 2) {
      interval = 'hour'
    } else if (timeRangeDays <= 14) {
      interval = 'day'
    } else if (timeRangeDays <= 90) {
      interval = 'week'
    } else {
      interval = 'month'
    }

    const groupedData: Record<string, { deployments: number; successes: number; failures: number }> = {}
    
    sortedDeployments.forEach(deployment => {
      const date = new Date(deployment.createdAt)
      let key: string
      
      switch (interval) {
        case 'hour':
          key = date.toLocaleTimeString('en-US', { 
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
          break
        case 'day':
          key = date.toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric'
          })
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = `Week ${weekStart.getMonth() + 1}/${weekStart.getDate()}`
          break
        case 'month':
          key = date.toLocaleDateString('en-US', { 
            month: 'short',
            year: 'numeric'
          })
          break
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { deployments: 0, successes: 0, failures: 0 }
      }
      
      groupedData[key].deployments += 1
      if (deployment.status === 'success') {
        groupedData[key].successes += 1
      } else if (deployment.status === 'failed') {
        groupedData[key].failures += 1
      }
    })

    const chartData = Object.entries(groupedData).map(([key, values]) => ({
      interval: key,
      deployments: values.deployments,
      successes: values.successes,
      failures: values.failures,
      successRate: values.deployments > 0 
        ? Math.round((values.successes / values.deployments) * 100) 
        : 0
    }))

    const dateRange = `${firstDate.toLocaleDateString()} - ${lastDate.toLocaleDateString()}`
    
    return { chartData, dateRange, interval }
  }, [deployments])

  const stats = useMemo(() => {
    if (!deployments || deployments.length === 0) {
      return { total: 0, successRate: 0, avgPerDay: 0 }
    }
    
    const total = deployments.length
    const successes = deployments.filter(d => d.status === 'success').length
    const successRate = total > 0 ? Math.round((successes / total) * 100) : 0

    const dates = deployments.map(d => new Date(d.createdAt).toDateString())
    const uniqueDays = new Set(dates).size
    const avgPerDay = uniqueDays > 0 ? (total / uniqueDays).toFixed(1) : 0
    
    return { total, successRate, avgPerDay }
  }, [deployments])

  useEffect(() => {
    if (deployments.length > 0) {
      console.log('=== SMART METRICS CHART ===')
      console.log('Total deployments:', deployments.length)
      console.log('Date range:', dateRange)
      console.log('Optimal interval:', interval)
      console.log('Chart data points:', chartData.length)
      console.log('Stats:', stats)
    }
  }, [deployments, dateRange, interval, chartData, stats])

  if (!isMounted) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-muted-foreground">Initializing analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-red-500">Error loading analytics data</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading deployment analytics...</div>
      </div>
    )
  }

  if (deployments.length === 0) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center gap-4">
        <div className="text-muted-foreground text-lg">No deployment analytics available</div>
        <div className="text-sm text-muted-foreground text-center max-w-md">
          Deploy some projects to see detailed metrics and trends over time.
          Analytics will automatically adjust to show hourly, daily, weekly, or monthly views.
        </div>
      </div>
    )
  }

  const shouldUseBarChart = chartData.length > 15 || interval === 'month'

  return (
    <div className="h-[400px] w-full min-w-0 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-semibold">Deployment Analytics</h3>
          <p className="text-sm text-muted-foreground">
            {dateRange} • Auto-detected: {interval} view
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <div className="text-xs text-muted-foreground">Success</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.avgPerDay}</div>
              <div className="text-xs text-muted-foreground">Avg/Day</div>
            </div>
          </div>
          
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm ${chartType === 'line' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm ${chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {shouldUseBarChart || chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#838383ff" vertical={false} />
              <XAxis 
                dataKey="interval" 
                angle={-45}
                textAnchor="end"
                height={60}
                stroke="#838383ff"
                fontSize={11}
              />
              <YAxis 
                stroke="#838383ff"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend />
              <Bar 
                dataKey="deployments" 
                fill="#3b82f6" 
                name="Total Deployments"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="successes" 
                fill="#3bf63bff" 
                name="Successful"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="failures" 
                fill="#ef4444" 
                name="Failed"
                radius={[2, 2, 0, 0]}
              />
              <ReferenceLine 
                y={stats.avgPerDay} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="3 3"
                label={{ 
                  value: `Avg: ${stats.avgPerDay}`, 
                  position: 'right',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 10
                }}
              />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#838383ff" />
              <XAxis 
                dataKey="interval" 
                stroke="#838383ff"
                fontSize={11}
              />
              <YAxis 
                stroke="#838383ff"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="deployments" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Total Deployments"
              />
              <Line 
                type="monotone" 
                dataKey="successes" 
                stroke="#3bf63bff" 
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Successful"
              />
              <Line 
                type="monotone" 
                dataKey="failures" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Failed"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-muted-foreground flex justify-between items-center">
        <div>
          Showing {deployments.length} deployments across {chartData.length} {interval}s
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#3b82f6]" />
            <span>Total</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>Success</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-destructive" />
            <span>Failed</span>
          </div>
        </div>
      </div>
    </div>
  )
}