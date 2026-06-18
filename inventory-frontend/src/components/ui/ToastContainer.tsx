import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store'

const icons = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />
}

const colors = {
  success: 'var(--success)',
  error: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--accent)'
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span style={{ color: colors[toast.type], flexShrink: 0 }}>
            {icons[toast.type]}
          </span>
          <span style={{ flex: 1, color: 'var(--text-primary)' }}>
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
