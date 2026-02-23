'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import {
  UserCircleIcon,
  PuzzlePieceIcon,
  BellIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'

// ---------- Tab Types ----------

type SettingsTab = 'profile' | 'integrations' | 'notifications' | 'api-keys'

const tabs: { id: SettingsTab; name: string; icon: typeof UserCircleIcon }[] = [
  { id: 'profile', name: 'Profile', icon: UserCircleIcon },
  { id: 'integrations', name: 'Integrations', icon: PuzzlePieceIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon },
  { id: 'api-keys', name: 'API Keys', icon: KeyIcon },
]

// ---------- Mock Data ----------

const integrations = [
  {
    id: 'semrush',
    name: 'SEMrush',
    description: 'Keyword research, competitive analysis, and backlink data',
    connected: true,
    apiKey: 'sk-semr-****-****-****-abcd1234',
    lastSync: '2026-02-23 08:30',
    logo: 'S',
    color: 'bg-orange-500',
  },
  {
    id: 'yext',
    name: 'Yext',
    description: 'Local listings management and review monitoring',
    connected: true,
    apiKey: 'yx-****-****-****-efgh5678',
    lastSync: '2026-02-22 14:15',
    logo: 'Y',
    color: 'bg-blue-500',
  },
  {
    id: 'google',
    name: 'Google Search Console',
    description: 'Search performance data, indexing, and sitemaps',
    connected: false,
    apiKey: '',
    lastSync: null,
    logo: 'G',
    color: 'bg-red-500',
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    description: 'Content management and automatic optimization deployment',
    connected: false,
    apiKey: '',
    lastSync: null,
    logo: 'W',
    color: 'bg-indigo-500',
  },
]

const notificationSettings = [
  {
    id: 'audit_complete',
    name: 'Audit Complete',
    description: 'Get notified when an SEO audit finishes running',
    enabled: true,
  },
  {
    id: 'new_issues',
    name: 'New Issues Found',
    description: 'Alert when new SEO issues are detected on your site',
    enabled: true,
  },
  {
    id: 'content_generated',
    name: 'Content Generated',
    description: 'Notification when AI content generation is complete',
    enabled: false,
  },
  {
    id: 'weekly_report',
    name: 'Weekly Report',
    description: 'Receive a weekly summary of your SEO performance',
    enabled: true,
  },
]

const apiKeys = [
  {
    id: 'live',
    name: 'Live API Key',
    key: 'pb_live_****************************a1b2',
    created: '2026-01-15',
    lastUsed: '2026-02-23',
    requests: 12450,
    limit: 50000,
  },
  {
    id: 'test',
    name: 'Test API Key',
    key: 'pb_test_****************************c3d4',
    created: '2026-01-15',
    lastUsed: '2026-02-20',
    requests: 3820,
    limit: 10000,
  },
]

// ---------- Component ----------

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [profileForm, setProfileForm] = useState({
    name: 'John Baker',
    email: 'john@bakemorepies.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [integrationStates, setIntegrationStates] = useState(
    integrations.map((i) => ({ ...i }))
  )
  const [integrationKeys, setIntegrationKeys] = useState<Record<string, string>>(
    Object.fromEntries(integrations.map((i) => [i.id, i.apiKey]))
  )
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [notifStates, setNotifStates] = useState(
    notificationSettings.map((n) => ({ ...n }))
  )
  const [apiKeyStates, setApiKeyStates] = useState(apiKeys.map((k) => ({ ...k })))
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})

  const handleProfileSave = () => {
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    toast.success('Profile updated successfully')
    setProfileForm((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }))
  }

  const handleConnect = (integrationId: string) => {
    const key = integrationKeys[integrationId]
    if (!key) {
      toast.error('Please enter an API key')
      return
    }
    setIntegrationStates((prev) =>
      prev.map((i) =>
        i.id === integrationId
          ? { ...i, connected: true, lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') }
          : i
      )
    )
    toast.success(`${integrationId.charAt(0).toUpperCase() + integrationId.slice(1)} connected successfully`)
  }

  const handleDisconnect = (integrationId: string) => {
    setIntegrationStates((prev) =>
      prev.map((i) =>
        i.id === integrationId
          ? { ...i, connected: false, lastSync: null }
          : i
      )
    )
    setIntegrationKeys((prev) => ({ ...prev, [integrationId]: '' }))
    toast.success('Integration disconnected')
  }

  const handleNotifToggle = (notifId: string) => {
    setNotifStates((prev) =>
      prev.map((n) =>
        n.id === notifId ? { ...n, enabled: !n.enabled } : n
      )
    )
    toast.success('Notification preference updated')
  }

  const handleRegenerateKey = (keyId: string) => {
    const newKey = keyId === 'live'
      ? 'pb_live_' + Math.random().toString(36).substring(2, 30) + 'xx'
      : 'pb_test_' + Math.random().toString(36).substring(2, 30) + 'xx'
    setApiKeyStates((prev) =>
      prev.map((k) =>
        k.id === keyId
          ? { ...k, key: newKey, created: new Date().toISOString().slice(0, 10) }
          : k
      )
    )
    toast.success('API key regenerated. Make sure to update your applications.')
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      toast.success('API key copied to clipboard')
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account, integrations, and preferences"
      />

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Profile Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    Change Password
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={profileForm.currentPassword}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        placeholder="Enter current password"
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        placeholder="Enter new password"
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleProfileSave}
                    className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Connected Services
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Connect your SEO tools and platforms for unified data and automation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrationStates.map((integration) => (
                  <div
                    key={integration.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                          {integration.logo}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {integration.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {integration.connected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            <XCircleIcon className="h-3.5 w-3.5" />
                            Disconnected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showKeys[integration.id] ? 'text' : 'password'}
                          value={integrationKeys[integration.id] || ''}
                          onChange={(e) =>
                            setIntegrationKeys((prev) => ({
                              ...prev,
                              [integration.id]: e.target.value,
                            }))
                          }
                          placeholder={integration.connected ? '****-****-****' : 'Enter API key'}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10 transition-colors"
                        />
                        <button
                          onClick={() =>
                            setShowKeys((prev) => ({
                              ...prev,
                              [integration.id]: !prev[integration.id],
                            }))
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showKeys[integration.id] ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {integration.lastSync && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Last synced: {integration.lastSync}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {integration.connected ? (
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration.id)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Choose which email notifications you would like to receive.
              </p>
              <div className="space-y-1">
                {notifStates.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-center justify-between py-4 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <div className="flex-1 mr-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {notif.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {notif.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotifToggle(notif.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        notif.enabled ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                      role="switch"
                      aria-checked={notif.enabled}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          notif.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start">
                  <BellIcon className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                      Notification delivery
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                      All notifications are sent to john@bakemorepies.com. In-app notifications are always enabled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                API Keys
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Manage your PieBot SEO API keys for external integrations and custom automations.
              </p>
              <div className="space-y-6">
                {apiKeyStates.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <KeyIcon className="h-5 w-5 text-orange-500" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {apiKey.name}
                          </h4>
                          {apiKey.id === 'live' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Production
                            </span>
                          )}
                          {apiKey.id === 'test' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                              Testing
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Created: {apiKey.created} | Last used: {apiKey.lastUsed}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                        API Key
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <input
                            type={showApiKeys[apiKey.id] ? 'text' : 'password'}
                            value={apiKey.key}
                            readOnly
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono text-gray-900 dark:text-white pr-10"
                          />
                          <button
                            onClick={() =>
                              setShowApiKeys((prev) => ({
                                ...prev,
                                [apiKey.id]: !prev[apiKey.id],
                              }))
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showApiKeys[apiKey.id] ? (
                              <EyeSlashIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={() => handleCopyKey(apiKey.key)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Copy to clipboard"
                        >
                          <ClipboardDocumentIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRegenerateKey(apiKey.id)}
                          className="p-2 text-orange-500 hover:text-orange-600 border border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                          title="Regenerate key"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          API Usage
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {apiKey.requests.toLocaleString()} / {apiKey.limit.toLocaleString()} requests
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (apiKey.requests / apiKey.limit) * 100 > 80
                              ? 'bg-red-500'
                              : (apiKey.requests / apiKey.limit) * 100 > 50
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${(apiKey.requests / apiKey.limit) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round((apiKey.requests / apiKey.limit) * 100)}% of monthly limit used
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Key Security
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Never share your API keys publicly or commit them to version control. If you suspect a key has been compromised, regenerate it immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
