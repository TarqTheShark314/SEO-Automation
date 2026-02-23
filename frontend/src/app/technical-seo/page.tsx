'use client'

import { useState } from 'react'
import {
  WrenchScrewdriverIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  EyeIcon,
  BoltIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CodeBracketIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import PageHeader from '@/components/layout/PageHeader'
import { toast } from 'sonner'

// ── Mock Data ────────────────────────────────────────────────────────────────

const auditScores = [
  { label: 'Site Health', score: 85, color: 'text-green-500', bgColor: 'bg-green-500', trackColor: 'bg-green-100 dark:bg-green-900/30' },
  { label: 'Crawlability', score: 92, color: 'text-emerald-500', bgColor: 'bg-emerald-500', trackColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { label: 'Indexability', score: 78, color: 'text-yellow-500', bgColor: 'bg-yellow-500', trackColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { label: 'Performance', score: 70, color: 'text-orange-500', bgColor: 'bg-orange-500', trackColor: 'bg-orange-100 dark:bg-orange-900/30' },
]

const recentAudits = [
  {
    id: 1,
    date: '2026-02-23',
    pagesCrawled: 248,
    issuesFound: 85,
    score: 82,
    status: 'completed' as const,
  },
  {
    id: 2,
    date: '2026-02-20',
    pagesCrawled: 245,
    issuesFound: 91,
    score: 79,
    status: 'completed' as const,
  },
  {
    id: 3,
    date: '2026-02-17',
    pagesCrawled: 240,
    issuesFound: 103,
    score: 75,
    status: 'completed' as const,
  },
  {
    id: 4,
    date: '2026-02-14',
    pagesCrawled: 238,
    issuesFound: 110,
    score: 72,
    status: 'completed' as const,
  },
  {
    id: 5,
    date: '2026-02-11',
    pagesCrawled: 235,
    issuesFound: 125,
    score: 68,
    status: 'completed' as const,
  },
]

interface Issue {
  id: number
  title: string
  category: 'critical' | 'warning' | 'info'
  pages: number
  autoFixable: boolean
  description: string
}

const issues: Issue[] = [
  {
    id: 1,
    title: 'Missing meta descriptions',
    category: 'critical',
    pages: 12,
    autoFixable: true,
    description: '12 pages are missing meta descriptions, which can hurt click-through rates from search results.',
  },
  {
    id: 2,
    title: 'Slow pages > 3s',
    category: 'critical',
    pages: 5,
    autoFixable: false,
    description: '5 pages have load times exceeding 3 seconds. Requires server-side or asset optimization.',
  },
  {
    id: 3,
    title: 'Missing alt text',
    category: 'warning',
    pages: 28,
    autoFixable: true,
    description: '28 pages contain images without alt text, reducing accessibility and image search visibility.',
  },
  {
    id: 4,
    title: 'Broken links',
    category: 'critical',
    pages: 3,
    autoFixable: true,
    description: '3 pages contain links pointing to non-existent URLs (404 responses).',
  },
  {
    id: 5,
    title: 'Missing schema markup',
    category: 'warning',
    pages: 15,
    autoFixable: true,
    description: '15 pages lack structured data markup, missing rich snippet opportunities.',
  },
  {
    id: 6,
    title: 'Duplicate titles',
    category: 'warning',
    pages: 7,
    autoFixable: true,
    description: '7 pages share identical title tags, causing keyword cannibalization.',
  },
  {
    id: 7,
    title: 'Missing H1 tags',
    category: 'info',
    pages: 4,
    autoFixable: true,
    description: '4 pages are missing the primary H1 heading tag.',
  },
  {
    id: 8,
    title: 'Large images',
    category: 'info',
    pages: 11,
    autoFixable: false,
    description: '11 pages contain images larger than 200KB that should be compressed or converted to WebP.',
  },
]

const schemaPages = [
  { url: '/blog/best-pie-recipes', type: 'Article', hasSchema: true },
  { url: '/recipes/apple-pie', type: 'Recipe', hasSchema: true },
  { url: '/about', type: 'Organization', hasSchema: true },
  { url: '/contact', type: 'LocalBusiness', hasSchema: true },
  { url: '/blog/baking-tips', type: 'Article', hasSchema: false },
  { url: '/products/pie-crust-mix', type: 'Product', hasSchema: false },
  { url: '/recipes/cherry-pie', type: 'Recipe', hasSchema: false },
  { url: '/faq', type: 'FAQPage', hasSchema: false },
  { url: '/blog/holiday-pies', type: 'Article', hasSchema: false },
  { url: '/products/rolling-pin', type: 'Product', hasSchema: false },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryConfig(category: Issue['category']) {
  switch (category) {
    case 'critical':
      return {
        label: 'Critical',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        icon: XCircleIcon,
        iconColor: 'text-red-500',
        border: 'border-red-200 dark:border-red-800',
      }
    case 'warning':
      return {
        label: 'Warning',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        icon: ExclamationTriangleIcon,
        iconColor: 'text-yellow-500',
        border: 'border-yellow-200 dark:border-yellow-800',
      }
    case 'info':
      return {
        label: 'Info',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: InformationCircleIcon,
        iconColor: 'text-blue-500',
        border: 'border-blue-200 dark:border-blue-800',
      }
  }
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-500'
  if (score >= 75) return 'text-yellow-500'
  if (score >= 60) return 'text-orange-500'
  return 'text-red-500'
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircleIcon className="h-3.5 w-3.5" />
          Completed
        </span>
      )
    case 'running':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
          Running
        </span>
      )
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <XCircleIcon className="h-3.5 w-3.5" />
          Failed
        </span>
      )
    default:
      return null
  }
}

// ── Circular Progress Component ─────────────────────────────────────────────

function CircularProgress({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={color}
            style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900 dark:text-white">{score}</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function TechnicalSEOPage() {
  const [isRunningAudit, setIsRunningAudit] = useState(false)
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null)
  const [issueFilter, setIssueFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all')
  const [schemaFilter, setSchemaFilter] = useState<'all' | 'has' | 'missing'>('all')

  const handleRunAudit = () => {
    setIsRunningAudit(true)
    toast.success('Audit started! Crawling your site...')
    setTimeout(() => {
      setIsRunningAudit(false)
      toast.success('Audit completed successfully!')
    }, 3000)
  }

  const handleAutoFix = (issue: Issue) => {
    toast.success(`Auto-fixing "${issue.title}" across ${issue.pages} pages...`)
  }

  const handleAddSchema = (url: string, type: string) => {
    toast.success(`Generating ${type} schema markup for ${url}...`)
  }

  const criticalCount = issues.filter((i) => i.category === 'critical').length
  const warningCount = issues.filter((i) => i.category === 'warning').length
  const infoCount = issues.filter((i) => i.category === 'info').length

  const filteredIssues =
    issueFilter === 'all' ? issues : issues.filter((i) => i.category === issueFilter)

  const filteredSchemaPages =
    schemaFilter === 'all'
      ? schemaPages
      : schemaFilter === 'has'
        ? schemaPages.filter((p) => p.hasSchema)
        : schemaPages.filter((p) => !p.hasSchema)

  return (
    <div>
      <PageHeader
        title="Technical SEO"
        description="Monitor site health, crawlability, indexability, and performance"
        action={
          <button
            onClick={handleRunAudit}
            disabled={isRunningAudit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunningAudit ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <PlayIcon className="h-5 w-5" />
            )}
            {isRunningAudit ? 'Running Audit...' : 'Run Audit'}
          </button>
        }
      />

      {/* ── Audit Summary Scores ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Summary</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest audit scores based on 248 pages crawled</p>
        </div>
        <div className="px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
            {auditScores.map((item) => (
              <CircularProgress
                key={item.label}
                score={item.score}
                label={item.label}
                color={item.color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Audits Table ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Audits</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pages Crawled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Issues Found
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(audit.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {audit.pagesCrawled}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {audit.issuesFound}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${getScoreColor(audit.score)}`}>
                      {audit.score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(audit.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => toast.info(`Viewing audit from ${audit.date}`)}
                      className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Issues Breakdown ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Issues Breakdown</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {issues.length} issues found across {issues.reduce((sum, i) => sum + i.pages, 0)} pages
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  <XCircleIcon className="h-3.5 w-3.5" />
                  {criticalCount} Critical
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                  {warningCount} Warnings
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <InformationCircleIcon className="h-3.5 w-3.5" />
                  {infoCount} Info
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {(['all', 'critical', 'warning', 'info'] as const).map((filter) => {
              const isActive = issueFilter === filter
              return (
                <button
                  key={filter}
                  onClick={() => setIssueFilter(filter)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span className="ml-1.5 text-xs">
                    ({filter === 'all'
                      ? issues.length
                      : filter === 'critical'
                        ? criticalCount
                        : filter === 'warning'
                          ? warningCount
                          : infoCount})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Issue List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredIssues.map((issue) => {
            const config = getCategoryConfig(issue.category)
            const isExpanded = expandedIssue === issue.id
            return (
              <div key={issue.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <config.icon className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {issue.title}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {issue.pages} pages affected
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {issue.autoFixable ? (
                      <button
                        onClick={() => handleAutoFix(issue)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                      >
                        <BoltIcon className="h-4 w-4" />
                        Auto-Fix
                      </button>
                    ) : (
                      <button
                        onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View Details
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className={`mt-3 ml-8 p-3 rounded-lg ${config.bg} ${config.border} border`}>
                    <p className={`text-sm ${config.text}`}>{issue.description}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Schema Markup Section ────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Schema Markup</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {schemaPages.filter((p) => p.hasSchema).length} of {schemaPages.length} pages have structured data
              </p>
            </div>
            <div className="flex gap-2">
              {(['all', 'has', 'missing'] as const).map((filter) => {
                const isActive = schemaFilter === filter
                const label =
                  filter === 'all'
                    ? 'All'
                    : filter === 'has'
                      ? 'Has Schema'
                      : 'Missing Schema'
                return (
                  <button
                    key={filter}
                    onClick={() => setSchemaFilter(filter)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Schema Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Schema Coverage</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {Math.round((schemaPages.filter((p) => p.hasSchema).length / schemaPages.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
              style={{
                width: `${(schemaPages.filter((p) => p.hasSchema).length / schemaPages.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Page URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Schema Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSchemaPages.map((page) => (
                <tr key={page.url} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white font-mono">{page.url}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      <CodeBracketIcon className="h-3.5 w-3.5" />
                      {page.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {page.hasSchema ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircleIcon className="h-4 w-4" />
                        Implemented
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-red-500 dark:text-red-400">
                        <XCircleIcon className="h-4 w-4" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {page.hasSchema ? (
                      <button
                        onClick={() => toast.info(`Validating schema for ${page.url}`)}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
                      >
                        Validate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddSchema(page.url, page.type)}
                        className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium"
                      >
                        <BoltIcon className="h-4 w-4" />
                        Generate Schema
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
