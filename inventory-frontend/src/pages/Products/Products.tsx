import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Plus, Search, Filter, Edit, Trash2, Package,
  AlertTriangle, ChevronLeft, ChevronRight, X,
  RefreshCw, LayoutGrid, List, Download
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { productsApi } from '../../api/services'
import { useAuthStore, useToastStore } from '../../store'
import ProductModal from './ProductModal'
import './Products.css'

interface QueryParams {
  page: number
  pageSize: number
  search: string
  category: string
  sortBy: string
  sortOrder: string
  isLowStock?: boolean
}

export default function Products() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const qc = useQueryClient()

  const [params, setParams] = useState<QueryParams>({
    page: 1, pageSize: 10, search: '', category: '',
    sortBy: 'name', sortOrder: 'asc'
  })
  const [searchInput, setSearchInput] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params)
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => productsApi.getCategories()
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      addToast('success', 'Product deleted successfully')
      setDeleteConfirm(null)
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: () => addToast('error', 'Failed to delete product')
  })

  const result = data?.data?.data
  const products = result?.items || []
  const totalCount = result?.totalCount || 0
  const totalPages = result?.totalPages || 1
  const categories: string[] = categoriesData?.data?.data || []

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setParams(p => ({ ...p, search: searchInput, page: 1 }))
    }
  }

  const handleSort = (field: string) => {
    setParams(p => ({
      ...p,
      sortBy: field,
      sortOrder: p.sortBy === field && p.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    }))
  }

  const getStockBadge = (qty: number, min: number) => {
    if (qty === 0) return <span className="badge badge-danger">{t('outOfStockBadge')}</span>
    if (qty <= min) return <span className="badge badge-warning">{t('lowStockBadge')}</span>
    return <span className="badge badge-success">{t('inStock')}</span>
  }

  const exportToExcel = () => {
    if (!products.length) return
    const exportData = products.map((p: any) => ({
      ID: p.id,
      Name: p.name,
      SKU: p.sku,
      Category: p.category,
      Price: p.price,
      Quantity: p.quantity,
      'Min Quantity': p.minQuantity,
      Unit: p.unit,
      Supplier: p.supplier,
      Status: p.quantity === 0 ? 'Out of Stock' : p.quantity <= p.minQuantity ? 'Low Stock' : 'In Stock'
    }))
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, `Products_Export_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="products-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('products')}</h1>
          <p className="page-subtitle">{totalCount} {t('items')} {t('total')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={exportToExcel} disabled={!products.length}>
            <Download size={16} />
            Export Excel
          </button>
          {user?.isAdmin && (
            <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowModal(true) }}>
              <Plus size={16} />
              {t('addProduct')}
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div className="filters-row">
          {/* Search */}
          <div className="search-wrapper" style={{ flex: 1, maxWidth: 360 }}>
            <span className="search-icon"><Search size={16} /></span>
            <input
              className="search-input"
              placeholder={t('search')}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleSearch}
            />
            {searchInput && (
              <button
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => { setSearchInput(''); setParams(p => ({ ...p, search: '', page: 1 })) }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={params.category}
            onChange={e => setParams(p => ({ ...p, category: e.target.value, page: 1 }))}
          >
            <option value="">{t('allCategories')}</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Low stock filter */}
          <button
            className={`btn btn-ghost btn-sm ${params.isLowStock ? 'active-filter' : ''}`}
            onClick={() => setParams(p => ({ ...p, isLowStock: p.isLowStock ? undefined : true, page: 1 }))}
          >
            <AlertTriangle size={14} />
            {t('lowStock')}
          </button>

          {/* View mode */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List size={15} />
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          {/* Refresh */}
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => refetch()} title="Refresh">
            <RefreshCw size={15} className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable">
                    {t('productName')} {params.sortBy === 'name' && (params.sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>{t('sku')}</th>
                  <th>{t('category')}</th>
                  <th onClick={() => handleSort('price')} className="sortable">
                    {t('price')} {params.sortBy === 'price' && (params.sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('quantity')} className="sortable">
                    {t('quantity')} {params.sortBy === 'quantity' && (params.sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Status</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j}>
                          <div className="skeleton" style={{ height: 18, width: '80%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <Package size={40} />
                        <p>{t('noProducts')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((p: any) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="product-icon-mini">
                            <Package size={14} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                            {p.supplier && (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.supplier}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <code className="sku-code">{p.sku || '—'}</code>
                      </td>
                      <td>
                        <span className="badge badge-info">{p.category}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                          ${p.price.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontWeight: 700 }}>{p.quantity} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.unit}</span></span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Min: {p.minQuantity}</span>
                        </div>
                      </td>
                      <td>{getStockBadge(p.quantity, p.minQuantity)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => { setEditProduct(p); setShowModal(true) }}
                            title={t('edit')}
                          >
                            <Edit size={14} />
                          </button>
                          {user?.isAdmin && (
                            <button
                              className="btn btn-danger btn-icon btn-sm"
                              onClick={() => setDeleteConfirm(p)}
                              title={t('delete')}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span className="pagination-info">
              {t('showing')} {Math.min((params.page - 1) * params.pageSize + 1, totalCount)}–
              {Math.min(params.page * params.pageSize, totalCount)} {t('of')} {totalCount}
            </span>
            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={params.page === 1}
                onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = i + 1
                return (
                  <button
                    key={pg}
                    className={`page-btn ${params.page === pg ? 'active' : ''}`}
                    onClick={() => setParams(p => ({ ...p, page: pg }))}
                  >
                    {pg}
                  </button>
                )
              })}
              <button
                className="page-btn"
                disabled={params.page === totalPages}
                onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="products-grid">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 180, borderRadius: 12 }} />
              ))
            : products.map((p: any) => (
                <div key={p.id} className="product-card">
                  <div className="product-card-header">
                    <div className="product-card-icon">
                      <Package size={20} />
                    </div>
                    {getStockBadge(p.quantity, p.minQuantity)}
                  </div>
                  <h3 className="product-card-name">{p.name}</h3>
                  <p className="product-card-sku">{p.sku}</p>
                  <div className="product-card-stats">
                    <div>
                      <span className="product-card-price">${p.price.toFixed(2)}</span>
                      <span className="product-card-unit">/ {p.unit}</span>
                    </div>
                    <span className="badge badge-info">{p.category}</span>
                  </div>
                  <div className="product-card-qty">
                    <span>Qty: <strong>{p.quantity}</strong></span>
                    <span className="text-muted">Min: {p.minQuantity}</span>
                  </div>
                  <div className="product-card-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setEditProduct(p); setShowModal(true) }}
                    >
                      <Edit size={13} /> {t('edit')}
                    </button>
                    {user?.isAdmin && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteConfirm(p)}
                      >
                        <Trash2 size={13} /> {t('delete')}
                      </button>
                    )}
                  </div>
                </div>
              ))
          }
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger)' }}>
                <Trash2 size={18} style={{ display: 'inline', marginRight: 8 }} />
                {t('deleteProduct')}
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {t('confirmDelete')}
              </p>
              <p style={{ marginTop: 8, fontWeight: 600, color: 'var(--text-primary)' }}>
                "{deleteConfirm.name}"
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>
                {t('cancel')}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <span className="spinner" /> : <Trash2 size={14} />}
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
