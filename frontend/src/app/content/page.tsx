'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import {
  SparklesIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'

// ---------- Mock Data ----------

const mockContent = [
  {
    id: 1,
    title: 'The Ultimate Guide to Sourdough Bread Baking at Home',
    type: 'blog_post',
    topic: 'Sourdough Bread Baking',
    focusKeyword: 'sourdough bread recipe',
    secondaryKeywords: ['bread baking tips', 'sourdough starter', 'homemade bread'],
    wordCount: 2450,
    geoScore: 82,
    eeatScore: 88,
    tone: 'conversational',
    status: 'published' as const,
    createdAt: '2026-02-20',
    body: `# The Ultimate Guide to Sourdough Bread Baking at Home

Sourdough bread baking has experienced a remarkable resurgence in popularity. Whether you are a complete beginner or a seasoned baker looking to refine your technique, this comprehensive guide covers everything you need to know.

## Why Sourdough?

Sourdough bread offers several advantages over conventional bread:

- **Better digestibility** thanks to the long fermentation process
- **Complex flavor profiles** that develop over time
- **Longer shelf life** without artificial preservatives
- **Lower glycemic index** compared to commercial bread

## Getting Started with Your Starter

A sourdough starter is a live culture of wild yeast and beneficial bacteria. To create one from scratch, combine equal parts flour and water in a clean jar and feed it daily for 7-10 days until it becomes active and bubbly.

### Feeding Schedule

Maintain your starter by discarding half and feeding with fresh flour and water every 24 hours at room temperature, or weekly if stored in the refrigerator.

## The Basic Sourdough Recipe

**Ingredients:**
- 500g bread flour
- 350g water (70% hydration)
- 100g active starter
- 10g salt

**Instructions:**
1. Mix flour and water, autolyse for 30 minutes
2. Add starter and salt, mix thoroughly
3. Perform stretch and folds every 30 minutes for 2 hours
4. Bulk ferment for 4-6 hours at room temperature
5. Shape and place in a banneton
6. Cold retard in refrigerator for 12-18 hours
7. Bake in a Dutch oven at 500F for 20 minutes covered, then 25 minutes uncovered

## Tips for Success

Practice patience. Sourdough is not about rushing the process - it is about understanding fermentation and working with your environment.`,
  },
  {
    id: 2,
    title: 'Professional Pie Crust Techniques for Perfect Results Every Time',
    type: 'how_to_guide',
    topic: 'Pie Crust Techniques',
    focusKeyword: 'perfect pie crust',
    secondaryKeywords: ['flaky pie crust', 'butter crust recipe', 'pie baking'],
    wordCount: 1850,
    geoScore: 78,
    eeatScore: 91,
    tone: 'professional',
    status: 'published' as const,
    createdAt: '2026-02-18',
    body: `# Professional Pie Crust Techniques for Perfect Results Every Time

Mastering the art of pie crust is the foundation of exceptional pastry. This guide walks you through professional techniques that guarantee a flaky, golden crust.

## The Science Behind Flaky Crusts

The secret lies in keeping your fat cold and minimizing gluten development. Cold butter creates steam pockets during baking, resulting in distinct flaky layers.

## Key Techniques

1. **Freeze your butter** - Cut into small cubes and freeze for 15 minutes before use
2. **Use ice water** - Add water one tablespoon at a time
3. **Do not overwork the dough** - Stop mixing when you still see butter pieces
4. **Rest the dough** - Refrigerate for at least one hour before rolling

## Common Mistakes to Avoid

- Using warm ingredients
- Adding too much water
- Rolling the dough too thin
- Skipping the chill time`,
  },
  {
    id: 3,
    title: 'Artisan Bakery Equipment: A Complete Buying Guide for 2026',
    type: 'product_description',
    topic: 'Bakery Equipment',
    focusKeyword: 'bakery equipment guide',
    secondaryKeywords: ['commercial ovens', 'baking tools', 'bakery supplies'],
    wordCount: 3200,
    geoScore: 71,
    eeatScore: 75,
    tone: 'professional',
    status: 'draft' as const,
    createdAt: '2026-02-22',
    body: `# Artisan Bakery Equipment: A Complete Buying Guide for 2026

Starting or upgrading an artisan bakery requires careful equipment selection. This guide reviews the essential equipment every bakery needs.

## Ovens

The oven is the heart of any bakery. Consider deck ovens for artisan bread, convection ovens for pastries, and combination ovens for versatility.

## Mixers

A quality stand mixer or spiral mixer is essential. For small bakeries, a 20-quart stand mixer works well. For production bakeries, invest in a spiral mixer with at least 50-pound capacity.

## Proofing Equipment

Controlled proofing environments ensure consistent results. Options range from simple proofing boxes to full-size retarder-proofer cabinets.`,
  },
  {
    id: 4,
    title: 'Why Local Bakeries Are Thriving in the Age of AI and Automation',
    type: 'blog_post',
    topic: 'Local Bakery Business',
    focusKeyword: 'local bakery success',
    secondaryKeywords: ['bakery business tips', 'artisan bread market', 'small bakery'],
    wordCount: 1600,
    geoScore: 85,
    eeatScore: 80,
    tone: 'casual',
    status: 'published' as const,
    createdAt: '2026-02-15',
    body: `# Why Local Bakeries Are Thriving in the Age of AI and Automation

In an era dominated by technology and automation, local bakeries are experiencing unprecedented growth. Here is why the human touch still matters.

## The Authenticity Factor

Consumers increasingly crave authentic, locally-made products. A neighborhood bakery offers something no algorithm can replicate: genuine human connection and craftsmanship.

## Community Hubs

Local bakeries serve as gathering places, fostering community connections that go beyond simple transactions.

## Quality Over Convenience

While mass-produced bread is cheap and convenient, the quality of artisan baked goods speaks for itself.`,
  },
  {
    id: 5,
    title: 'Landing Page: Custom Wedding Cake Design Services',
    type: 'landing_page',
    topic: 'Wedding Cake Services',
    focusKeyword: 'custom wedding cakes',
    secondaryKeywords: ['wedding cake design', 'luxury wedding cakes', 'cake consultation'],
    wordCount: 1200,
    geoScore: 69,
    eeatScore: 83,
    tone: 'professional',
    status: 'scheduled' as const,
    createdAt: '2026-02-23',
    body: `# Custom Wedding Cake Design Services

Create unforgettable memories with a bespoke wedding cake crafted just for you. Our award-winning pastry team brings your vision to life with meticulous artistry and exceptional flavors.

## Our Process

1. **Consultation** - Meet with our cake designer to discuss your vision
2. **Tasting** - Sample our signature flavors and fillings
3. **Design** - Review sketches and approve your custom design
4. **Creation** - Our artisans handcraft your cake with precision
5. **Delivery** - Safe delivery and professional setup at your venue

## Why Choose Us

- Over 500 weddings served
- Premium, locally-sourced ingredients
- Award-winning designs
- Complimentary tasting sessions`,
  },
  {
    id: 6,
    title: 'How to Start a Home Baking Business: Step-by-Step Guide',
    type: 'how_to_guide',
    topic: 'Home Baking Business',
    focusKeyword: 'start baking business',
    secondaryKeywords: ['cottage food laws', 'home bakery', 'baking business plan'],
    wordCount: 2800,
    geoScore: 74,
    eeatScore: 86,
    tone: 'conversational',
    status: 'published' as const,
    createdAt: '2026-02-10',
    body: `# How to Start a Home Baking Business: Step-by-Step Guide

Turning your passion for baking into a profitable business is more achievable than ever. This guide walks you through every step of launching your home baking business.

## Step 1: Research Your Local Laws

Cottage food laws vary by state and municipality. Research your local regulations regarding home-based food businesses, required permits, and revenue limits.

## Step 2: Define Your Niche

Specialize in a product category that sets you apart - whether that is artisan sourdough, decorated cookies, or specialty cakes.

## Step 3: Create a Business Plan

Outline your target market, pricing strategy, marketing plan, and financial projections.

## Step 4: Set Up Your Kitchen

Ensure your kitchen meets local health and safety requirements. Invest in quality equipment that will grow with your business.

## Step 5: Build Your Brand

Create a compelling brand identity, including a memorable name, logo, and social media presence.`,
  },
]

const contentTypeLabels: Record<string, string> = {
  blog_post: 'Blog Post',
  landing_page: 'Landing Page',
  product_description: 'Product Description',
  how_to_guide: 'How-To Guide',
}

const toneLabels: Record<string, string> = {
  professional: 'Professional',
  casual: 'Casual',
  technical: 'Technical',
  conversational: 'Conversational',
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircleIcon }> = {
  published: { label: 'Published', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircleIcon },
  draft: { label: 'Draft', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: PencilSquareIcon },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CalendarDaysIcon },
}

const topicalMap = [
  {
    topic: 'Baking Fundamentals',
    subtopics: [
      { name: 'Bread Baking Techniques', articles: 4, covered: true },
      { name: 'Pastry Science & Theory', articles: 2, covered: true },
      { name: 'Ingredient Selection', articles: 1, covered: false },
      { name: 'Temperature & Timing', articles: 0, covered: false },
    ],
  },
  {
    topic: 'Business & Marketing',
    subtopics: [
      { name: 'Starting a Bakery', articles: 3, covered: true },
      { name: 'Local Marketing Strategies', articles: 2, covered: true },
      { name: 'Pricing & Profitability', articles: 1, covered: false },
      { name: 'Social Media for Bakeries', articles: 0, covered: false },
    ],
  },
  {
    topic: 'Products & Services',
    subtopics: [
      { name: 'Wedding Cakes', articles: 2, covered: true },
      { name: 'Custom Orders', articles: 1, covered: false },
      { name: 'Seasonal Specials', articles: 1, covered: false },
      { name: 'Equipment Reviews', articles: 3, covered: true },
    ],
  },
]

const geoScoreChartData = mockContent.map((c) => ({
  name: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
  GEO: c.geoScore,
  'E-E-A-T': c.eeatScore,
}))

// ---------- Component ----------

export default function ContentPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedContent, setSelectedContent] = useState<typeof mockContent[0] | null>(null)
  const [generating, setGenerating] = useState(false)
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({ 'Baking Fundamentals': true })

  // Form state
  const [formTopic, setFormTopic] = useState('')
  const [formType, setFormType] = useState('blog_post')
  const [formKeyword, setFormKeyword] = useState('')
  const [formSecondary, setFormSecondary] = useState('')
  const [formWordCount, setFormWordCount] = useState(1500)
  const [formTone, setFormTone] = useState('professional')
  const [formGeoOptimize, setFormGeoOptimize] = useState(true)

  const stats = [
    { label: 'Total Pieces', value: '24', icon: DocumentTextIcon },
    { label: 'Published', value: '18', icon: CheckCircleIcon },
    { label: 'Avg GEO Score', value: '76', icon: SparklesIcon },
    { label: 'Avg Word Count', value: '1,850', icon: ClockIcon },
  ]

  const handleGenerate = async () => {
    if (!formTopic.trim()) {
      toast.error('Please enter a topic')
      return
    }
    setGenerating(true)
    toast.loading('Generating content with AI...', { id: 'generate' })
    // Simulate generation delay
    await new Promise((r) => setTimeout(r, 2500))
    setGenerating(false)
    toast.success('Content generated successfully!', { id: 'generate' })
    setShowForm(false)
    setFormTopic('')
    setFormKeyword('')
    setFormSecondary('')
    setFormWordCount(1500)
    setFormTone('professional')
    setFormType('blog_post')
  }

  const toggleTopic = (topic: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topic]: !prev[topic] }))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div>
      <PageHeader
        title="AI Content"
        description="Generate and manage AI-powered, GEO-optimized content"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            Generate Content
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-5"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Generation Form (Collapsible) */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-orange-500" />
              Generate New Content
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Topic */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Topic *
                </label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g., The Best Sourdough Bread Recipe for Beginners"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="blog_post">Blog Post</option>
                  <option value="landing_page">Landing Page</option>
                  <option value="product_description">Product Description</option>
                  <option value="how_to_guide">How-To Guide</option>
                </select>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tone
                </label>
                <select
                  value={formTone}
                  onChange={(e) => setFormTone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                  <option value="conversational">Conversational</option>
                </select>
              </div>

              {/* Focus Keyword */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Focus Keyword
                </label>
                <input
                  type="text"
                  value={formKeyword}
                  onChange={(e) => setFormKeyword(e.target.value)}
                  placeholder="e.g., sourdough bread recipe"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Secondary Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Secondary Keywords
                </label>
                <input
                  type="text"
                  value={formSecondary}
                  onChange={(e) => setFormSecondary(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Word Count Slider */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Word Count: <span className="text-orange-500 font-semibold">{formWordCount.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={100}
                  value={formWordCount}
                  onChange={(e) => setFormWordCount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>500</span>
                  <span>1,500</span>
                  <span>2,500</span>
                  <span>3,500</span>
                  <span>5,000</span>
                </div>
              </div>

              {/* GEO Optimize Toggle */}
              <div className="md:col-span-2 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">GEO Optimize</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Optimize content for AI search engines (ChatGPT, Gemini, Perplexity)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormGeoOptimize(!formGeoOptimize)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formGeoOptimize ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formGeoOptimize ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || !formTopic.trim()}
                className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Content List & Preview */}
        <div className="xl:col-span-2 space-y-8">
          {/* Content List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generated Content
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Click on any piece to preview the full content
              </p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockContent.map((content) => {
                const statusCfg = statusConfig[content.status]
                return (
                  <button
                    key={content.id}
                    onClick={() => setSelectedContent(content)}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedContent?.id === content.id ? 'bg-orange-50 dark:bg-orange-900/10 border-l-4 border-l-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {content.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            {contentTypeLabels[content.type]}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusCfg.color}`}>
                            <statusCfg.icon className="h-3 w-3 mr-1" />
                            {statusCfg.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {content.wordCount.toLocaleString()} words
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {content.createdAt}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-right flex-shrink-0">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">GEO</p>
                          <p className={`text-sm font-bold ${getScoreColor(content.geoScore)}`}>
                            {content.geoScore}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">E-E-A-T</p>
                          <p className={`text-sm font-bold ${getScoreColor(content.eeatScore)}`}>
                            {content.eeatScore}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Preview */}
          {selectedContent && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Content Preview
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {contentTypeLabels[selectedContent.type]} &middot; {toneLabels[selectedContent.tone]} tone &middot; {selectedContent.wordCount.toLocaleString()} words
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      toast.success('Content copied to clipboard!')
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => setSelectedContent(null)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Meta info bar */}
                <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-md">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Focus Keyword: </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{selectedContent.focusKeyword}</span>
                  </div>
                  {selectedContent.secondaryKeywords.map((kw) => (
                    <div key={kw} className="bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-md">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{kw}</span>
                    </div>
                  ))}
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">GEO Score</p>
                    <p className={`text-3xl font-bold ${getScoreColor(selectedContent.geoScore)}`}>
                      {selectedContent.geoScore}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full"
                        style={{ width: `${selectedContent.geoScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">E-E-A-T Score</p>
                    <p className={`text-3xl font-bold ${getScoreColor(selectedContent.eeatScore)}`}>
                      {selectedContent.eeatScore}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full"
                        style={{ width: `${selectedContent.eeatScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Rendered Markdown (simple rendering) */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {selectedContent.body.split('\n').map((line, i) => {
                    if (line.startsWith('### ')) {
                      return (
                        <h3 key={i} className="text-base font-semibold text-gray-900 dark:text-white mt-4 mb-2">
                          {line.replace('### ', '')}
                        </h3>
                      )
                    }
                    if (line.startsWith('## ')) {
                      return (
                        <h2 key={i} className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2">
                          {line.replace('## ', '')}
                        </h2>
                      )
                    }
                    if (line.startsWith('# ')) {
                      return (
                        <h1 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-3">
                          {line.replace('# ', '')}
                        </h1>
                      )
                    }
                    if (line.startsWith('- **')) {
                      const match = line.match(/- \*\*(.+?)\*\*(.*)/)
                      if (match) {
                        return (
                          <li key={i} className="text-sm text-gray-700 dark:text-gray-300 ml-4 mb-1">
                            <strong className="text-gray-900 dark:text-white">{match[1]}</strong>{match[2]}
                          </li>
                        )
                      }
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 ml-4 mb-1">
                          {line.replace('- ', '')}
                        </li>
                      )
                    }
                    if (/^\d+\.\s/.test(line)) {
                      const content = line.replace(/^\d+\.\s/, '')
                      const boldMatch = content.match(/\*\*(.+?)\*\*(.*)/)
                      return (
                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 ml-4 mb-1 list-decimal">
                          {boldMatch ? (
                            <>
                              <strong className="text-gray-900 dark:text-white">{boldMatch[1]}</strong>{boldMatch[2]}
                            </>
                          ) : (
                            content
                          )}
                        </li>
                      )
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <p key={i} className="text-sm font-semibold text-gray-900 dark:text-white mt-3 mb-1">
                          {line.replace(/\*\*/g, '')}
                        </p>
                      )
                    }
                    if (line.trim() === '') {
                      return <div key={i} className="h-2" />
                    }
                    return (
                      <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                        {line}
                      </p>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Score Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Content Scores</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">GEO and E-E-A-T scores across all content</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={geoScoreChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="GEO" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="E-E-A-T" fill="#FB923C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column - Topical Map */}
        <div className="space-y-8">
          {/* Topical Map */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Topical Map</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Content topic hierarchy and coverage</p>
            </div>
            <div className="p-4">
              {topicalMap.map((cluster) => (
                <div key={cluster.topic} className="mb-2">
                  <button
                    onClick={() => toggleTopic(cluster.topic)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center">
                      {expandedTopics[cluster.topic] ? (
                        <ChevronDownIcon className="h-4 w-4 text-gray-400 mr-2" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {cluster.topic}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {cluster.subtopics.filter((s) => s.covered).length}/{cluster.subtopics.length} covered
                    </span>
                  </button>
                  {expandedTopics[cluster.topic] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {cluster.subtopics.map((sub) => (
                        <div
                          key={sub.name}
                          className="flex items-center justify-between px-3 py-2 rounded-md"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-3 ${
                                sub.covered ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                            <span className={`text-sm ${sub.covered ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                              {sub.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {sub.articles} {sub.articles === 1 ? 'article' : 'articles'}
                            </span>
                            {!sub.covered && (
                              <button
                                onClick={() => {
                                  setFormTopic(sub.name)
                                  setShowForm(true)
                                  window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                              >
                                Generate
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Content Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Content Breakdown</h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Blog Posts', count: 12, total: 24 },
                { label: 'How-To Guides', count: 6, total: 24 },
                { label: 'Landing Pages', count: 4, total: 24 },
                { label: 'Product Descriptions', count: 2, total: 24 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-gray-500 dark:text-gray-400">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(item.count / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GEO Optimization Tips */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center mb-3">
              <SparklesIcon className="h-6 w-6" />
              <h3 className="ml-2 font-semibold">GEO Tips</h3>
            </div>
            <ul className="space-y-2 text-sm opacity-95">
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Include structured data and citations
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Write in a clear, authoritative tone
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Use specific statistics and data points
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Provide unique expert perspectives
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Answer questions directly and concisely
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
