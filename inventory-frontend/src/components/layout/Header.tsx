import { Sun, Moon, Globe, Bell, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../../api/services'
import { useThemeStore, useLangStore, useSidebarStore, useAuthStore } from '../../store'
import './Header.css'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useThemeStore()
  const { lang, setLang } = useLangStore()
  const { toggle } = useSidebarStore()
  const { user } = useAuthStore()

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 60000
  })

  const lowStockCount = stats?.data?.data?.lowStockCount || 0

  const switchLanguage = () => {
    const next = lang === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(next)
    setLang(next)
  }

  return (
    <header className="header">
      {/* Left: hamburger + title */}
      <div className="header-left">
        <button className="header-menu-btn" onClick={toggle} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      {/* Right: controls */}
      <div className="header-right">
        {/* Language switcher */}
        <button
          className="header-icon-btn"
          onClick={switchLanguage}
          title={lang === 'en' ? t('arabic') : t('english')}
        >
          <Globe size={18} />
          <span className="header-lang-label">
            {lang === 'en' ? 'عربي' : 'EN'}
          </span>
        </button>

        {/* Theme toggle */}
        <button
          className="header-icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('lightMode') : t('darkMode')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="header-icon-btn header-notif-btn" title="Low Stock Alerts">
          <Bell size={18} />
          {lowStockCount > 0 && <span className="header-badge">{lowStockCount}</span>}
        </button>

        {/* User avatar */}
        <div className="header-user">
          <div className="avatar">
            {user?.firstName?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div className="header-user-info">
            <span className="header-user-name">
              {user?.firstName
                ? `${user.firstName} ${user.lastName}`
                : user?.username}
            </span>
            <span className="header-user-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
