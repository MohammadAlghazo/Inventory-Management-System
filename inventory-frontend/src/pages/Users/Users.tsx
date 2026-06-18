import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search, UserCheck, UserX, Trash2, Users, Shield, User } from 'lucide-react'
import { usersApi } from '../../api/services'
import { useToastStore } from '../../store'
import { format } from 'date-fns'

export default function UsersPage() {
  const { t } = useTranslation()
  const { addToast } = useToastStore()
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.getAll({ page, pageSize: 15, search: search || undefined })
  })

  const result = data?.data?.data
  const users = result?.items || []
  const totalPages = result?.totalPages || 1

  const toggleMutation = useMutation({
    mutationFn: (id: number) => usersApi.toggleStatus(id),
    onSuccess: () => { addToast('success', 'User status updated'); qc.invalidateQueries({ queryKey: ['users'] }) },
    onError: () => addToast('error', 'Failed to update user status')
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => { addToast('success', 'User deleted'); setDeleteConfirm(null); qc.invalidateQueries({ queryKey: ['users'] }) },
    onError: (err: any) => addToast('error', err?.response?.data?.message || 'Failed to delete user')
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('users')}</h1>
          <p className="page-subtitle">{result?.totalCount || 0} {t('items')}</p>
        </div>
      </div>

      <div className="card" style={{ padding: '14px 20px' }}>
        <div className="search-wrapper">
          <span className="search-icon"><Search size={16} /></span>
          <input
            className="search-input"
            placeholder={t('search')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{t('username')}</th>
                <th>{t('email')}</th>
                <th>{t('role')}</th>
                <th>Status</th>
                <th>Joined</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j}><div className="skeleton" style={{ height: 16, width: '70%' }} /></td>
                      ))}
                    </tr>
                  ))
                : users.length === 0
                ? (
                    <tr><td colSpan={6}>
                      <div className="empty-state"><Users size={40} /><p>{t('noUsers')}</p></div>
                    </td></tr>
                  )
                : users.map((u: any) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar">
                            {u.firstName?.[0] || u.username?.[0] || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.username}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {u.firstName} {u.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{u.email || '—'}</td>
                      <td>
                        <span className={`badge ${u.role === 'Manager' ? 'badge-accent' : 'badge-info'}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {u.role === 'Manager' ? <Shield size={10} /> : <User size={10} />}
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {format(new Date(u.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-ghost' : 'btn-secondary'}`}
                            onClick={() => toggleMutation.mutate(u.id)}
                            disabled={toggleMutation.isPending}
                            title={t('toggleStatus')}
                          >
                            {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                          </button>
                          {u.id !== 1 && (
                            <button
                              className="btn btn-danger btn-icon btn-sm"
                              onClick={() => setDeleteConfirm(u)}
                              title={t('delete')}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span className="pagination-info">{t('page')} {page} {t('of')} {totalPages}</span>
          <div className="pagination-controls">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger)' }}>Delete User</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Delete user <strong>"{deleteConfirm.username}"</strong>? This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>{t('cancel')}</button>
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
