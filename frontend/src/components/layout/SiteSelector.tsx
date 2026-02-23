'use client'

import { useAppStore } from '@/lib/store'

export default function SiteSelector() {
  const { sites, selectedSite, setSelectedSite } = useAppStore()

  if (sites.length === 0) return null

  return (
    <select
      value={selectedSite?.id || ''}
      onChange={(e) => {
        const site = sites.find((s) => s.id === Number(e.target.value))
        if (site) setSelectedSite(site)
      }}
      className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    >
      {sites.map((site) => (
        <option key={site.id} value={site.id}>
          {site.domain}
        </option>
      ))}
    </select>
  )
}
