import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { dashboardApi, inventoryApi } from '../../api/services'
import { FileText, TrendingUp, TrendingDown, Package } from 'lucide-react'
import './Reports.css'

const PIE_COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#3b82f6']

export default function Reports() {
  const { t } = useTranslation()

  const { data: activityData30 } = useQuery({
    queryKey: ['activity-30'],
    queryFn: () => dashboardApi.getActivityChart(30)
  })

  const { data: activityData7 } = useQuery({
    queryKey: ['activity-7'],
    queryFn: () => dashboardApi.getActivityChart(7)
  })

  const { data: categoryData } = useQuery({
    queryKey: ['category-breakdown'],
    queryFn: () => dashboardApi.getCategoryBreakdown()
  })

  const { data: topProductsData } = useQuery({
    queryKey: ['top-products-10'],
    queryFn: () => dashboardApi.getTopProducts(10)
  })

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats()
  })

  const activity30 = activityData30?.data?.data || []
  const activity7 = activityData7?.data?.data || []
  const categories = categoryData?.data?.data || []
  const topProducts = topProductsData?.data?.data || []
  const stats = statsData?.data?.data

  // Calculate totals from 30-day data
  const totalAdds  = activity30.reduce((s: number, d: any) => s + d.addCount, 0)
  const totalSells = activity30.reduce((s: number, d: any) => s + d.sellCount, 0)
  const totalAdjust= activity30.reduce((s: number, d: any) => s + d.adjustCount, 0)
  const totalMoves = activity30.reduce((s: number, d: any) => s + d.totalMovements, 0)

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('reports')}</h1>
          <p className="page-subtitle">Last 30 days analytics & insights</p>
        </div>
      </div>

      {/* Summary Cards - Last 30 Days */}
      <div className="grid-4" style={{ gap: 16 }}>
        {[
          { label: 'Total Movements', value: totalMoves, icon: FileText, color: 'var(--accent)', bg: 'var(--accent-light)' },
          { label: 'Stock Additions', value: totalAdds, icon: TrendingUp, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Sales', value: totalSells, icon: TrendingDown, color: 'var(--danger)', bg: 'var(--danger-light)' },
          { label: 'Adjustments', value: totalAdjust, icon: Package, color: 'var(--warning)', bg: 'var(--warning-light)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div className="kpi-card" key={label}>
            <div className="kpi-icon" style={{ background: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <p className="kpi-label">{label}</p>
              <p className="kpi-value" style={{ color }}>{value}</p>
              <p className="kpi-sub">Last 30 days</p>
            </div>
          </div>
        ))}
      </div>

      {/* 30-Day Activity Chart */}
      <div className="card">
        <h3 className="chart-title">📈 Stock Activity — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={activity30} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gAdd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gSell" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gAdj" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => v.slice(5)} interval="preserveStartEnd"/>
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false}/>
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }}/>
            <Legend />
            <Area type="monotone" dataKey="addCount"    name="Add"    stroke="#10b981" fill="url(#gAdd)"  strokeWidth={2} dot={false}/>
            <Area type="monotone" dataKey="sellCount"   name="Sell"   stroke="#ef4444" fill="url(#gSell)" strokeWidth={2} dot={false}/>
            <Area type="monotone" dataKey="adjustCount" name="Adjust" stroke="#f59e0b" fill="url(#gAdj)"  strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Bar + Category Pie */}
      <div className="reports-charts-row">
        {/* 7-Day Bar Chart */}
        <div className="card">
          <h3 className="chart-title">📊 This Week's Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={activity7} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => v.slice(5)}/>
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false}/>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }}/>
              <Legend />
              <Bar dataKey="addCount"  name="Add"  fill="#10b981" radius={[4,4,0,0]}/>
              <Bar dataKey="sellCount" name="Sell" fill="#ef4444" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card">
          <h3 className="chart-title">🗂️ Inventory by Category</h3>
          {categories.length === 0 ? (
            <div className="empty-state" style={{ padding: '50px 0' }}>
              <Package size={36}/><span>No categories yet</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categories} dataKey="productCount" nameKey="category"
                  cx="50%" cy="50%" outerRadius={90} innerRadius={40}
                  label={({ category, percent }) => `${category} ${(percent*100).toFixed(0)}%`}
                  labelLine={{ stroke: 'var(--text-muted)' }}
                >
                  {categories.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)'}}
                  formatter={(value: any, name: any) => [value, name]}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Value Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 20px 0' }}>
          <h3 className="chart-title">📦 Category Breakdown</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th>Total Quantity</th>
                <th>Inventory Value</th>
                <th>Avg. Value / Product</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state"><Package size={32}/><span>No data</span></div>
                </td></tr>
              ) : categories.map((cat: any, i: number) => (
                <tr key={cat.category}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }}/>
                      <strong>{cat.category}</strong>
                    </div>
                  </td>
                  <td>{cat.productCount}</td>
                  <td>{cat.totalQuantity.toLocaleString()}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 700 }}>
                    ${cat.totalValue.toLocaleString('en', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    ${(cat.totalValue / (cat.productCount || 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 20px 0' }}>
          <h3 className="chart-title">🏆 Top 10 Most Active Products</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Category</th>
                <th>Total Movements</th>
                <th>Current Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state"><Package size={32}/><span>No movement data yet</span></div>
                </td></tr>
              ) : topProducts.map((p: any, i: number) => (
                <tr key={p.productId}>
                  <td>
                    <div className="rank-badge" style={{ background: i < 3 ? 'linear-gradient(135deg, var(--accent), var(--violet))' : 'var(--bg-primary)' }}>
                      {i + 1}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.productName}</td>
                  <td><span className="badge badge-info">{p.category}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="movement-bar-bg">
                        <div className="movement-bar-fill" style={{
                          width: `${Math.min(100, (p.totalMovements / (topProducts[0]?.totalMovements || 1)) * 100)}%`
                        }}/>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--accent)', minWidth: 30 }}>{p.totalMovements}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.currentQuantity}</td>
                  <td>
                    <span className={`badge ${p.currentQuantity === 0 ? 'badge-danger' : p.currentQuantity < 10 ? 'badge-warning' : 'badge-success'}`}>
                      {p.currentQuantity === 0 ? 'Out of Stock' : p.currentQuantity < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
