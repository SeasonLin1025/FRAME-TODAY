import { motion } from 'framer-motion'
import type { Issue } from '../../data/types'
import { EASE, copyText, cx } from '../../lib/utils'
import { useToast } from '../Toast'

/* ---------- 通用：极小 mono 行（页码/索引用） ---------- */
export function MonoRow({
  left,
  right,
  issue,
  className,
}: {
  left: string
  right?: string
  issue: Issue
  className?: string
}) {
  const t = issue.theme
  return (
    <div className={cx('flex items-baseline justify-between font-mono text-[9px] tracking-[0.26em]', className)} style={{ color: t.muted }}>
      <span>{left}</span>
      {right ? <span>{right}</span> : null}
    </div>
  )
}

/* ---------- 通用：分区小标签 ---------- */
export function StripLabel({ en, zh, issue }: { en: string; zh: string; issue: Issue }) {
  const t = issue.theme
  return (
    <div className="flex items-center gap-3.5">
      <p className="shrink-0 font-mono text-[10px] tracking-[0.3em]" style={{ color: t.muted }}>
        {en}
      </p>
      <p className="shrink-0 text-[9px] tracking-[0.3em]" style={{ color: t.muted, opacity: 0.75 }}>
        {zh}
      </p>
      <span className="mt-[6px] block flex-1 border-t" style={{ borderColor: t.hairline }} />
    </div>
  )
}

/* ---------- Soft Editorial：合并 caption strip（WINDOW / PALETTE / TAKE 一条带） ---------- */
export function CaptionStrip({ issue }: { issue: Issue }) {
  const t = issue.theme
  const toast = useToast()

  return (
    <div className="border-y py-5" style={{ borderColor: t.hairline }}>
      <div className="flex items-baseline justify-between gap-6">
        <span className="shrink-0 font-mono text-[9.5px] tracking-[0.26em]" style={{ color: t.muted }}>
          WINDOW
        </span>
        <span className="text-right font-serif text-[13.5px] leading-6" style={{ color: t.ink }}>
          {issue.window}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="shrink-0 font-mono text-[9.5px] tracking-[0.26em]" style={{ color: t.muted }}>
          PALETTE
        </span>
        <div className="flex flex-1 items-center justify-end gap-4">
          {issue.palette.map((c) => (
            <motion.button
              key={c.hex}
              whileTap={{ scale: 0.9 }}
              onClick={async () => {
                if (await copyText(c.hex)) toast(`已复制色值 ${c.hex}`)
              }}
              className="flex items-center gap-1.5"
              aria-label={`复制色值 ${c.hex}`}
            >
              <span className="block h-[13px] w-[13px]" style={{ background: c.hex, border: `1px solid ${t.hairline}` }} />
              <span className="font-mono text-[9px] tracking-[0.08em]" style={{ color: t.muted }}>
                {c.hex}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-6">
        <span className="shrink-0 font-mono text-[9.5px] tracking-[0.26em]" style={{ color: t.muted }}>
          TAKE
        </span>
        <span className="text-right text-[13px]" style={{ color: t.ink }}>
          {issue.props.join('  /  ')}
        </span>
      </div>
    </div>
  )
}

/* ---------- Noir：胶片色带（连续横向 + 齿孔，点击复制） ---------- */
export function FilmPalette({ issue }: { issue: Issue }) {
  const t = issue.theme
  const toast = useToast()
  const hole = {
    backgroundImage: `radial-gradient(circle, ${t.paper} 1.6px, transparent 1.7px)`,
    backgroundSize: '14px 100%',
    backgroundRepeat: 'repeat-x',
  }

  return (
    <div>
      <div className="h-[7px]" style={{ ...hole, background: t.ink, opacity: 0.85 }} />
      <div className="flex">
        {issue.palette.map((c) => (
          <motion.button
            key={c.hex}
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              if (await copyText(c.hex)) toast(`已复制色值 ${c.hex}`)
            }}
            className="flex-1"
            style={{ background: c.hex }}
            aria-label={`复制色值 ${c.hex}`}
          >
            <span className="block h-[30px] w-full" />
          </motion.button>
        ))}
      </div>
      <div className="h-[7px]" style={{ ...hole, background: t.ink, opacity: 0.85 }} />
      <div className="mt-3 flex">
        {issue.palette.map((c) => (
          <p key={c.hex} className="flex-1 text-center font-mono text-[9px] tracking-[0.12em]" style={{ color: t.muted }}>
            {c.name} {c.hex}
          </p>
        ))}
      </div>
    </div>
  )
}

/* ---------- Zine：夜市色带（连续横条 + 橙描边） ---------- */
export function ZinePalette({ issue }: { issue: Issue }) {
  const t = issue.theme
  const toast = useToast()

  return (
    <div>
      <div className="flex" style={{ border: `1.5px solid ${t.accent}` }}>
        {issue.palette.map((c, i) => (
          <motion.button
            key={c.hex}
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              if (await copyText(c.hex)) toast(`已复制色值 ${c.hex}`)
            }}
            className={cx('flex-1', i > 0 && 'border-l')}
            style={{ background: c.hex, borderColor: t.accent }}
            aria-label={`复制色值 ${c.hex}`}
          >
            <span className="block h-[24px] w-full" />
          </motion.button>
        ))}
      </div>
      <div className="mt-2.5 flex">
        {issue.palette.map((c) => (
          <p key={c.hex} className="flex-1 font-mono text-[9px] tracking-[0.1em]" style={{ color: t.muted }}>
            {c.name}·{c.hex}
          </p>
        ))}
      </div>
    </div>
  )
}

/* ---------- 避雷：三体系 ---------- */
export function Pitfall({ issue }: { issue: Issue }) {
  const t = issue.theme

  if (t.family === 'noir') {
    return (
      <div className="border-l-[3px] py-1 pl-4" style={{ borderColor: t.accent, background: t.card }}>
        <div className="px-3 py-3.5">
          <p className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: t.accent }}>
            避雷 / DON'T
          </p>
          <p className="mt-2.5 text-[13.5px] leading-7" style={{ color: t.ink }}>
            {issue.pitfall}
          </p>
        </div>
      </div>
    )
  }

  if (t.family === 'zine') {
    return (
      <div
        className="border border-dashed px-5 py-4"
        style={{ borderColor: `rgba(232,144,90,0.55)`, background: 'rgba(232,144,90,0.07)' }}
      >
        <p className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: t.accent }}>
          避雷 / DON'T
        </p>
        <p className="mt-2.5 text-[13.5px] leading-7" style={{ color: t.ink }}>
          {issue.pitfall}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.55, ease: EASE }}
      className="border-l-[2px] py-1 pl-4"
      style={{ borderColor: t.accent }}
    >
      <p className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: t.accent }}>
        避雷 / DON'T
      </p>
      <p className="mt-2.5 max-w-[36ch] text-[13.5px] leading-7" style={{ color: t.ink }}>
        {issue.pitfall}
      </p>
    </motion.div>
  )
}
