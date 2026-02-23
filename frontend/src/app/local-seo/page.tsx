'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import {
  MapPinIcon,
  StarIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  CheckBadgeIcon,
  XMarkIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  MinusCircleIcon,
  GlobeAltIcon,
  MegaphoneIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  HeartIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'

// ---------- Mock Data ----------

const mockLocations = [
  {
    id: 1,
    name: 'BakeMorePies - Downtown Portland',
    address: '425 SW Broadway, Portland, OR 97205',
    phone: '(503) 555-0142',
    rating: 4.7,
    totalReviews: 284,
    profileCompleteness: 92,
    verified: true,
    category: 'Bakery',
    hours: 'Mon-Sat 6:00 AM - 7:00 PM',
  },
  {
    id: 2,
    name: 'BakeMorePies - Pearl District',
    address: '1128 NW Glisan St, Portland, OR 97209',
    phone: '(503) 555-0198',
    rating: 4.5,
    totalReviews: 156,
    profileCompleteness: 78,
    verified: true,
    category: 'Bakery',
    hours: 'Mon-Sun 7:00 AM - 6:00 PM',
  },
]

const mockReviews: Record<number, Array<{
  id: number
  reviewer: string
  rating: number
  text: string
  date: string
  sentiment: 'positive' | 'negative' | 'neutral'
  replied: boolean
  reply?: string
}>> = {
  1: [
    {
      id: 101,
      reviewer: 'Sarah M.',
      rating: 5,
      text: 'Absolutely the best sourdough I have ever tasted! The crust is perfectly crispy and the inside is soft and tangy. I drive 30 minutes just to get their bread. The staff is also incredibly friendly and knowledgeable about their baking process.',
      date: '2026-02-20',
      sentiment: 'positive',
      replied: true,
      reply: 'Thank you so much, Sarah! We are thrilled that you love our sourdough. Your support means the world to us!',
    },
    {
      id: 102,
      reviewer: 'James T.',
      rating: 4,
      text: 'Great pastries and coffee. The croissants are flaky and buttery. Only reason for 4 stars is that parking can be tricky around this location. Would definitely recommend the almond croissant.',
      date: '2026-02-18',
      sentiment: 'positive',
      replied: true,
      reply: 'Thanks James! We appreciate the kind words about our croissants. We know parking can be challenging downtown - there is a public lot on 4th Ave just a block away!',
    },
    {
      id: 103,
      reviewer: 'Priya K.',
      rating: 5,
      text: 'Ordered a custom wedding cake and it exceeded all expectations. The design was exactly what we wanted and the flavor was phenomenal. Every guest complimented it. Thank you for making our day extra special!',
      date: '2026-02-15',
      sentiment: 'positive',
      replied: false,
    },
    {
      id: 104,
      reviewer: 'Dave R.',
      rating: 2,
      text: 'Waited 20 minutes for my order even though the shop was not busy. The bread was good but the service was slow. Would have been 4 stars with better service.',
      date: '2026-02-12',
      sentiment: 'negative',
      replied: false,
    },
    {
      id: 105,
      reviewer: 'Michelle L.',
      rating: 3,
      text: 'Decent bakery with nice ambiance. Bread selection is good but prices are a bit high compared to other bakeries in the area. The sourdough was above average.',
      date: '2026-02-08',
      sentiment: 'neutral',
      replied: false,
    },
  ],
  2: [
    {
      id: 201,
      reviewer: 'Alex W.',
      rating: 5,
      text: 'Love this new Pearl District location! The space is beautiful and the pastry selection is even bigger than the downtown shop. The seasonal pie menu is a must-try.',
      date: '2026-02-21',
      sentiment: 'positive',
      replied: true,
      reply: 'Thank you Alex! We put a lot of love into designing the Pearl District space. So glad you are enjoying our seasonal pies!',
    },
    {
      id: 202,
      reviewer: 'Tom H.',
      rating: 4,
      text: 'Really good bakery with authentic artisan bread. The focaccia was outstanding. Would be nice to have some gluten-free options though.',
      date: '2026-02-17',
      sentiment: 'positive',
      replied: false,
    },
    {
      id: 203,
      reviewer: 'Rachel S.',
      rating: 1,
      text: 'Found a hair in my muffin. Very disappointing experience for a bakery at this price point. The staff did not seem too concerned when I brought it up.',
      date: '2026-02-14',
      sentiment: 'negative',
      replied: false,
    },
    {
      id: 204,
      reviewer: 'Chris N.',
      rating: 5,
      text: 'Best cinnamon rolls in Portland, hands down. They are massive, gooey, and perfectly spiced. I buy a dozen every Saturday for the family.',
      date: '2026-02-10',
      sentiment: 'positive',
      replied: true,
      reply: 'Chris, you are the best! We love knowing our cinnamon rolls are part of your family tradition. See you Saturday!',
    },
  ],
}

const mockPosts: Record<number, Array<{
  id: number
  type: string
  content: string
  publishDate: string
  views: number
  clicks: number
  likes: number
}>> = {
  1: [
    {
      id: 301,
      type: 'update',
      content: 'Introducing our new Spring Menu featuring lavender honey scones, strawberry rhubarb pie, and lemon poppy seed muffins. Available starting this weekend!',
      publishDate: '2026-02-22',
      views: 1245,
      clicks: 89,
      likes: 34,
    },
    {
      id: 302,
      type: 'offer',
      content: 'Valentine\'s Day Special: Buy any specialty cake and get a free box of 6 artisan chocolates. Order by February 12th for guaranteed delivery.',
      publishDate: '2026-02-05',
      views: 2310,
      clicks: 178,
      likes: 67,
    },
    {
      id: 303,
      type: 'event',
      content: 'Join us for our monthly Sourdough Workshop this Saturday from 10 AM - 1 PM. Learn to make your own starter and bake a perfect loaf. Limited spots available!',
      publishDate: '2026-01-28',
      views: 890,
      clicks: 124,
      likes: 41,
    },
  ],
  2: [
    {
      id: 401,
      type: 'update',
      content: 'We are excited to announce extended weekend hours! Now open Saturdays and Sundays from 7 AM to 8 PM. More time for fresh bread and pastries!',
      publishDate: '2026-02-20',
      views: 756,
      clicks: 45,
      likes: 22,
    },
    {
      id: 402,
      type: 'offer',
      content: 'Grand Opening Month Special: 15% off all orders over $25 at our new Pearl District location. Use code PEARL15 for online orders.',
      publishDate: '2026-02-01',
      views: 3420,
      clicks: 298,
      likes: 89,
    },
  ],
}

const mockCitations = [
  { directory: 'Google Business Profile', nameMatch: true, addressMatch: true, phoneMatch: true, listed: true, url: 'google.com/maps' },
  { directory: 'Yelp', nameMatch: true, addressMatch: true, phoneMatch: true, listed: true, url: 'yelp.com' },
  { directory: 'Facebook', nameMatch: true, addressMatch: true, phoneMatch: false, listed: true, url: 'facebook.com' },
  { directory: 'Yellow Pages', nameMatch: true, addressMatch: false, phoneMatch: true, listed: true, url: 'yellowpages.com' },
  { directory: 'Apple Maps', nameMatch: true, addressMatch: true, phoneMatch: true, listed: true, url: 'maps.apple.com' },
  { directory: 'Bing Places', nameMatch: true, addressMatch: true, phoneMatch: true, listed: true, url: 'bing.com/maps' },
  { directory: 'TripAdvisor', nameMatch: true, addressMatch: true, phoneMatch: false, listed: true, url: 'tripadvisor.com' },
  { directory: 'Foursquare', nameMatch: false, addressMatch: true, phoneMatch: true, listed: true, url: 'foursquare.com' },
  { directory: 'BBB', nameMatch: true, addressMatch: true, phoneMatch: true, listed: false, url: 'bbb.org' },
  { directory: 'MapQuest', nameMatch: true, addressMatch: true, phoneMatch: true, listed: false, url: 'mapquest.com' },
]

const mockLocalRankings = [
  { keyword: 'best bakery portland', position: 1, change: 0 },
  { keyword: 'sourdough bread near me', position: 2, change: 1 },
  { keyword: 'custom wedding cakes portland', position: 1, change: 2 },
  { keyword: 'artisan bread portland or', position: 3, change: -1 },
  { keyword: 'pastry shop downtown portland', position: 2, change: 0 },
  { keyword: 'bakery portland pearl district', position: 1, change: 0 },
  { keyword: 'fresh bread near me', position: 4, change: 1 },
  { keyword: 'birthday cake order portland', position: 5, change: -2 },
  { keyword: 'gluten free bakery portland', position: 8, change: 3 },
  { keyword: 'best croissants portland', position: 3, change: 1 },
]

const postTypeLabels: Record<string, string> = {
  update: 'Update',
  offer: 'Offer',
  event: 'Event',
  product: 'Product',
}

// ---------- Component ----------

export default function LocalSeoPage() {
  const [activeTab, setActiveTab] = useState<'locations' | 'reviews' | 'posts' | 'citations' | 'rankings'>('locations')
  const [selectedLocation, setSelectedLocation] = useState<number>(mockLocations[0].id)
  const [generatingReply, setGeneratingReply] = useState<number | null>(null)
  const [showPostForm, setShowPostForm] = useState(false)
  const [postType, setPostType] = useState('update')
  const [postTopic, setPostTopic] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [generatingPost, setGeneratingPost] = useState(false)

  const currentLocation = mockLocations.find((l) => l.id === selectedLocation) || mockLocations[0]
  const currentReviews = mockReviews[selectedLocation] || []
  const currentPosts = mockPosts[selectedLocation] || []

  const handleSync = async () => {
    setSyncing(true)
    toast.loading('Syncing all locations...', { id: 'sync' })
    await new Promise((r) => setTimeout(r, 2000))
    setSyncing(false)
    toast.success('All locations synced successfully!', { id: 'sync' })
  }

  const handleGenerateReply = async (reviewId: number) => {
    setGeneratingReply(reviewId)
    toast.loading('Generating AI reply...', { id: `reply-${reviewId}` })
    await new Promise((r) => setTimeout(r, 1800))
    setGeneratingReply(null)
    toast.success('Reply generated! Review and post when ready.', { id: `reply-${reviewId}` })
  }

  const handleGeneratePost = async () => {
    if (!postTopic.trim()) {
      toast.error('Please enter a topic for the post')
      return
    }
    setGeneratingPost(true)
    toast.loading('Generating GBP post...', { id: 'gen-post' })
    await new Promise((r) => setTimeout(r, 2000))
    setGeneratingPost(false)
    toast.success('Post generated successfully!', { id: 'gen-post' })
    setShowPostForm(false)
    setPostTopic('')
  }

  const renderStars = (rating: number, size: string = 'h-4 w-4') => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= Math.floor(rating) ? (
            <StarIconSolid key={star} className={`${size} text-yellow-400`} />
          ) : star - 0.5 <= rating ? (
            <StarIconSolid key={star} className={`${size} text-yellow-300`} />
          ) : (
            <StarIcon key={star} className={`${size} text-gray-300 dark:text-gray-600`} />
          )
        ))}
      </div>
    )
  }

  const sentimentConfig = {
    positive: { label: 'Positive', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: HandThumbUpIcon },
    negative: { label: 'Negative', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: HandThumbDownIcon },
    neutral: { label: 'Neutral', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: MinusCircleIcon },
  }

  const getPositionColor = (pos: number) => {
    if (pos <= 3) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (pos <= 5) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    if (pos <= 10) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  const getChangeIndicator = (change: number) => {
    if (change > 0) return <span className="text-green-600 dark:text-green-400 text-xs font-medium">+{change}</span>
    if (change < 0) return <span className="text-red-600 dark:text-red-400 text-xs font-medium">{change}</span>
    return <span className="text-gray-400 text-xs">--</span>
  }

  const napConsistencyScore = Math.round(
    (mockCitations.filter((c) => c.listed && c.nameMatch && c.addressMatch && c.phoneMatch).length / mockCitations.length) * 100
  )

  const tabs = [
    { key: 'locations' as const, label: 'Locations', icon: MapPinIcon },
    { key: 'reviews' as const, label: 'Reviews', icon: ChatBubbleLeftRightIcon },
    { key: 'posts' as const, label: 'GBP Posts', icon: MegaphoneIcon },
    { key: 'citations' as const, label: 'Citations', icon: GlobeAltIcon },
    { key: 'rankings' as const, label: 'Map Pack', icon: ChartBarIcon },
  ]

  return (
    <div>
      <PageHeader
        title="Local SEO"
        description="Manage Google Business Profiles, reviews, citations, and local rankings"
        action={
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync All
          </button>
        }
      />

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto -mb-px" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ===== LOCATIONS TAB ===== */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockLocations.map((location) => (
              <div
                key={location.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="h-6 w-6 text-orange-500" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {location.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {location.address}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {location.phone} &middot; {location.hours}
                        </p>
                      </div>
                    </div>
                    {location.verified && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckBadgeIcon className="h-3.5 w-3.5 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {renderStars(location.rating, 'h-3.5 w-3.5')}
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{location.rating}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{location.totalReviews}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reviews</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{location.profileCompleteness}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Complete</p>
                    </div>
                  </div>

                  {/* Profile Completeness Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Profile Completeness</span>
                      <span className={`font-medium ${location.profileCompleteness >= 90 ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
                        {location.profileCompleteness}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${location.profileCompleteness >= 90 ? 'bg-green-500' : 'bg-orange-500'}`}
                        style={{ width: `${location.profileCompleteness}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{location.category}</span>
                  <button
                    onClick={() => {
                      setSelectedLocation(location.id)
                      setActiveTab('reviews')
                    }}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Manage Reviews
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== REVIEWS TAB ===== */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Location Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {mockLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedLocation === loc.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow'
                }`}
              >
                <MapPinIcon className="h-4 w-4 mr-1.5" />
                {loc.name.split(' - ')[1]}
              </button>
            ))}
          </div>

          {/* Review Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentLocation.rating}</p>
              <div className="flex justify-center mt-1">{renderStars(currentLocation.rating, 'h-3.5 w-3.5')}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average Rating</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentReviews.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recent Reviews</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currentReviews.filter((r) => r.replied).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Replied</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">
                {currentReviews.filter((r) => !r.replied).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pending Reply</p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reviews</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {currentLocation.name}
              </p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentReviews.map((review) => {
                const sentCfg = sentimentConfig[review.sentiment]
                return (
                  <div key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {review.reviewer[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewer}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {renderStars(review.rating, 'h-3.5 w-3.5')}
                            <span className="text-xs text-gray-400 dark:text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sentCfg.color}`}>
                          <sentCfg.icon className="h-3 w-3 mr-1" />
                          {sentCfg.label}
                        </span>
                        {review.replied && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Replied
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                      {review.text}
                    </p>

                    {review.replied && review.reply && (
                      <div className="ml-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3 border-l-3 border-l-orange-500">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Your Reply:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{review.reply}</p>
                      </div>
                    )}

                    {!review.replied && (
                      <button
                        onClick={() => handleGenerateReply(review.id)}
                        disabled={generatingReply === review.id}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 disabled:opacity-50 transition-colors"
                      >
                        {generatingReply === review.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-orange-500 border-t-transparent mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="h-3.5 w-3.5 mr-1.5" />
                            AI Reply
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== GBP POSTS TAB ===== */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {/* Location Selector */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {mockLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedLocation === loc.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow'
                  }`}
                >
                  <MapPinIcon className="h-4 w-4 mr-1.5" />
                  {loc.name.split(' - ')[1]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPostForm(!showPostForm)}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm text-sm font-medium"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Generate Post
            </button>
          </div>

          {/* Generate Post Form */}
          {showPostForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Generate GBP Post
                </h2>
                <button
                  onClick={() => setShowPostForm(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Post Type
                    </label>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    >
                      <option value="update">Update</option>
                      <option value="offer">Offer</option>
                      <option value="event">Event</option>
                      <option value="product">Product</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Topic *
                    </label>
                    <input
                      type="text"
                      value={postTopic}
                      onChange={(e) => setPostTopic(e.target.value)}
                      placeholder="e.g., New seasonal menu launch"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setShowPostForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGeneratePost}
                    disabled={generatingPost || !postTopic.trim()}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {generatingPost ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{currentLocation.name}</p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentPosts.map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        post.type === 'offer'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : post.type === 'event'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {postTypeLabels[post.type]}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{post.publishDate}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <EyeIcon className="h-4 w-4" />
                      <span>{post.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      <span>{post.clicks} clicks</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <HeartIcon className="h-4 w-4" />
                      <span>{post.likes} likes</span>
                    </div>
                  </div>
                </div>
              ))}
              {currentPosts.length === 0 && (
                <div className="p-8 text-center">
                  <MegaphoneIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No posts yet for this location.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== CITATIONS TAB ===== */}
      {activeTab === 'citations' && (
        <div className="space-y-6">
          {/* NAP Consistency Score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-center">
              <p className="text-3xl font-bold text-orange-500">{napConsistencyScore}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">NAP Consistency</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {mockCitations.filter((c) => c.listed).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active Listings</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {mockCitations.filter((c) => !c.listed).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Missing Listings</p>
            </div>
          </div>

          {/* Citations Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">NAP Citations Tracker</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Name, Address, Phone consistency across directories
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Directory
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Listed
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockCitations.map((citation) => {
                    const allMatch = citation.listed && citation.nameMatch && citation.addressMatch && citation.phoneMatch
                    const hasIssue = citation.listed && (!citation.nameMatch || !citation.addressMatch || !citation.phoneMatch)
                    return (
                      <tr key={citation.directory} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {citation.directory}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {citation.listed ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {citation.listed ? (
                            citation.nameMatch ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mx-auto" />
                            )
                          ) : (
                            <MinusCircleIcon className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {citation.listed ? (
                            citation.addressMatch ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mx-auto" />
                            )
                          ) : (
                            <MinusCircleIcon className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {citation.listed ? (
                            citation.phoneMatch ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mx-auto" />
                            )
                          ) : (
                            <MinusCircleIcon className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {!citation.listed ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              Not Listed
                            </span>
                          ) : allMatch ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Consistent
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                              Mismatch
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== MAP PACK RANKINGS TAB ===== */}
      {activeTab === 'rankings' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {mockLocalRankings.filter((r) => r.position <= 3).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Top 3 Positions</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">
                {mockLocalRankings.filter((r) => r.position <= 5).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Top 5 Positions</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(mockLocalRankings.reduce((acc, r) => acc + r.position, 0) / mockLocalRankings.length).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Position</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {mockLocalRankings.filter((r) => r.change > 0).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Improved</p>
            </div>
          </div>

          {/* Rankings Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Local Map Pack Rankings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Target keyword positions in Google Map Pack
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Keyword
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Map Pack
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockLocalRankings.map((ranking) => (
                    <tr key={ranking.keyword} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {ranking.keyword}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getPositionColor(ranking.position)}`}>
                          {ranking.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getChangeIndicator(ranking.change)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3].map((pos) => (
                            <div
                              key={pos}
                              className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                                ranking.position === pos
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                              }`}
                            >
                              {pos}
                            </div>
                          ))}
                          {ranking.position > 3 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                              #{ranking.position}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rankings Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Position Distribution</h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={mockLocalRankings.map((r) => ({
                    keyword: r.keyword.length > 18 ? r.keyword.substring(0, 18) + '...' : r.keyword,
                    position: r.position,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis dataKey="keyword" type="category" tick={{ fontSize: 11, fill: '#9CA3AF' }} width={110} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                      fontSize: '13px',
                    }}
                    formatter={(value: number) => [`Position #${value}`, 'Map Pack']}
                  />
                  <Bar dataKey="position" fill="#F97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
