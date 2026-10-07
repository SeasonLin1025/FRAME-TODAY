import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Issue, WeatherId } from '../data/types'
import { ISSUES } from '../data/issues'
import { WEATHER_TO_ISSUES } from '../data/options'
import { EASE } from '../lib/utils'

/**
 * 刊页选片墙（编辑部选片，非商品卡）。
 * 图片承担 80% 视觉，文字压在图底渐变上；两卡错落（宽/窄、左/右），形成编辑跨页感。
 */

/** 每本刊的图底渐变基调（压字用深色） */
const OVERLAY_DARK: Record<string, string> = {
  'sunlit-sunday': '#2A3220',
  'city-shadows': '#0F0F0F',
  'soft-grey': '#3E362C',
  'slow-museum': '#232323',
  'wet-film': '#101711',
  'neon-after-dark': '#0E1526',
}

function hexRgba(hex: string, a: number) {
  const h = hex.replace('#', '')
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`
}

interface Props {
  weather: WeatherId
  onIssue: (id: string) => void
  onBack: () => void
}

export default function IssueSelectPage({ weather, onIssue, onBack }: Props) {
  const issues = ISSUES.filter((i) => WEATHER_TO_ISSUES[weather].includes(i.id))

  /** 错落布局：两本时首卡全宽居左、次卡 87% 偏右 */
  const layouts: { width: string; ml: number | 'auto' }[] =
    issues.length === 2
      ? [{ width: '100%', ml: 0 }, { width: '87%', ml: 'auto' }]
      : [{ width: '100%', ml: 0 }]

  return (
    <div className="min-h-dvh" style={{ padding: '18px 20px 24px', color: '#F1EDE4' }}>
      {/* 顶部索引 */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-baseline justify-between"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.22em]"
          style={{ color: '#9AA39C' }}
          aria-label="换一种天气"
        >
          <ArrowLeft size={13} strokeWidth={1.8} /> 换一种天气
        </button>
        <span className="font-mono text-[10px] tracking-[0.22em]" style={{ color: '#9AA39C' }}>
          02 / 04
        </span>
      </motion.div>

      {/* 主标题 */}
      <div className="mt-7">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="font-serif text-[29px] font-normal leading-[1.35]"
        >
          <span className="block">今天这束光，</span>
          <span className="block">适合哪一种镜头？</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.24 }}
          className="mt-2.5 text-[12.5px] leading-6"
          style={{ color: '#9AA39C' }}
        >
          从这一束光里，选一本想带走的刊页。
        </motion.p>
      </div>

      {/* 选片墙 */}
      <div className="mt-7 flex flex-col gap-7 pb-4">
        {issues.map((issue, i) => (
          <IssueWallCard key={issue.id} issue={issue} layout={layouts[i]} delay={0.3 + i * 0.12} onOpen={onIssue} />
        ))}
      </div>
    </div>
  )
}

function IssueWallCard({
  issue,
  layout,
  delay,
  onOpen,
}: {
  issue: Issue
  layout: { width: string; ml: number | 'auto' }
  delay: number
  onOpen: (id: string) => void
}) {
  const dark = OVERLAY_DARK[issue.id] ?? '#111111'
  const cream = 'rgba(244,240,232,0.94)'

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onOpen(issue.id)}
      className="group relative block aspect-[4/5] overflow-hidden rounded-[3px] text-left"
      style={{ width: layout.width, marginLeft: layout.ml || undefined }}
      aria-label={`打开 ${issue.titleEn}`}
    >
      {/* 摄影（80% 视觉） */}
      <img
        src={issue.assets.hero}
        alt={`${issue.titleEn} 封面`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        style={{ objectPosition: issue.heroFocus ?? 'center' }}
      />
      {/* 图底渐变（压字） */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${hexRgba(dark, 0.96)} 6%, ${hexRgba(dark, 0.55)} 38%, ${hexRgba(dark, 0.08)} 68%, transparent 100%)`,
        }}
      />

      {/* 压图信息 */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-4">
        <div className="min-w-0">
          <p className="font-mono text-[9px] tracking-[0.26em]" style={{ color: 'rgba(244,240,232,0.68)' }}>
            ISSUE No.{issue.no}
          </p>
          <h2 className="mt-1.5 font-display text-[30px] leading-[0.95]" style={{ color: cream }}>
            {issue.titleEn}
          </h2>
          <p className="mt-2 text-[12.5px] leading-5" style={{ color: 'rgba(244,240,232,0.82)' }}>
            {issue.oneLiner}
          </p>
          <p className="mt-1 font-mono text-[9.5px] tracking-[0.1em]" style={{ color: 'rgba(244,240,232,0.6)' }}>
            {issue.path.scene} / {issue.path.mood}
          </p>
        </div>
        {/* OPEN：与图内文案整合的入口 */}
        <span
          className="mb-[3px] flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[9.5px] tracking-[0.18em]"
          style={{ borderColor: 'rgba(244,240,232,0.35)', background: 'rgba(10,14,11,0.30)', color: cream }}
        >
          OPEN
          <ArrowRight size={11} strokeWidth={2} />
        </span>
      </div>
    </motion.button>
  )
}
