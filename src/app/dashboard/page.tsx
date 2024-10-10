'use client'
import { Suspense } from 'react'
import DashboardMain from "@/components/DashboardMain"

export default function DashboardPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DashboardMain />
    </Suspense>
  )
}
