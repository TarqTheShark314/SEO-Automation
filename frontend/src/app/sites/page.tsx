'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  GlobeAltIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { useAppStore } from '@/lib/store'
import { sitesAPI } from '@/lib/api'
import PageHeader from '@/components/layout/PageHeader'
import { toast } from 'sonner'

interface SiteWithMeta {
  id: number
  domain: string
  name: string
  seoScore: number
  lastAudit: string | null
}

// Mock SEO data to enrich site records - will be replaced with API data
function getMockSeoData(siteId: number): { seoScore: number; lastAudit: string | null } {
  const mockScores: Record<number, { seoScore: number; lastAudit: string | null }> = {}
  // Generate deterministic mock data based on site ID
  const score = 60 + ((siteId * 17) % 35)
  const daysAgo = (siteId * 3) % 14
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  mockScores[siteId] = {
    seoScore: score,
    lastAudit: date.toISOString(),
  }
  return mockScores[siteId]
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100 dark:bg-green-900/30'
  if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30'
  return 'bg-red-100 dark:bg-red-900/30'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SitesPage() {
  const { sites, setSites, setSelectedSite, selectedSite } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [addForm, setAddForm] = useState({ domain: '', name: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addErrors, setAddErrors] = useState<{ domain?: string; name?: string }>({})

  const sitesWithMeta: SiteWithMeta[] = sites.map((site) => ({
    ...site,
    ...getMockSeoData(site.id),
  }))

  const fetchSites = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await sitesAPI.list()
      const siteList = Array.isArray(data) ? data : data.items || []
      setSites(siteList)
    } catch {
      toast.error('Failed to load sites')
    }
    setLoading(false)
  }, [setSites])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  const validateForm = (): boolean => {
    const errors: { domain?: string; name?: string } = {}
    if (!addForm.domain.trim()) {
      errors.domain = 'Domain is required'
    } else {
      const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/
      const cleanDomain = addForm.domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      if (!domainPattern.test(cleanDomain)) {
        errors.domain = 'Please enter a valid domain (e.g. example.com)'
      }
    }
    if (!addForm.name.trim()) {
      errors.name = 'Site name is required'
    }
    setAddErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setAddLoading(true)
    try {
      const cleanDomain = addForm.domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      const { data: newSite } = await sitesAPI.create({
        domain: cleanDomain,
        name: addForm.name.trim(),
      })
      const updatedSites = [...sites, newSite]
      setSites(updatedSites)
      if (!selectedSite) {
        setSelectedSite(newSite)
      }
      setShowAddModal(false)
      setAddForm({ domain: '', name: '' })
      setAddErrors({})
      toast.success(`Site "${newSite.name}" added successfully`)
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Failed to add site. Please try again.'
      toast.error(message)
    }
    setAddLoading(false)
  }

  const handleDeleteSite = async (siteId: number) => {
    setDeletingId(siteId)
    try {
      await sitesAPI.delete(siteId)
      const updatedSites = sites.filter((s) => s.id !== siteId)
      setSites(updatedSites)
      if (selectedSite?.id === siteId) {
        setSelectedSite(updatedSites.length > 0 ? updatedSites[0] : null)
      }
      setConfirmDeleteId(null)
      toast.success('Site deleted successfully')
    } catch {
      toast.error('Failed to delete site')
    }
    setDeletingId(null)
  }

  const handleSelectSite = (site: { id: number; domain: string; name: string }) => {
    setSelectedSite(site)
    toast.success(`Switched to ${site.domain}`)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Sites"
        description="Manage your websites and view their SEO performance"
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add Site
          </button>
        }
      />

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading sites...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && sites.length === 0 && (
        <div className="text-center py-20">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <GlobeAltIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No sites yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Add your first website to start tracking SEO performance, running audits, and generating
            optimized content.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add Your First Site
          </button>
        </div>
      )}

      {/* Sites Grid */}
      {!loading && sites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sitesWithMeta.map((site) => (
            <div
              key={site.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm transition-all hover:shadow-md ${
                selectedSite?.id === site.id
                  ? 'border-orange-400 dark:border-orange-500 ring-1 ring-orange-400 dark:ring-orange-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex items-center min-w-0 cursor-pointer group"
                    onClick={() => handleSelectSite(site)}
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <GlobeAltIcon className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="ml-3 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {site.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {site.domain}
                      </p>
                    </div>
                  </div>
                  {selectedSite?.id === site.id && (
                    <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                      Active
                    </span>
                  )}
                </div>

                {/* Score & Audit Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${getScoreBgColor(site.seoScore)}`}>
                      <ChartBarIcon className={`h-4 w-4 ${getScoreColor(site.seoScore)}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">SEO Score</p>
                      <p className={`text-sm font-bold ${getScoreColor(site.seoScore)}`}>
                        {site.seoScore}/100
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last Audit</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatDate(site.lastAudit)}
                    </p>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="flex items-center gap-2">
                  <Link
                    href="/technical-seo"
                    onClick={() => handleSelectSite(site)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <BoltIcon className="h-3.5 w-3.5 mr-1" />
                    Audit
                  </Link>
                  <Link
                    href="/onpage-seo"
                    onClick={() => handleSelectSite(site)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <WrenchScrewdriverIcon className="h-3.5 w-3.5 mr-1" />
                    Optimize
                  </Link>
                  <a
                    href={`https://${site.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Visit site"
                  >
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Card Footer - Delete */}
              <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center justify-between">
                {selectedSite?.id !== site.id ? (
                  <button
                    onClick={() => handleSelectSite(site)}
                    className="text-xs font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    Set as active
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">Currently active</span>
                )}
                {confirmDeleteId === site.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Delete?
                    </span>
                    <button
                      onClick={() => handleDeleteSite(site.id)}
                      disabled={deletingId === site.id}
                      className="px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingId === site.id ? 'Deleting...' : 'Yes'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(site.id)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Delete site"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => {
              if (!addLoading) {
                setShowAddModal(false)
                setAddForm({ domain: '', name: '' })
                setAddErrors({})
              }
            }}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <GlobeAltIcon className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Add New Site
                  </h3>
                </div>
                <button
                  onClick={() => {
                    if (!addLoading) {
                      setShowAddModal(false)
                      setAddForm({ domain: '', name: '' })
                      setAddErrors({})
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddSite} className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="site-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Site Name
                  </label>
                  <input
                    id="site-name"
                    type="text"
                    value={addForm.name}
                    onChange={(e) => {
                      setAddForm({ ...addForm, name: e.target.value })
                      if (addErrors.name) setAddErrors({ ...addErrors, name: undefined })
                    }}
                    placeholder="My Website"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      addErrors.name
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 focus:border-orange-500'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:ring-2 focus:outline-none transition-colors`}
                    disabled={addLoading}
                  />
                  {addErrors.name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
                      <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" />
                      {addErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="site-domain"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Domain
                  </label>
                  <input
                    id="site-domain"
                    type="text"
                    value={addForm.domain}
                    onChange={(e) => {
                      setAddForm({ ...addForm, domain: e.target.value })
                      if (addErrors.domain) setAddErrors({ ...addErrors, domain: undefined })
                    }}
                    placeholder="example.com"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      addErrors.domain
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 focus:border-orange-500'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:ring-2 focus:outline-none transition-colors`}
                    disabled={addLoading}
                  />
                  {addErrors.domain && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
                      <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" />
                      {addErrors.domain}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Enter just the domain without http:// or paths
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setAddForm({ domain: '', name: '' })
                      setAddErrors({})
                    }}
                    disabled={addLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Site
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
