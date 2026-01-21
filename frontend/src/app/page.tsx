'use client'

import { useState } from 'react'
import Link from 'next/link'
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
} from '@heroicons/react/24/outline'

// Mock data for demonstration
const stats = [
  {
    name: 'Overall SEO Score',
    value: '87',
    change: '+5',
    changeType: 'positive',
    icon: ChartBarIcon,
  },
  {
    name: 'Organic Traffic',
    value: '24.5K',
    change: '+12%',
    changeType: 'positive',
    icon: ArrowTrendingUpIcon,
  },
  {
    name: 'Keywords in Top 10',
    value: '156',
    change: '+23',
    changeType: 'positive',
    icon: GlobeAltIcon,
  },
  {
    name: 'GEO Visibility Score',
    value: '72',
    change: '+8',
    changeType: 'positive',
    icon: SparklesIcon,
  },
]

const recentIssues = [
  {
    id: 1,
    title: 'Missing meta descriptions',
    severity: 'high',
    pages: 12,
    autoFixable: true,
  },
  {
    id: 2,
    title: 'Slow page load time',
    severity: 'medium',
    pages: 5,
    autoFixable: false,
  },
  {
    id: 3,
    title: 'Missing alt text on images',
    severity: 'medium',
    pages: 28,
    autoFixable: true,
  },
  {
    id: 4,
    title: 'Broken internal links',
    severity: 'high',
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
    icon: Cog6ToothIcon,
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
  const [selectedSite, setSelectedSite] = useState('bakemorepies.com')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-2xl">🥧</span>
                <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  PieBot SEO
                </h1>
              </div>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="ml-6 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="bakemorepies.com">bakemorepies.com</option>
                <option value="example.com">example.com</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                Run Full Audit
              </button>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Modules */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Access Modules */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                SEO Modules
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {modules.map((module) => (
                  <Link
                    key={module.name}
                    href={module.href}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center mb-3`}
                    >
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {module.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {module.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Issues */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Issues
                  </h2>
                  <button className="text-sm text-orange-500 hover:text-orange-600">
                    View All
                  </button>
                </div>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentIssues.map((issue) => (
                  <li key={issue.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {issue.severity === 'high' ? (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
                        ) : (
                          <ClockIcon className="h-5 w-5 text-yellow-500 mr-3" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {issue.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {issue.pages} pages affected
                          </p>
                        </div>
                      </div>
                      {issue.autoFixable && (
                        <button className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200">
                          Auto-Fix
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Pending Optimizations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pending Optimizations
                </h2>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingOptimizations.map((opt) => (
                  <li key={opt.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {opt.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {opt.type} • {opt.impact} Impact
                        </p>
                      </div>
                      <button className="text-orange-500 hover:text-orange-600">
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                  Deploy All ({pendingOptimizations.length})
                </button>
              </div>
            </div>

            {/* GEO Visibility */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow p-6 text-white">
              <div className="flex items-center mb-4">
                <SparklesIcon className="h-8 w-8" />
                <h2 className="ml-3 text-lg font-semibold">AI Visibility</h2>
              </div>
              <p className="text-3xl font-bold mb-2">72%</p>
              <p className="text-sm opacity-90 mb-4">
                Your brand appears in 72% of relevant AI queries
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ChatGPT</span>
                  <span>78%</span>
                </div>
                <div className="flex justify-between">
                  <span>Claude</span>
                  <span>75%</span>
                </div>
                <div className="flex justify-between">
                  <span>Gemini</span>
                  <span>68%</span>
                </div>
                <div className="flex justify-between">
                  <span>Perplexity</span>
                  <span>65%</span>
                </div>
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-white/20 rounded-md hover:bg-white/30 transition-colors">
                View GEO Report
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            PieBot SEO by{' '}
            <a href="https://bakemorepies.com" className="text-orange-500 hover:text-orange-600">
              BakeMorePies.com
            </a>{' '}
            • Powered by Claude AI
          </p>
        </div>
      </footer>
    </div>
  )
}
