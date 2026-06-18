import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  isAdmin: boolean
  isActive: boolean
  profilePicture?: string
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, refreshToken: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, refreshToken, user) =>
        set({ token, refreshToken, user, isAuthenticated: true }),

      logout: () =>
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }))
    }),
    { name: 'inv-auth' }
  )
)

// ── Theme Store ────────────────────────────────────────
interface ThemeState {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.setAttribute('data-theme', next)
          return { theme: next }
        })
    }),
    { name: 'inv-theme' }
  )
)

// ── Language Store ─────────────────────────────────────
interface LangState {
  lang: 'en' | 'ar'
  setLang: (lang: 'en' | 'ar') => void
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => {
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
        document.documentElement.setAttribute('lang', lang)
        set({ lang })
      }
    }),
    { name: 'inv-lang' }
  )
)

// ── Toast Store ────────────────────────────────────────
interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

interface ToastState {
  toasts: Toast[]
  addToast: (type: Toast['type'], message: string) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}))

// ── Sidebar Store ──────────────────────────────────────
interface SidebarState {
  isOpen: boolean
  isCollapsed: boolean
  toggle: () => void
  toggleCollapse: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: false,
      isCollapsed: false,
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      toggleCollapse: () => set((s) => ({ isCollapsed: !s.isCollapsed }))
    }),
    { name: 'inv-sidebar' }
  )
)
