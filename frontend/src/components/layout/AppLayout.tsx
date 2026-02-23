'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { useAppStore } from '@/lib/store'
import { authAPI, sitesAPI } from '@/lib/api'

const publicPaths = ['/login', '/register']

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { setUser, setSites, setSelectedSite, selectedSite } = useAppStore()
  const [loading, setLoading] = useState(true)
  const isPublic = publicPaths.includes(pathname)

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        if (!isPublic) router.push('/login')
        setLoading(false)
        return
      }
      try {
        const { data: user } = await authAPI.me()
        setUser(user)
        try {
          const { data: sites } = await sitesAPI.list()
          const siteList = Array.isArray(sites) ? sites : sites.items || []
          setSites(siteList)
          if (siteList.length > 0 && !selectedSite) {
            setSelectedSite(siteList[0])
          }
        } catch {
          // Sites API may fail, that's okay
        }
      } catch {
        localStorage.removeItem('access_token')
        if (!isPublic) router.push('/login')
      }
      setLoading(false)
    }
    init()
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

  if (isPublic) {
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
