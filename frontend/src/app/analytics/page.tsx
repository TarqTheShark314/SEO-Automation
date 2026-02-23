'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GlobeAltIcon,
  LinkIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// ---------- Mock Data ----------

const dateRanges = ['Last 7 days', 'Last 30 days', 'Last 90 days'] as const

const keyMetrics = [
  {
    name: 'Organic Traffic',
    value: '24.5K',
    change: '+12%',
    changeType: 'positive' as const,
    icon: UserGroupIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    name: 'Keywords in Top 10',
    value: '156',
    change: '+23',
    changeType: 'positive' as const,
    icon: GlobeAltIcon,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    name: 'Backlinks',
    value: '1,204',
    change: '+45',
    changeType: 'positive' as const,
    icon: LinkIcon,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    name: 'Domain Authority',
    value: '42',
    change: '+2',
    changeType: 'positive' as const,
    icon: ShieldCheckIcon,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
]

function generateTrafficData() {
  const data = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const baseTraffic = 600 + (29 - i) * 12
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      organic: Math.round(baseTraffic + Math.random() * 200),
      direct: Math.round(baseTraffic * 0.3 + Math.random() * 80),
      referral: Math.round(baseTraffic * 0.15 + Math.random() * 50),
    })
  }
  return data
}

const trafficData = generateTrafficData()

const topKeywords = [
  { keyword: 'seo automation tools', position: 3, prevPosition: 5, volume: 12100, traffic: 2840, trend: 'up' as const },
  { keyword: 'ai seo platform', position: 2, prevPosition: 4, volume: 8100, traffic: 2150, trend: 'up' as const },
  { keyword: 'automated seo audit', position: 5, prevPosition: 3, volume: 6600, traffic: 1420, trend: 'down' as const },
  { keyword: 'local seo automation', position: 1, prevPosition: 2, volume: 5400, traffic: 3200, trend: 'up' as const },
  { keyword: 'technical seo tools', position: 4, prevPosition: 6, volume: 9900, traffic: 1890, trend: 'up' as const },
  { keyword: 'schema markup generator', position: 7, prevPosition: 8, volume: 14800, traffic: 1650, trend: 'up' as const },
  { keyword: 'content optimization ai', position: 6, prevPosition: 9, volume: 7200, traffic: 1320, trend: 'up' as const },
  { keyword: 'backlink analysis tool', position: 8, prevPosition: 7, volume: 11000, traffic: 980, trend: 'down' as const },
  { keyword: 'seo reporting dashboard', position: 9, prevPosition: 12, volume: 4400, traffic: 620, trend: 'up' as const },
  { keyword: 'generative engine optimization', position: 2, prevPosition: 5, volume: 3200, traffic: 1540, trend: 'up' as const },
]

const topPages = [
  { url: '/blog/seo-automation-guide', pageviews: 8420, bounceRate: 32.5, avgTime: '4:12' },
  { url: '/tools/technical-audit', pageviews: 6850, bounceRate: 28.1, avgTime: '5:45' },
  { url: '/blog/ai-seo-2026', pageviews: 5240, bounceRate: 35.8, avgTime: '3:58' },
  { url: '/features/local-seo', pageviews: 4100, bounceRate: 40.2, avgTime: '3:22' },
  { url: '/blog/schema-markup-tips', pageviews: 3890, bounceRate: 29.4, avgTime: '4:35' },
  { url: '/pricing', pageviews: 3650, bounceRate: 45.6, avgTime: '2:15' },
  { url: '/blog/geo-seo-strategy', pageviews: 3200, bounceRate: 31.7, avgTime: '4:48' },
  { url: '/features/content-generation', pageviews: 2980, bounceRate: 38.3, avgTime: '3:10' },
]

const rankingDistribution = [
  { range: '1-3', count: 28, color: '#10B981' },
  { range: '4-10', count: 128, color: '#F97316' },
  { range: '11-20', count: 95, color: '#3B82F6' },
  { range: '21-50', count: 156, color: '#8B5CF6' },
  { range: '50+', count: 210, color: '#6B7280' },
]

function generateSeoScoreHistory() {
  const data = []
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
  const scores = [62, 68, 72, 78, 83, 87]
  for (let i = 0; i < months.length; i++) {
    data.push({
      month: months[i],
      score: scores[i],
    })
  }
  return data
}

const seoScoreHistory = generateSeoScoreHistory()

// ---------- Component ----------

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState<(typeof dateRanges)[number]>('Last 30 days')

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Track your SEO performance and organic growth"
        action={
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {dateRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedRange === range
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {keyMetrics.map((metric) => (
          <div
            key={metric.name}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <span className={`inline-flex items-center text-sm font-medium ${
                metric.changeType === 'positive'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {metric.changeType === 'positive' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {metric.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{metric.name}</p>
          </div>
        ))}
      </div>

      {/* Traffic Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Traffic Trend
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={trafficData}>
            <defs>
              <linearGradient id="organicGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="directGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="referralGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickLine={false}
              interval={4}
            />
            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="organic"
              name="Organic"
              stroke="#F97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#organicGrad)"
            />
            <Area
              type="monotone"
              dataKey="direct"
              name="Direct"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#directGrad)"
            />
            <Area
              type="monotone"
              dataKey="referral"
              name="Referral"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#referralGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Keywords Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Keywords
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {topKeywords.length} keywords tracked
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Keyword
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Search Volume
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Traffic
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topKeywords.map((kw, index) => (
                <tr
                  key={kw.keyword}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {kw.keyword}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        kw.position <= 3
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : kw.position <= 10
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {kw.position}
                      </span>
                      <span className="text-xs text-gray-400">
                        was {kw.prevPosition}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                    {kw.volume.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                    {kw.traffic.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {kw.trend === 'up' ? (
                      <span className="inline-flex items-center text-green-600 dark:text-green-400">
                        <ArrowTrendingUpIcon className="h-5 w-5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-600 dark:text-red-400">
                        <ArrowTrendingDownIcon className="h-5 w-5" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Pages
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pageviews
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Bounce Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg. Time on Page
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topPages.map((page) => (
                <tr
                  key={page.url}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline cursor-pointer">
                        {page.url}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                    {page.pageviews.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-medium ${
                      page.bounceRate <= 35
                        ? 'text-green-600 dark:text-green-400'
                        : page.bounceRate <= 45
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {page.bounceRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                    {page.avgTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ranking Distribution + SEO Score History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ranking Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Ranking Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rankingDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                tickLine={false}
                label={{ value: 'Position', position: 'insideBottom', offset: -5, fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                formatter={(value: number) => [`${value} keywords`, 'Count']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {rankingDistribution.map((entry, index) => (
                  <Bar key={`cell-${index}`} dataKey="count" fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {rankingDistribution.map((item) => (
              <div key={item.range} className="text-center">
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-xs font-medium text-gray-900 dark:text-white">{item.count}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pos {item.range}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Score History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              SEO Score History
            </h3>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              <span>+25 pts in 6 months</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={seoScoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                formatter={(value: number) => [`${value}/100`, 'SEO Score']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#F97316"
                strokeWidth={3}
                dot={{ fill: '#F97316', r: 5, strokeWidth: 2, stroke: '#FFF' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Current Score</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Updated today</p>
            </div>
            <div className="text-3xl font-bold text-orange-500">87</div>
          </div>
        </div>
      </div>
    </div>
  )
}
