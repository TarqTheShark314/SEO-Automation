'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { useAppStore } from '@/lib/store'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { setUser, user } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set a default dev user so the dashboard is accessible without auth
    if (!user) {
      setUser({ id: 1, email: 'dev@piebot.local', full_name: 'PieBot Dev' })
    }
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading PieBot SEO...</p>
        </div>
      </div>
    )
  }

  // Login/register pages render without sidebar
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
