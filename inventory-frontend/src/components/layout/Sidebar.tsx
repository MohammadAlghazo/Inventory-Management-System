import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Package, ClipboardList, BarChart3,
  Users, ChevronLeft, ChevronRight, LogOut, Boxes
} from 'lucide-react'
import { useAuthStore, useSidebarStore } from '../../store'
import './Sidebar.css'

const navItems = [
  { key: 'dashboard',  path: '/',          icon: LayoutDashboard },
  { key: 'products',   path: '/products',   icon: Package },
  { key: 'inventory',  path: '/inventory',  icon: ClipboardList },
  { key: 'reports',    path: '/reports',    icon: BarChart3 },
  { key: 'users',      path: '/users',      icon: Users, adminOnly: true }
]

export default function Sidebar() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const { isCollapsed, isOpen, toggleCollapse, toggle } = useSidebarStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const items = navItems.filter(item => !item.adminOnly || user?.isAdmin)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={toggle} />
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Boxes size={22} />
          </div>
          {!isCollapsed && (
            <div className="sidebar-logo-text">
              <span className="logo-name">InvManager</span>
              <span className="logo-version">v2.0</span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button className="sidebar-collapse-btn" onClick={toggleCollapse}>
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Nav */}
        <nav className="sidebar-nav">
          {!isCollapsed && (
            <span className="sidebar-section-label">{t('dashboard') === 'Dashboard' ? 'NAVIGATION' : 'التنقل'}</span>
          )}
          {items.map(({ key, path, icon: Icon }) => (
            <NavLink
              key={key}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              title={isCollapsed ? t(key) : undefined}
            >
              <span className="sidebar-link-icon"><Icon size={18} /></span>
              {!isCollapsed && <span className="sidebar-link-label">{t(key)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User profile */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="sidebar-user">
              <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">
                  {user?.firstName || user?.username}
                </span>
                <span className="sidebar-user-role">
                  {user?.role}
                </span>
              </div>
            </div>
          )}
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title={t('logout')}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>{t('logout')}</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
