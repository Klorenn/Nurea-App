import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ChartSkeleton() {
  return (
    <Card className="h-[300px]">
      <CardContent className="flex items-center justify-center h-full">
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </CardContent>
    </Card>
  )
}

export function EditorSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-[150px] w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CalendarSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const DynamicTipTapEditor = dynamic(
  () => import("@/components/professional/tiptap-editor").then(mod => mod.TipTapEditor),
  {
    ssr: false,
    loading: () => <EditorSkeleton />
  }
)

export const DynamicAnalyticsChart = dynamic(
  () => import("@/components/dashboard/analytics-chart").then(mod => mod.AnalyticsChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
)

export const DynamicRevenueMetrics = dynamic(
  () => import("@/components/admin/RevenueMetrics").then(mod => mod.RevenueMetrics),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
)

export const DynamicProfessionalCalendar = dynamic(
  () => import("@/components/dashboard/professional-calendar").then(mod => mod.ProfessionalCalendar),
  {
    ssr: false,
    loading: () => <CalendarSkeleton />
  }
)
