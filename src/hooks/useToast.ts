import { useState, useCallback } from 'react'

type ToastType = 'success' | 'error'

interface Toast {
  id: number
  message: string
  type: ToastType
}

let counter = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast])
  const error   = useCallback((msg: string) => addToast(msg, 'error'),   [addToast])

  return { toasts, success, error }
}