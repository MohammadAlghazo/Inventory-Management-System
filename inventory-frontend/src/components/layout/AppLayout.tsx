import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from './Sidebar'
import Header from './Header'
import ToastContainer from '../ui/ToastContainer'
import { useSidebarStore } from '../../store'

const pageTitles: Record<string, string> = {
  '/': 'dashboard',
  '/products': 'products',
  '/inventory': 'inventory',
  '/reports': 'reports',
  '/users': 'users'
}

export default function AppLayout() {
  const { t } = useTranslation()
  const { isCollapsed } = useSidebarStore()
  const location = useLocation()

  const titleKey = pageTitles[location.pathname] || 'dashboard'

  return (
    <div className="app-layout">
      <Sidebar />
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header title={t(titleKey)} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
