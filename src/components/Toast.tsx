import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EASE } from '../lib/utils'

type ToastFn = (msg: string) => void
const ToastCtx = createContext<ToastFn>(() => {})

export const useToast = () => useContext(ToastCtx)

interface ToastItem {
  id: number
  msg: string
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((msg: string) => {
    const id = Date.now() + Math.random()
    setItems((t) => [...t, { id, msg }])
    setTimeout(() => setItems((t) => t.filter((x) => x.id !== id)), 2600)
  }, [])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-9 z-[90] flex flex-col items-center gap-2 px-6">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="max-w-full bg-[#211F1C] px-4 py-2.5 text-center text-[12px] leading-5 text-[#F2EFE8] shadow-sm"
              style={{ borderRadius: 2 }}
            >
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}
