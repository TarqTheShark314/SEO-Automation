import { create } from 'zustand'

interface User {
  id: number
  email: string
  full_name: string
}

interface Site {
  id: number
  domain: string
  name: string
}

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  selectedSite: Site | null
  setSelectedSite: (site: Site | null) => void
  sites: Site[]
  setSites: (sites: Site[]) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  selectedSite: null,
  setSelectedSite: (site) => set({ selectedSite: site }),
  sites: [],
  setSites: (sites) => set({ sites }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
