import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, ChevronLeft, ChevronRight, ClipboardList, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { inventoryApi, productsApi } from '../../api/services'
import { useToastStore, useAuthStore } from '../../store'
import { format } from 'date-fns'

type ActionType = 'add' | 'sell' | 'adjust' | 'return' | null

export default function Inventory() {
  const { t } = useTranslation()
  const { addToast } = useToastStore()
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')
  const [actionModal, setActionModal] = useState<ActionType>(null)
  const [productId, setProductId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-logs', page, actionFilter],
    queryFn: () => inventoryApi.getLogs({ page, pageSize: 20, action: actionFilter || undefined })
  })

  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productsApi.getAll({ page: 1, pageSize: 1000 })
  })

  const result = data?.data?.data
  const logs = result?.items || []
  const totalPages = result?.totalPages || 1
  const allProducts = productsData?.data?.data?.items || []

  const mutation = useMutation({
    mutationFn: async () => {
      if (!productId) return
      const dto = { productId, notes }
      switch (actionModal) {
        case 'add':    return inventoryApi.add({ ...dto, quantityToAdd: quantity })
        case 'sell':   return inventoryApi.sell({ ...dto, quantityToSell: quantity })
        case 'adjust': return inventoryApi.adjust({ ...dto, newQuantity: quantity })
        case 'return': return inventoryApi.return({ ...dto, quantityToReturn: quantity })
      }
    },
    onSuccess: (res: any) => {
      addToast('success', res?.data?.message || 'Operation successful')
      qc.invalidateQueries({ queryKey: ['inventory-logs'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setActionModal(null)
      setProductId('')
      setQuantity(1)
      setNotes('')
    },
    onError: (err: any) => addToast('error', err?.response?.data?.message || 'Operation failed')
  })

  const actionColors: Record<string, string> = {
    Add: 'var(--success)', Sell: 'var(--danger)',
    Adjust: 'var(--warning)', Return: 'var(--info)'
  }

  const actionBadges: Record<string, string> = {
    Add: 'badge-success', Sell: 'badge-danger',
    Adjust: 'badge-warning', Return: 'badge-info'
  }

  const getModalTitle = () => {
    switch (actionModal) {
      case 'add': return t('addStock')
      case 'sell': return t('sellStock')
      case 'adjust': return t('adjustStock')
      case 'return': return t('returnStock')
      default: return ''
    }
  }

  const getQtyLabel = () => {
    switch (actionModal) {
      case 'add': return t('quantityToAdd')
      case 'sell': return t('quantityToSell')
      case 'adjust': return t('newQuantity')
      case 'return': return t('quantityToReturn')
      default: return t('quantity')
    }
  }

  const exportToExcel = () => {
    if (!logs.length) return
    const exportData = logs.map((log: any) => ({
      ID: log.id,
      Date: format(new Date(log.actionDate), 'dd MMM yyyy HH:mm'),
      Product: log.productName,
      Action: log.action,
      'Previous Qty': log.previousQuantity,
      'Changed Qty': log.quantityChanged,
      'New Qty': log.newQuantity,
      'Performed By': log.performedBy || 'Unknown',
      Notes: log.notes || ''
    }))
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'InventoryLogs')
    XLSX.writeFile(wb, `InventoryLogs_Export_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('inventory')}</h1>
          <p className="page-subtitle">{t('recentMovements')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={exportToExcel} disabled={!logs.length}>
            <Download size={16} />
          </button>
          <button className="btn btn-secondary" onClick={() => setActionModal('return')}>
            {t('returnStock')}
          </button>
          {user?.isAdmin && (
            <button className="btn btn-secondary" onClick={() => setActionModal('adjust')}>
              {t('adjustStock')}
            </button>
          )}
          <button className="btn btn-danger" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => setActionModal('sell')}>
            {t('sellStock')}
          </button>
          <button className="btn btn-primary" onClick={() => setActionModal('add')}>
            <Plus size={16} /> {t('addStock')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ margin: 0 }}>{t('action')}:</label>
          {['', 'Add', 'Sell', 'Adjust', 'Return'].map(a => (
            <button
              key={a}
              className={`btn btn-ghost btn-sm ${actionFilter === a ? 'active-filter' : ''}`}
              style={a && actionFilter === a ? { background: `${actionColors[a]}20`, color: actionColors[a] } : {}}
              onClick={() => { setActionFilter(a); setPage(1) }}
            >
              {a || t('allActions')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{t('date')}</th>
                <th>{t('product')}</th>
                <th>{t('action')}</th>
                <th>{t('previous')}</th>
                <th>{t('change')}</th>
                <th>{t('new')}</th>
                <th>{t('changedBy')}</th>
                <th>{t('notes')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j}><div className="skeleton" style={{ height: 16, width: '75%' }} /></td>
                      ))}
                    </tr>
                  ))
                : logs.length === 0
                ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="empty-state">
                          <ClipboardList size={40} />
                          <p>{t('noLogs')}</p>
                        </div>
                      </td>
                    </tr>
                  )
                : logs.map((log: any) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {format(new Date(log.actionDate), 'dd MMM yyyy HH:mm')}
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.productName}</td>
                      <td>
                        <span className={`badge ${actionBadges[log.action] || 'badge-accent'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{log.previousQuantity}</td>
                      <td style={{ fontWeight: 700, color: actionColors[log.action] }}>
                        {log.action === 'Sell' ? '-' : '+'}{log.quantityChanged}
                      </td>
                      <td style={{ fontWeight: 700 }}>{log.newQuantity}</td>
                      <td style={{ fontSize: 12 }}>
                        <span className="badge badge-accent">{log.performedBy || '—'}</span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.notes || '—'}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="pagination">
          <span className="pagination-info">{t('page')} {page} {t('of')} {totalPages}</span>
          <div className="pagination-controls">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={14} />
            </button>
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{getModalTitle()}</h3>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{t('product')} *</label>
                <select
                  className="form-select"
                  value={productId}
                  onChange={e => setProductId(Number(e.target.value))}
                >
                  <option value="">-- Select Product --</option>
                  {allProducts.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{getQtyLabel()} *</label>
                <input
                  className="form-input"
                  type="number"
                  min={actionModal === 'adjust' ? 0 : 1}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('notes')}</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setActionModal(null)}>{t('cancel')}</button>
              <button
                className="btn btn-primary"
                disabled={!productId || quantity < 0 || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? <span className="spinner" /> : null}
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
