import { motion } from 'framer-motion'
import type { Issue, Shot } from '../../data/types'
import { EASE, cx } from '../../lib/utils'

interface Props {
  issue: Issue
  shot: Shot
  index: number
}

const IMG = 'w-full object-cover aspect-[4/5]'

export default function ShotCard({ issue, shot, index }: Props) {
  const t = issue.theme
  const view = { once: true, margin: '-36px' } as const

  /* ---------- A. Soft Editorial：画册图版（主图 / 窄图 / 贴边图） ---------- */
  if (t.family === 'editorial') {
    const size = index === 0 ? 'w-full' : index === 1 ? 'w-[76%]' : 'w-[76%] ml-auto'
    return (
      <motion.figure
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={view}
        transition={{ duration: 0.62, ease: EASE, delay: index * 0.08 }}
        className={cx(size, index > 0 && 'pt-10')}
      >
        <img src={shot.image} alt={shot.title} loading="lazy" className={cx(IMG)} style={{ objectPosition: 'center' }} />
        <figcaption className="mt-4">
          <div className="flex items-baseline gap-3">
            <span className="shrink-0 font-mono text-[9.5px] font-bold tracking-[0.24em]" style={{ color: t.accent }}>
              TAKE {shot.no}
            </span>
            <span className="font-mono text-[9.5px] tracking-[0.18em]" style={{ color: t.muted }}>
              {shot.titleEn}
            </span>
          </div>
          <p className="mt-2 font-serif text-[17px] leading-7" style={{ color: t.ink }}>
            {shot.title}
          </p>
          <p className="mt-2 max-w-[36ch] text-[13px] leading-6" style={{ color: t.ink, opacity: 0.86 }}>
            {shot.action}
          </p>
          <p className="mt-1.5 max-w-[36ch] text-[11.5px] leading-5" style={{ color: t.muted }}>
            构图 · {shot.composition}
          </p>
        </figcaption>
      </motion.figure>
    )
  }

  /* ---------- B. Noir Film Strip：连续胶片帧（图大字少编号突出） ---------- */
  if (t.family === 'noir') {
    return (
      <motion.figure
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={view}
        transition={{ duration: 0.66, ease: EASE, delay: index * 0.1 }}
        className="border-b pb-8 pt-10"
        style={{ borderColor: t.hairline }}
      >
        <div className="flex items-baseline justify-between px-6">
          <div className="flex items-baseline gap-4">
            <span className="font-display text-[26px] leading-none" style={{ color: t.accent }}>
              {shot.no}
            </span>
            <span className="font-mono text-[10px] font-bold tracking-[0.26em]" style={{ color: t.muted }}>
              FRAME
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[9.5px] tracking-[0.2em]" style={{ color: t.muted }}>
              {shot.titleEn}
            </span>
            <span className="text-[15px] font-medium" style={{ color: t.ink }}>
              {shot.title}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <img src={shot.image} alt={shot.title} loading="lazy" className={cx(IMG)} style={{ objectPosition: 'center' }} />
        </div>
        <figcaption className="px-6 pt-4">
          <p className="max-w-[40ch] text-[13px] leading-6" style={{ color: t.ink, opacity: 0.9 }}>
            {shot.action}
          </p>
          <p className="mt-1.5 text-[11.5px] leading-5" style={{ color: t.muted }}>
            构图 · {shot.composition}
          </p>
        </figcaption>
      </motion.figure>
    )
  }

  /* ---------- C. Night Market Zine：左右错位 + 大橙编号 ---------- */
  const offset = index === 0 ? 'w-full' : index === 1 ? 'w-[86%] self-end' : 'w-[86%] self-start'
  return (
    <motion.figure
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={view}
      transition={{ duration: 0.64, ease: EASE, delay: index * 0.1 }}
      className={cx('flex flex-col', offset, index > 0 && 'pt-10')}
    >
      <div className="flex items-end justify-between px-1">
        <span className="font-display text-[38px] leading-[0.9]" style={{ color: t.accent }}>
          {shot.no}
        </span>
        <span className="pb-1 font-mono text-[9.5px] tracking-[0.22em]" style={{ color: t.muted }}>
          {shot.titleEn}
        </span>
      </div>
      <div className="mt-2">
        <img src={shot.image} alt={shot.title} loading="lazy" className={cx(IMG)} style={{ objectPosition: 'center' }} />
      </div>
      <figcaption className="px-1 pt-3">
        <p className="font-serif text-[16px]" style={{ color: t.ink }}>
          {shot.title}
        </p>
        <p className="mt-1.5 max-w-[40ch] text-[13px] leading-6" style={{ color: t.ink, opacity: 0.88 }}>
          {shot.action}
        </p>
        <p className="mt-1.5 text-[11.5px] leading-5" style={{ color: t.muted }}>
          构图 · {shot.composition}
        </p>
      </figcaption>
    </motion.figure>
  )
}
