import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import { Check, Download, X } from 'lucide-react'
import type { Issue } from '../data/types'
import { EASE } from '../lib/utils'
import { useToast } from './Toast'
import PublishCard from './PublishCard'

interface Props {
  issue: Issue
  open: boolean
  onClose: () => void
}

const W = 1242
const H = 1660
const PREVIEW_SCALE = 0.235

export default function DownloadModal({ issue, open, onClose }: Props) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const t = issue.theme

  useEffect(() => {
    if (open) setDone(false)
  }, [open])

  async function capture(): Promise<HTMLCanvasElement> {
    const node = exportRef.current
    if (!node) throw new Error('export node missing')
    await document.fonts.ready
    await new Promise((r) => setTimeout(r, 120))
    return html2canvas(node, {
      scale: 1,
      width: W,
      height: H,
      backgroundColor: t.paper,
      logging: false,
      useCORS: true,
    })
  }

  async function handleSave() {
    if (busy) return
    setBusy(true)
    try {
      const canvas = await capture()
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'))
      if (!blob) throw new Error('toBlob failed')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `TODAYS-SHOOT-No${issue.no}-${issue.id}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
      setDone(true)
      toast('发布卡已保存，搭配你的照片发一篇笔记吧。')
    } catch (e) {
      console.error('[publish-card] export failed', e)
      toast('导出失败，请再试一次')
    } finally {
      setBusy(false)
    }
  }

  /* QA 调试钩子：验证导出画布尺寸与像素内容 */
  useEffect(() => {
    if (!open) return
    ;(window as unknown as Record<string, unknown>).__tsDebug = async () => {
      const canvas = await capture()
      const ctx = canvas.getContext('2d')!
      const p1 = ctx.getImageData(40, 40, 1, 1).data
      const p2 = ctx.getImageData(621, 900, 1, 1).data
      return { w: canvas.width, h: canvas.height, topPixel: [...p1], heroPixel: [...p2] }
    }
    return () => {
      delete (window as unknown as Record<string, unknown>).__tsDebug
    }
  }, [open, issue.id])

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key="dl"
              className="fixed inset-0 z-[60] flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* 背板 */}
              <div className="absolute inset-0 bg-black/70" onClick={onClose} />

              <motion.div
                initial={{ opacity: 0, y: 34, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="relative w-full max-w-[340px] border"
                style={{ background: t.paper, borderColor: t.hairline }}
              >
                {/* 头部 */}
                <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: t.hairline }}>
                  <p className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: t.ink }}>
                    SAVE CARD / 笔记发布卡
                  </p>
                  <button onClick={onClose} aria-label="关闭" style={{ color: t.muted }}>
                    <X size={16} strokeWidth={1.8} />
                  </button>
                </div>

                <div className="px-5 pb-5 pt-5">
                  {/* 缩略预览（真实导出节点的等比缩小显示） */}
                  <div
                    className="relative overflow-hidden border"
                    style={{ borderColor: t.hairline, width: W * PREVIEW_SCALE, height: H * PREVIEW_SCALE }}
                  >
                    <div style={{ width: W, height: H, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <PublishCard issue={issue} />
                    </div>
                  </div>

                  {/* 状态 */}
                  <div className="mt-4 flex items-center gap-2">
                    {done ? (
                      <p className="flex items-center gap-1.5 text-[12.5px]" style={{ color: t.ink }}>
                        <Check size={14} strokeWidth={2.2} style={{ color: t.accent }} />
                        发布卡已保存，搭配你的照片发一篇笔记吧。
                      </p>
                    ) : (
                      <p className="text-[12.5px]" style={{ color: t.muted }}>
                        {busy ? '正在生成发布卡…' : '出门前存下它，拍完也能直接当笔记封面。'}
                      </p>
                    )}
                  </div>

                  {/* 按钮 */}
                  <motion.button
                    whileTap={{ scale: 0.985 }}
                    onClick={handleSave}
                    disabled={busy}
                    className="mt-4 flex w-full items-center justify-between px-5 py-3.5 disabled:opacity-70"
                    style={{
                      background: t.dark ? t.accent : t.ink,
                      color: t.dark ? '#171310' : t.paper,
                    }}
                  >
                    <span className="text-[14.5px] font-medium">
                      {done ? '再保存一张' : '保存 PNG'}
                    </span>
                    {busy ? (
                      <motion.span
                        className="block h-3 w-3 rounded-full border-[2px] border-current"
                        style={{ borderTopColor: 'transparent' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <Download size={16} strokeWidth={1.8} />
                    )}
                  </motion.button>

                  <p className="mt-3.5 text-center font-mono text-[9px] tracking-[0.22em]" style={{ color: t.muted }}>
                    {W} × {H} · PNG · 3:4
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* 真实导出节点：文档流外常驻，html2canvas 按其边界裁剪渲染 */}
      {open &&
        createPortal(
          <div className="ts-export-mount" ref={exportRef} aria-hidden>
            <PublishCard issue={issue} />
          </div>,
          document.body,
        )}
    </>
  )
}
