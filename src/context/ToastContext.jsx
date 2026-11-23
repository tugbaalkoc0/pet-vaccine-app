import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(undefined)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(mevcut => mevcut.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(mevcut => [...mevcut, { id, message, type }])
    setTimeout(() => removeToast(id), 3500)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        className="toast-container position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 1080 }}
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast show align-items-center text-white bg-${toast.type === 'error' ? 'danger' : 'success'} border-0 mb-2`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => removeToast(toast.id)}
              ></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast, ToastProvider içinde kullanılmalı')
  }
  return context
}
