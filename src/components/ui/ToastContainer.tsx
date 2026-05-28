import { CheckCircle, XCircle } from 'lucide-react'

interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error'
}

export default function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl
            text-sm font-medium animate-slide-up
            ${t.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}
        >
          {t.type === 'success'
            ? <CheckCircle size={16} className="shrink-0" />
            : <XCircle    size={16} className="shrink-0" />}
          {t.message}
        </div>
      ))}
    </div>
  )
}