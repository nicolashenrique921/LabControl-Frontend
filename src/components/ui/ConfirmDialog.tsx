import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  title?: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDialog({ open, title = 'Confirmar', message, onConfirm, onCancel, loading }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-slide-up">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-surface-900">{title}</h3>
            <p className="mt-1 text-sm text-surface-500">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>Cancelar</button>
          <button onClick={onConfirm} className="btn-danger" disabled={loading}>
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}