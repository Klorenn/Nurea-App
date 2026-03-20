"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-8 p-8">
      {/* Header skeleton */}
      <div className="flex items-center gap-5">
        <Skeleton className="h-16 w-16 rounded-[22px]" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="rounded-[32px]">
            <CardContent className="p-7">
              <div className="flex justify-between">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-6 w-20 rounded-lg" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart and activity skeleton */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-[40px]">
          <CardContent className="p-8 h-[350px]">
            <Skeleton className="h-full w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card className="rounded-[40px]">
          <CardContent className="p-8 h-[350px]">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
