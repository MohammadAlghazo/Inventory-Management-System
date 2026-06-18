import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Package, AlertTriangle, TrendingDown, DollarSign,
  Activity, Users, Tag, ArrowUp, ArrowDown
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { dashboardApi } from '../../api/services'
import './Dashboard.css'

const KPI_CONFIG = [
  {
    key: 'totalProducts',
    icon: Package,
    color: 'var(--accent)',
    bg: 'var(--accent-light)',
    format: (v: number) => v.toLocaleString()
  },
  {
    key: 'lowStockCount',
    icon: AlertTriangle,
    color: 'var(--warning)',
    bg: 'var(--warning-light)',
    format: (v: number) => v.toLocaleString()
  },
  {
    key: 'outOfStockCount',
    icon: TrendingDown,
    color: 'var(--danger)',
    bg: 'var(--danger-light)',
    format: (v: number) => v.toLocaleString()
  },
  {
    key: 'totalInventoryValue',
    icon: DollarSign,
    color: 'var(--success)',
    bg: 'var(--success-light)',
    format: (v: number) => `$${v.toLocaleString('en', { minimumFractionDigits: 2 })}`
  },
  {
    key: 'todayMovements',
    icon: Activity,
    color: 'var(--info)',
    bg: 'var(--info-light)',
    format: (v: number) => v.toLocaleString()
  },
  {
    key: 'totalUsers',
    icon: Users,
    color: 'var(--violet)',
    bg: 'var(--violet-light)',
    format: (v: number) => v.toLocaleString()
  },
  {
    key: 'totalCategories',
    icon: Tag,
    color: 'var(--accent)',
    bg: 'var(--accent-light)',
    format: (v: number) => v.toLocaleString()
  }
]

const PIE_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'
]

export default function Dashboard() {
  const { t } = useTranslation()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 30000
  })

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardApi.getActivityChart(30),
    refetchInterval: 60000
  })

  const { data: categoryData } = useQuery({
    queryKey: ['dashboard-categories'],
    queryFn: () => dashboardApi.getCategoryBreakdown(),
    refetchInterval: 60000
  })

  const { data: topProducts } = useQuery({
    queryKey: ['dashboard-top-products'],
    queryFn: () => dashboardApi.getTopProducts(5),
    refetchInterval: 60000
  })

  const statsObj = stats?.data?.data
  const activity = activityData?.data?.data || []
  const categories = categoryData?.data?.data || []
  const top = topProducts?.data?.data || []

  return (
    <div className="dashboard">
      {/* KPI Grid */}
      <div className="kpi-grid">
        {KPI_CONFIG.map(({ key, icon: Icon, color, bg, format }) => (
          <div className="kpi-card" key={key}>
            <div className="kpi-icon" style={{ background: bg }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <p className="kpi-label">{t(key as any)}</p>
              {statsLoading ? (
                <div className="skeleton" style={{ width: 80, height: 32, marginTop: 4 }} />
              ) : (
                <p className="kpi-value" style={{ color }}>
                  {format(statsObj?.[key as keyof typeof statsObj] as number ?? 0)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        {/* Activity Line Chart */}
        <div className="card chart-card">
          <h3 className="chart-title">{t('activityChart')}</h3>
          {activityLoading ? (
            <div className="skeleton" style={{ height: 220, marginTop: 16 }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAdd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSell" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  tickFormatter={v => v.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: 13
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="addCount" name="Add" stroke="#6366f1" fill="url(#gradAdd)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="sellCount" name="Sell" stroke="#ef4444" fill="url(#gradSell)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="card chart-card chart-small">
          <h3 className="chart-title">{t('categoryBreakdown')}</h3>
          {categories.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <Package size={36} />
              <span>No data yet</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="productCount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, percent }) =>
                    `${category} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: 'var(--text-muted)' }}
                >
                  {categories.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--text-primary)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom">
        {/* Top Products */}
        <div className="card">
          <h3 className="chart-title mb-4">{t('topProducts')}</h3>
          {top.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <Activity size={32} />
              <span>No movement data yet</span>
            </div>
          ) : (
            <div className="top-products-list">
              {top.map((p: any, i: number) => (
                <div className="top-product-item" key={p.productId}>
                  <div className="top-product-rank">{i + 1}</div>
                  <div className="top-product-info">
                    <span className="top-product-name">{p.productName}</span>
                    <span className="top-product-category">{p.category}</span>
                  </div>
                  <div className="top-product-stats">
                    <span className="badge badge-accent">{p.totalMovements} moves</span>
                    <span className="top-product-qty">Qty: {p.currentQuantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="card low-stock-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
            <h3 className="chart-title" style={{ marginBottom: 0 }}>{t('lowStock')}</h3>
            {statsObj?.lowStockCount > 0 && (
              <span className="badge badge-warning">{statsObj.lowStockCount}</span>
            )}
          </div>
          {statsObj?.lowStockCount === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <span style={{ fontSize: 14, color: 'var(--success)' }}>
                ✓ All products have sufficient stock
              </span>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {statsObj?.lowStockCount} products are below minimum stock level.
              Check the Products page for details.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
