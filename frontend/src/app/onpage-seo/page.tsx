'use client'

import { useState } from 'react'
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
  FunnelIcon,
  LinkIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ArrowTopRightOnSquareIcon,
  TagIcon,
  SparklesIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import PageHeader from '@/components/layout/PageHeader'
import { toast } from 'sonner'

// ── Types ────────────────────────────────────────────────────────────────────

type OptimizationStatus = 'pending' | 'approved' | 'deployed' | 'rejected'
type OptimizationType = 'meta_title' | 'meta_description' | 'heading' | 'internal_link'

interface Optimization {
  id: number
  type: OptimizationType
  pageUrl: string
  currentValue: string
  suggestedValue: string
  impactScore: number
  status: OptimizationStatus
  createdAt: string
}

interface LinkOpportunity {
  id: number
  sourcePage: string
  targetPage: string
  anchorText: string
  relevanceScore: number
  context: string
}

interface KeywordAnalysis {
  keyword: string
  count: number
  density: number
  status: 'optimal' | 'low' | 'high'
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const mockOptimizations: Optimization[] = [
  {
    id: 1,
    type: 'meta_title',
    pageUrl: '/blog/best-pie-recipes',
    currentValue: 'Best Pie Recipes - Our Blog',
    suggestedValue: 'Best Pie Recipes for 2026: 15 Easy & Delicious Pies | BakeMorePies',
    impactScore: 92,
    status: 'pending',
    createdAt: '2026-02-23',
  },
  {
    id: 2,
    type: 'meta_description',
    pageUrl: '/recipes/apple-pie',
    currentValue: 'Learn how to make apple pie.',
    suggestedValue: 'Discover our classic apple pie recipe with a flaky butter crust and cinnamon-spiced filling. Step-by-step instructions, tips, and a video tutorial included.',
    impactScore: 87,
    status: 'pending',
    createdAt: '2026-02-23',
  },
  {
    id: 3,
    type: 'heading',
    pageUrl: '/products/pie-crust-mix',
    currentValue: '<h2>Our Products</h2>\n<h2>About Pie Crust</h2>\n<h4>Features</h4>',
    suggestedValue: '<h1>Premium Pie Crust Mix</h1>\n<h2>Why Our Crust Mix</h2>\n<h3>Key Features</h3>',
    impactScore: 78,
    status: 'approved',
    createdAt: '2026-02-22',
  },
  {
    id: 4,
    type: 'internal_link',
    pageUrl: '/blog/baking-tips',
    currentValue: 'No internal links to product pages found in this content.',
    suggestedValue: 'Add link to "/products/pie-crust-mix" with anchor text "premium pie crust mix" in paragraph 3. Add link to "/recipes/apple-pie" with anchor text "classic apple pie recipe" in paragraph 5.',
    impactScore: 71,
    status: 'pending',
    createdAt: '2026-02-22',
  },
  {
    id: 5,
    type: 'meta_title',
    pageUrl: '/about',
    currentValue: 'About Us',
    suggestedValue: 'About BakeMorePies - Artisan Baking Supplies & Recipes Since 2018',
    impactScore: 85,
    status: 'deployed',
    createdAt: '2026-02-21',
  },
  {
    id: 6,
    type: 'meta_description',
    pageUrl: '/blog/holiday-pies',
    currentValue: '',
    suggestedValue: 'Explore our top holiday pie recipes for Thanksgiving, Christmas, and every celebration. From pumpkin to pecan, find your next showstopper dessert.',
    impactScore: 94,
    status: 'pending',
    createdAt: '2026-02-21',
  },
  {
    id: 7,
    type: 'heading',
    pageUrl: '/faq',
    currentValue: '<h2>FAQ</h2>\n<p><b>Question 1</b></p>\n<p><b>Question 2</b></p>',
    suggestedValue: '<h1>Frequently Asked Questions</h1>\n<h2>Ordering & Shipping</h2>\n<h3>How long does shipping take?</h3>\n<h2>Products & Recipes</h2>\n<h3>Are your products gluten-free?</h3>',
    impactScore: 68,
    status: 'rejected',
    createdAt: '2026-02-20',
  },
  {
    id: 8,
    type: 'meta_title',
    pageUrl: '/recipes/cherry-pie',
    currentValue: 'Cherry Pie',
    suggestedValue: 'Cherry Pie Recipe: Fresh or Frozen Cherries | Easy Lattice Crust Guide',
    impactScore: 88,
    status: 'approved',
    createdAt: '2026-02-20',
  },
  {
    id: 9,
    type: 'internal_link',
    pageUrl: '/recipes/apple-pie',
    currentValue: 'Only 1 internal link found pointing to this high-value page.',
    suggestedValue: 'Add link from "/blog/best-pie-recipes" with anchor text "homemade apple pie". Add link from "/blog/holiday-pies" with anchor text "classic apple pie for the holidays".',
    impactScore: 75,
    status: 'pending',
    createdAt: '2026-02-19',
  },
  {
    id: 10,
    type: 'meta_description',
    pageUrl: '/contact',
    currentValue: 'Contact us here.',
    suggestedValue: 'Get in touch with BakeMorePies for wholesale orders, recipe inquiries, or customer support. We respond within 24 hours.',
    impactScore: 62,
    status: 'deployed',
    createdAt: '2026-02-19',
  },
]

const mockLinkOpportunities: LinkOpportunity[] = [
  {
    id: 1,
    sourcePage: '/blog/best-pie-recipes',
    targetPage: '/recipes/apple-pie',
    anchorText: 'homemade apple pie recipe',
    relevanceScore: 95,
    context: '...one of the best pies you can make at home is a classic [homemade apple pie recipe] with a flaky crust...',
  },
  {
    id: 2,
    sourcePage: '/blog/baking-tips',
    targetPage: '/products/pie-crust-mix',
    anchorText: 'premium pie crust mix',
    relevanceScore: 88,
    context: '...for beginners, using a [premium pie crust mix] can save time while still delivering great results...',
  },
  {
    id: 3,
    sourcePage: '/blog/holiday-pies',
    targetPage: '/recipes/cherry-pie',
    anchorText: 'cherry pie with lattice top',
    relevanceScore: 82,
    context: '...a festive [cherry pie with lattice top] makes an impressive centerpiece for any holiday table...',
  },
  {
    id: 4,
    sourcePage: '/recipes/apple-pie',
    targetPage: '/blog/baking-tips',
    anchorText: 'essential baking tips',
    relevanceScore: 76,
    context: '...before you start, check out our [essential baking tips] to ensure a perfect result every time...',
  },
  {
    id: 5,
    sourcePage: '/about',
    targetPage: '/blog/best-pie-recipes',
    anchorText: 'our best pie recipes',
    relevanceScore: 71,
    context: '...we share our passion for baking through [our best pie recipes] and community events...',
  },
]

const mockKeywordAnalysis: KeywordAnalysis[] = [
  { keyword: 'pie recipes', count: 14, density: 2.1, status: 'optimal' },
  { keyword: 'baking', count: 18, density: 2.7, status: 'optimal' },
  { keyword: 'apple pie', count: 8, density: 1.2, status: 'optimal' },
  { keyword: 'homemade', count: 3, density: 0.4, status: 'low' },
  { keyword: 'pie crust', count: 22, density: 3.3, status: 'high' },
  { keyword: 'dessert', count: 2, density: 0.3, status: 'low' },
  { keyword: 'recipe', count: 16, density: 2.4, status: 'optimal' },
  { keyword: 'cherry pie', count: 6, density: 0.9, status: 'optimal' },
  { keyword: 'flaky crust', count: 1, density: 0.15, status: 'low' },
  { keyword: 'bakemorepies', count: 25, density: 3.8, status: 'high' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTypeConfig(type: OptimizationType) {
  switch (type) {
    case 'meta_title':
      return {
        label: 'Meta Title',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: TagIcon,
      }
    case 'meta_description':
      return {
        label: 'Meta Description',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        icon: DocumentTextIcon,
      }
    case 'heading':
      return {
        label: 'Heading Structure',
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: PencilSquareIcon,
      }
    case 'internal_link':
      return {
        label: 'Internal Link',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-400',
        icon: LinkIcon,
      }
  }
}

function getStatusConfig(status: OptimizationStatus) {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        icon: ClockIcon,
      }
    case 'approved':
      return {
        label: 'Approved',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: CheckCircleIcon,
      }
    case 'deployed':
      return {
        label: 'Deployed',
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: RocketLaunchIcon,
      }
    case 'rejected':
      return {
        label: 'Rejected',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        icon: XCircleIcon,
      }
  }
}

function getImpactColor(score: number): string {
  if (score >= 85) return 'text-green-600 dark:text-green-400'
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-orange-600 dark:text-orange-400'
}

function getImpactBg(score: number): string {
  if (score >= 85) return 'bg-green-500'
  if (score >= 70) return 'bg-yellow-500'
  return 'bg-orange-500'
}

function getDensityColor(status: KeywordAnalysis['status']): string {
  switch (status) {
    case 'optimal':
      return 'text-green-600 dark:text-green-400'
    case 'low':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'high':
      return 'text-red-600 dark:text-red-400'
  }
}

function getDensityBadge(status: KeywordAnalysis['status']) {
  switch (status) {
    case 'optimal':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Optimal
        </span>
      )
    case 'low':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          Low
        </span>
      )
    case 'high':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Over-optimized
        </span>
      )
  }
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function OnPageSEOPage() {
  const [optimizations, setOptimizations] = useState<Optimization[]>(mockOptimizations)
  const [activeFilter, setActiveFilter] = useState<'all' | OptimizationStatus>('all')
  const [expandedOptimization, setExpandedOptimization] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedPage, setAnalyzedPage] = useState('/blog/best-pie-recipes')

  const handleAnalyzePages = () => {
    setIsAnalyzing(true)
    toast.success('Analyzing pages for optimization opportunities...')
    setTimeout(() => {
      setIsAnalyzing(false)
      toast.success('Analysis complete! Found 3 new optimization opportunities.')
    }, 3000)
  }

  const handleApprove = (id: number) => {
    setOptimizations((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, status: 'approved' as const } : opt))
    )
    toast.success('Optimization approved!')
  }

  const handleReject = (id: number) => {
    setOptimizations((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, status: 'rejected' as const } : opt))
    )
    toast.info('Optimization rejected.')
  }

  const handleDeploy = (id: number) => {
    setOptimizations((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, status: 'deployed' as const } : opt))
    )
    toast.success('Optimization deployed successfully!')
  }

  const handleAddLink = (opportunity: LinkOpportunity) => {
    toast.success(`Adding internal link from ${opportunity.sourcePage} to ${opportunity.targetPage}`)
  }

  const filteredOptimizations =
    activeFilter === 'all'
      ? optimizations
      : optimizations.filter((opt) => opt.status === activeFilter)

  const filterCounts = {
    all: optimizations.length,
    pending: optimizations.filter((o) => o.status === 'pending').length,
    approved: optimizations.filter((o) => o.status === 'approved').length,
    deployed: optimizations.filter((o) => o.status === 'deployed').length,
    rejected: optimizations.filter((o) => o.status === 'rejected').length,
  }

  return (
    <div>
      <PageHeader
        title="On-Page SEO"
        description="Optimize meta tags, headings, internal links, and keyword density"
        action={
          <button
            onClick={handleAnalyzePages}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <MagnifyingGlassIcon className="h-5 w-5" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Pages'}
          </button>
        }
      />

      {/* ── Optimization Queue ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Optimization Queue</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filterCounts.pending} pending optimizations awaiting review
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {(
              ['all', 'pending', 'approved', 'deployed', 'rejected'] as const
            ).map((filter) => {
              const isActive = activeFilter === filter
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">
                    ({filterCounts[filter]})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Optimization List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredOptimizations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No optimizations found for this filter.
              </p>
            </div>
          ) : (
            filteredOptimizations.map((opt) => {
              const typeConfig = getTypeConfig(opt.type)
              const statusConfig = getStatusConfig(opt.status)
              const isExpanded = expandedOptimization === opt.id

              return (
                <div key={opt.id} className="px-6 py-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                          <typeConfig.icon className="h-3.5 w-3.5" />
                          {typeConfig.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          <statusConfig.icon className="h-3.5 w-3.5" />
                          {statusConfig.label}
                        </span>
                        <span className={`text-xs font-semibold ${getImpactColor(opt.impactScore)}`}>
                          Impact: {opt.impactScore}/100
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-mono truncate">
                          {opt.pageUrl}
                        </span>
                      </div>

                      {/* Impact Bar */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${getImpactBg(opt.impactScore)}`}
                            style={{ width: `${opt.impactScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {opt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(opt.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            title="Approve"
                          >
                            <HandThumbUpIcon className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(opt.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="Reject"
                          >
                            <HandThumbDownIcon className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {opt.status === 'approved' && (
                        <button
                          onClick={() => handleDeploy(opt.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          title="Deploy"
                        >
                          <RocketLaunchIcon className="h-4 w-4" />
                          Deploy
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedOptimization(isExpanded ? null : opt.id)}
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

                  {/* Diff View (expanded) */}
                  {isExpanded && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircleIcon className="h-4 w-4 text-red-500" />
                          <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                            Current
                          </span>
                        </div>
                        <pre className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
                          {opt.currentValue || '(empty)'}
                        </pre>
                      </div>
                      <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                            Suggested
                          </span>
                        </div>
                        <pre className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
                          {opt.suggestedValue}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Internal Linking Opportunities ─────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Internal Linking Opportunities</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {mockLinkOpportunities.length} link opportunities discovered to improve site structure
              </p>
            </div>
            <LinkIcon className="h-6 w-6 text-orange-500" />
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mockLinkOpportunities.map((opp) => (
            <div key={opp.id} className="px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Source -> Target */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {opp.sourcePage}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <span className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {opp.targetPage}
                    </span>
                  </div>

                  {/* Anchor Text */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Anchor text:</span>
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      &quot;{opp.anchorText}&quot;
                    </span>
                  </div>

                  {/* Context Preview */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2 mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Context:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      {opp.context}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Relevance</span>
                    <p className={`text-lg font-bold ${getImpactColor(opp.relevanceScore)}`}>
                      {opp.relevanceScore}%
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddLink(opp)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Add Link
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Keyword Density Checker ────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Keyword Density Checker</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Analyzing keyword distribution for optimal on-page SEO
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Page:</span>
              <select
                value={analyzedPage}
                onChange={(e) => setAnalyzedPage(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="/blog/best-pie-recipes">/blog/best-pie-recipes</option>
                <option value="/recipes/apple-pie">/recipes/apple-pie</option>
                <option value="/products/pie-crust-mix">/products/pie-crust-mix</option>
                <option value="/about">/about</option>
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">Optimal (1-3%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400">Low (&lt;1%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-gray-600 dark:text-gray-400">Over-optimized (&gt;3%)</span>
            </span>
          </div>
        </div>

        {/* Keyword Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Keyword
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Density
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Distribution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockKeywordAnalysis.map((kw) => {
                const maxDensity = 4.0
                const barWidth = Math.min((kw.density / maxDensity) * 100, 100)
                const barColor =
                  kw.status === 'optimal'
                    ? 'bg-green-500'
                    : kw.status === 'low'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'

                return (
                  <tr
                    key={kw.keyword}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {kw.keyword}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {kw.count}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${getDensityColor(kw.status)}`}>
                        {kw.density}%
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${barColor} transition-all duration-500`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {getDensityBadge(kw.status)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      {kw.status !== 'optimal' && (
                        <button
                          onClick={() =>
                            toast.success(
                              kw.status === 'low'
                                ? `Generating suggestions to increase "${kw.keyword}" usage...`
                                : `Generating suggestions to reduce "${kw.keyword}" usage...`
                            )
                          }
                          className="inline-flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium"
                        >
                          <SparklesIcon className="h-4 w-4" />
                          {kw.status === 'low' ? 'Suggest More' : 'Reduce'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total words analyzed: <span className="font-semibold text-gray-900 dark:text-white">663</span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Unique keywords: <span className="font-semibold text-gray-900 dark:text-white">{mockKeywordAnalysis.length}</span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Optimal: <span className="font-semibold text-green-600 dark:text-green-400">{mockKeywordAnalysis.filter((k) => k.status === 'optimal').length}</span>
              </span>
            </div>
            <button
              onClick={() => toast.success('Running full keyword analysis with AI suggestions...')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <SparklesIcon className="h-4 w-4" />
              AI Optimize Keywords
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
