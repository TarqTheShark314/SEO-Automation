'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LinkIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts'

// ---------- Mock Data ----------

const providerBreakdown = [
  {
    name: 'ChatGPT',
    score: 78,
    trend: 'up' as const,
    trendValue: '+5%',
    color: '#10B981',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-400',
    iconBg: 'bg-green-500',
  },
  {
    name: 'Claude',
    score: 75,
    trend: 'up' as const,
    trendValue: '+3%',
    color: '#8B5CF6',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-400',
    iconBg: 'bg-purple-500',
  },
  {
    name: 'Gemini',
    score: 68,
    trend: 'down' as const,
    trendValue: '-2%',
    color: '#3B82F6',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-400',
    iconBg: 'bg-blue-500',
  },
  {
    name: 'Perplexity',
    score: 65,
    trend: 'up' as const,
    trendValue: '+8%',
    color: '#F59E0B',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-400',
    iconBg: 'bg-amber-500',
  },
]

function generateTrendData() {
  const data = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ChatGPT: Math.round(60 + Math.random() * 20 + (29 - i) * 0.3),
      Claude: Math.round(58 + Math.random() * 18 + (29 - i) * 0.25),
      Gemini: Math.round(55 + Math.random() * 15 + (29 - i) * 0.1),
      Perplexity: Math.round(50 + Math.random() * 18 + (29 - i) * 0.35),
    })
  }
  return data
}

const trendData = generateTrendData()

const aiQueries = [
  {
    id: 1,
    query: 'Best SEO automation tools for small businesses',
    provider: 'ChatGPT',
    brandMentioned: true,
    citation: true,
    sentiment: 'positive' as const,
    date: '2026-02-22',
  },
  {
    id: 2,
    query: 'How to improve website ranking in 2026',
    provider: 'Claude',
    brandMentioned: true,
    citation: false,
    sentiment: 'positive' as const,
    date: '2026-02-21',
  },
  {
    id: 3,
    query: 'AI-powered SEO platforms comparison',
    provider: 'Gemini',
    brandMentioned: false,
    citation: false,
    sentiment: 'neutral' as const,
    date: '2026-02-21',
  },
  {
    id: 4,
    query: 'What is generative engine optimization',
    provider: 'Perplexity',
    brandMentioned: true,
    citation: true,
    sentiment: 'positive' as const,
    date: '2026-02-20',
  },
  {
    id: 5,
    query: 'Top technical SEO audit tools',
    provider: 'ChatGPT',
    brandMentioned: true,
    citation: true,
    sentiment: 'positive' as const,
    date: '2026-02-19',
  },
  {
    id: 6,
    query: 'Local SEO automation software reviews',
    provider: 'Claude',
    brandMentioned: false,
    citation: false,
    sentiment: 'negative' as const,
    date: '2026-02-18',
  },
  {
    id: 7,
    query: 'Schema markup generators for ecommerce',
    provider: 'Gemini',
    brandMentioned: true,
    citation: true,
    sentiment: 'neutral' as const,
    date: '2026-02-17',
  },
  {
    id: 8,
    query: 'How to optimize for AI search engines',
    provider: 'Perplexity',
    brandMentioned: true,
    citation: true,
    sentiment: 'positive' as const,
    date: '2026-02-16',
  },
  {
    id: 9,
    query: 'Best content generation tools for SEO',
    provider: 'ChatGPT',
    brandMentioned: true,
    citation: false,
    sentiment: 'positive' as const,
    date: '2026-02-15',
  },
  {
    id: 10,
    query: 'Automated backlink analysis platforms',
    provider: 'Claude',
    brandMentioned: false,
    citation: false,
    sentiment: 'neutral' as const,
    date: '2026-02-14',
  },
]

const citationStats = {
  total: 156,
  types: [
    { name: 'Direct Link', count: 45, percentage: 29, color: '#F97316' },
    { name: 'Reference', count: 38, percentage: 24, color: '#8B5CF6' },
    { name: 'Mention', count: 32, percentage: 21, color: '#3B82F6' },
    { name: 'Quote', count: 24, percentage: 15, color: '#10B981' },
    { name: 'Recommendation', count: 17, percentage: 11, color: '#F59E0B' },
  ],
}

const eeatScores = [
  { subject: 'Experience', score: 72, fullMark: 100 },
  { subject: 'Expertise', score: 80, fullMark: 100 },
  { subject: 'Authoritativeness', score: 65, fullMark: 100 },
  { subject: 'Trustworthiness', score: 85, fullMark: 100 },
]

const eeatRecommendations = [
  {
    area: 'Authoritativeness',
    score: 65,
    recommendation: 'Increase industry backlinks and get featured in authoritative publications. Consider guest posting on top SEO blogs.',
  },
  {
    area: 'Experience',
    score: 72,
    recommendation: 'Add more case studies and real-world examples to your content. Include first-hand experience signals in blog posts.',
  },
  {
    area: 'Expertise',
    score: 80,
    recommendation: 'Continue publishing in-depth technical content. Add author credentials and bios to all articles.',
  },
  {
    area: 'Trustworthiness',
    score: 85,
    recommendation: 'Maintain current practices. Consider adding more customer testimonials and third-party reviews.',
  },
]

const competitorData = [
  { provider: 'ChatGPT', yourBrand: 78, competitor1: 72, competitor2: 65, competitor3: 58 },
  { provider: 'Claude', yourBrand: 75, competitor1: 68, competitor2: 70, competitor3: 55 },
  { provider: 'Gemini', yourBrand: 68, competitor1: 74, competitor2: 60, competitor3: 62 },
  { provider: 'Perplexity', yourBrand: 65, competitor1: 60, competitor2: 55, competitor3: 48 },
]

// ---------- Component ----------

export default function GeoSeoPage() {
  const [expandedQuery, setExpandedQuery] = useState<number | null>(null)

  const overallScore = 72
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (overallScore / 100) * circumference

  return (
    <div>
      <PageHeader
        title="GEO/LLM SEO"
        description="Generative Engine Optimization - Track your visibility across AI search engines"
        action={
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
            Run GEO Scan
          </button>
        }
      />

      {/* Overall Score + Provider Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Overall GEO Visibility Score */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Overall GEO Visibility Score
          </h3>
          <div className="relative w-44 h-44">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#gaugeGradient)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#FB923C" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{overallScore}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-green-600 dark:text-green-400">
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            <span>+8 points this month</span>
          </div>
        </div>

        {/* Provider Breakdown Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {providerBreakdown.map((provider) => (
            <div
              key={provider.name}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${provider.iconBg} rounded-lg flex items-center justify-center`}>
                    <SparklesIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {provider.name}
                  </span>
                </div>
                <div className={`flex items-center text-xs font-medium ${
                  provider.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {provider.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-3.5 w-3.5 mr-0.5" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3.5 w-3.5 mr-0.5" />
                  )}
                  {provider.trendValue}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {provider.score}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${provider.score}%`, backgroundColor: provider.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visibility Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Visibility Trend (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickLine={false}
              interval={4}
            />
            <YAxis
              domain={[40, 100]}
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
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ChatGPT"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Claude"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Gemini"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Perplexity"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Query Tracking Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Query Tracking
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {aiQueries.length} queries tracked
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Query
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Brand Mentioned
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Citation
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {aiQueries.map((query) => (
                <tr
                  key={query.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedQuery(expandedQuery === query.id ? null : query.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-900 dark:text-white">{query.query}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      query.provider === 'ChatGPT'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : query.provider === 'Claude'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        : query.provider === 'Gemini'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {query.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      query.brandMentioned
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {query.brandMentioned ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      query.citation
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {query.citation ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      query.sentiment === 'positive'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : query.sentiment === 'negative'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {query.sentiment.charAt(0).toUpperCase() + query.sentiment.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {query.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citation Analysis + E-E-A-T Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Citation Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Citation Analysis
            </h3>
            <div className="flex items-center text-sm">
              <LinkIcon className="h-4 w-4 text-orange-500 mr-1" />
              <span className="font-semibold text-gray-900 dark:text-white">{citationStats.total}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">total citations</span>
            </div>
          </div>
          <div className="space-y-4">
            {citationStats.types.map((type) => (
              <div key={type.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {type.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {type.count} ({type.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${type.percentage}%`, backgroundColor: type.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-orange-500">45</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Direct Links</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">62</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">References</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">49</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Mentions</p>
              </div>
            </div>
          </div>
        </div>

        {/* E-E-A-T Score */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            E-E-A-T Score
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={eeatScores}>
              <PolarGrid stroke="#374151" opacity={0.3} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
              />
              <Radar
                name="E-E-A-T"
                dataKey="score"
                stroke="#F97316"
                fill="#F97316"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {eeatScores.map((item) => (
              <div
                key={item.subject}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.subject}</span>
                <span className={`text-sm font-bold ${
                  item.score >= 80
                    ? 'text-green-600 dark:text-green-400'
                    : item.score >= 70
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {item.score}/100
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* E-E-A-T Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center mb-6">
          <LightBulbIcon className="h-5 w-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            E-E-A-T Improvement Recommendations
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eeatRecommendations.map((rec) => (
            <div
              key={rec.area}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {rec.area}
                </h4>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  rec.score >= 80
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : rec.score >= 70
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {rec.score}/100
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{rec.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Competitor Comparison
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={competitorData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis
              dataKey="provider"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
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
            />
            <Legend />
            <Bar dataKey="yourBrand" name="Your Brand" fill="#F97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="competitor1" name="SEMrush" fill="#6366F1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="competitor2" name="Ahrefs" fill="#EC4899" radius={[4, 4, 0, 0]} />
            <Bar dataKey="competitor3" name="Moz" fill="#14B8A6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Your Brand</span>
              <p className="text-lg font-bold text-orange-500 mt-1">72%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">avg. visibility</p>
            </div>
            <div className="text-center">
              <div className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-1"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">SEMrush</span>
              <p className="text-lg font-bold text-indigo-500 mt-1">69%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">avg. visibility</p>
            </div>
            <div className="text-center">
              <div className="inline-block w-3 h-3 rounded-full bg-pink-500 mr-1"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Ahrefs</span>
              <p className="text-lg font-bold text-pink-500 mt-1">63%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">avg. visibility</p>
            </div>
            <div className="text-center">
              <div className="inline-block w-3 h-3 rounded-full bg-teal-500 mr-1"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Moz</span>
              <p className="text-lg font-bold text-teal-500 mt-1">56%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">avg. visibility</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
