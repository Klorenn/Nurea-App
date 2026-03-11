"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

export interface AnalyticsChartProps {
  title: string
  data: ChartDataPoint[]
  type?: "line" | "bar" | "area"
  dataKey?: string
  color?: string
  className?: string
  height?: number
}

export function AnalyticsChart({
  title,
  data,
  type = "line",
  dataKey = "value",
  color = "hsl(var(--primary))",
  className,
  height = 300,
}: AnalyticsChartProps) {
  const ChartComponent = {
    line: LineChart,
    bar: BarChart,
    area: AreaChart,
  }[type]

  const DataComponent = {
    line: Line,
    bar: Bar,
    area: Area,
  }[type] as any

  return (
    <Card className={cn("border-border/40", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <DataComponent
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={type === "area" ? 0.6 : undefined}
            />
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
