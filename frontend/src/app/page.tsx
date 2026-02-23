'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChartBarIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  MapPinIcon,
  SparklesIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BoltIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { useAppStore } from '@/lib/store'
import PageHeader from '@/components/layout/PageHeader'
import { toast } from 'sonner'

// Mock data for demonstration - structured for easy API replacement
const stats = [
  {
    name: 'Overall SEO Score',
    value: '87',
    change: '+5',
    changeType: 'positive' as const,
    icon: ChartBarIcon,
  },
  {
    name: 'Organic Traffic',
    value: '24.5K',
    change: '+12%',
    changeType: 'positive' as const,
    icon: ArrowTrendingUpIcon,
  },
  {
    name: 'Keywords in Top 10',
    value: '156',
    change: '+23',
    changeType: 'positive' as const,
    icon: GlobeAltIcon,
  },
  {
    name: 'GEO Visibility Score',
    value: '72',
    change: '+8',
    changeType: 'positive' as const,
    icon: SparklesIcon,
  },
]

const recentIssues = [
  {
    id: 1,
    title: 'Missing meta descriptions',
    severity: 'high' as const,
    pages: 12,
    autoFixable: true,
  },
  {
    id: 2,
    title: 'Slow page load time',
    severity: 'medium' as const,
    pages: 5,
    autoFixable: false,
  },
  {
    id: 3,
    title: 'Missing alt text on images',
    severity: 'medium' as const,
    pages: 28,
    autoFixable: true,
  },
  {
    id: 4,
    title: 'Broken internal links',
    severity: 'high' as const,
    pages: 3,
    autoFixable: true,
  },
]

const pendingOptimizations = [
  {
    id: 1,
    title: 'Schema markup for blog posts',
    type: 'Technical SEO',
    impact: 'High',
  },
  {
    id: 2,
    title: 'Internal linking suggestions',
    type: 'On-Page SEO',
    impact: 'Medium',
  },
  {
    id: 3,
    title: 'Meta title optimization',
    type: 'On-Page SEO',
    impact: 'High',
  },
]

const modules = [
  {
    name: 'Technical SEO',
    description: 'Automated audits, schema markup, indexing',
    icon: WrenchScrewdriverIcon,
    href: '/technical-seo',
    color: 'bg-blue-500',
  },
  {
    name: 'On-Page SEO',
    description: 'Meta optimization, internal linking',
    icon: DocumentTextIcon,
    href: '/onpage-seo',
    color: 'bg-green-500',
  },
  {
    name: 'Local SEO',
    description: 'GBP automation, reviews, citations',
    icon: MapPinIcon,
    href: '/local-seo',
    color: 'bg-purple-500',
  },
  {
    name: 'AI Content',
    description: 'Claude-powered content generation',
    icon: SparklesIcon,
    href: '/content',
    color: 'bg-orange-500',
  },
  {
    name: 'GEO/LLM SEO',
    description: 'AI search visibility tracking',
    icon: SparklesIcon,
    href: '/geo-seo',
    color: 'bg-pink-500',
  },
  {
    name: 'Analytics',
    description: 'Performance tracking & reports',
    icon: ChartBarIcon,
    href: '/analytics',
    color: 'bg-indigo-500',
  },
]

export default function Dashboard() {
  const { user, selectedSite } = useAppStore()
  const router = useRouter()
  const [deployingAll, setDeployingAll] = useState(false)

  const handleRunAudit = () => {
    if (!selectedSite) {
      toast.error('Please select a site first')
      return
    }
    router.push('/technical-seo')
    toast.info('Navigating to Technical SEO to run audit...')
  }

  const handleGenerateContent = () => {
    if (!selectedSite) {
      toast.error('Please select a site first')
      return
    }
    router.push('/content')
    toast.info('Navigating to AI Content generator...')
  }

  const handleCheckGEO = () => {
    if (!selectedSite) {
      toast.error('Please select a site first')
      return
    }
    router.push('/geo-seo')
    toast.info('Navigating to GEO/LLM SEO...')
  }

  const handleAutoFix = (issueId: number) => {
    toast.success(`Auto-fix started for issue #${issueId}`)
  }

  const handleApproveOptimization = (optId: number) => {
    toast.success(`Optimization #${optId} approved`)
  }

  const handleDeployAll = () => {
    setDeployingAll(true)
    setTimeout(() => {
      setDeployingAll(false)
      toast.success(`Deployed ${pendingOptimizations.length} optimizations`)
    }, 1500)
  }

  const firstName = user?.full_name?.split(' ')[0] || 'User'

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Overview of your SEO performance and pending actions"
        action={
          <button
            onClick={handleRunAudit}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            Run Full Audit
          </button>
        }
      />

      {/* Welcome Section */}
      <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              Welcome back, {firstName}!
            </h2>
            <p className="mt-1 text-orange-100 text-sm">
              {selectedSite
                ? `Managing ${selectedSite.domain} - here's your latest SEO overview.`
                : 'Select a site to view your SEO dashboard.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRunAudit}
              className="inline-flex items-center px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <BoltIcon className="h-4 w-4 mr-1.5" />
              Run Audit
            </button>
            <button
              onClick={handleGenerateContent}
              className="inline-flex items-center px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4 mr-1.5" />
              Generate Content
            </button>
            <button
              onClick={handleCheckGEO}
              className="inline-flex items-center px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-1.5" />
              Check GEO Score
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <stat.icon className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                  {stat.name}
                </p>
                <div className="flex items-baseline mt-0.5">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <span
                    className={`ml-2 text-xs font-semibold ${
                      stat.changeType === 'positive'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Modules & Issues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Access Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              SEO Modules
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {modules.map((module) => (
                <Link
                  key={module.name}
                  href={module.href}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 transition-all group"
                >
                  <div
                    className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <module.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {module.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {module.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Issues */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Issues
                </h2>
                <Link
                  href="/technical-seo"
                  className="text-sm text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentIssues.map((issue) => (
                <li key={issue.id} className="px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      {issue.severity === 'high' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                      ) : (
                        <ClockIcon className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {issue.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {issue.pages} pages affected
                        </p>
                      </div>
                    </div>
                    {issue.autoFixable && (
                      <button
                        onClick={() => handleAutoFix(issue.id)}
                        className="ml-3 flex-shrink-0 px-3 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                      >
                        Auto-Fix
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Optimizations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Optimizations
              </h2>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {pendingOptimizations.map((opt) => (
                <li key={opt.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {opt.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {opt.type}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span
                          className={`text-xs font-medium ${
                            opt.impact === 'High'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-yellow-600 dark:text-yellow-400'
                          }`}
                        >
                          {opt.impact} Impact
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApproveOptimization(opt.id)}
                      className="flex-shrink-0 text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleDeployAll}
                disabled={deployingAll}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deployingAll ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Deploying...
                  </span>
                ) : (
                  `Deploy All (${pendingOptimizations.length})`
                )}
              </button>
            </div>
          </div>

          {/* GEO/AI Visibility */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl shadow-sm p-5 text-white">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <h2 className="ml-3 text-lg font-semibold">AI Visibility</h2>
            </div>
            <p className="text-3xl font-bold mb-1">72%</p>
            <p className="text-sm text-white/80 mb-4">
              Your brand appears in 72% of relevant AI queries
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/90">ChatGPT</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '78%' }} />
                  </div>
                  <span className="font-medium w-8 text-right">78%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/90">Claude</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '75%' }} />
                  </div>
                  <span className="font-medium w-8 text-right">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/90">Gemini</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '68%' }} />
                  </div>
                  <span className="font-medium w-8 text-right">68%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/90">Perplexity</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '65%' }} />
                  </div>
                  <span className="font-medium w-8 text-right">65%</span>
                </div>
              </div>
            </div>
            <Link
              href="/geo-seo"
              className="mt-4 block w-full text-center px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
            >
              View GEO Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
