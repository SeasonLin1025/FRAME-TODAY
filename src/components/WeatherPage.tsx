import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { WeatherId } from '../data/types'
import { WEATHER_CARDS } from '../data/options'
import { EASE } from '../lib/utils'

/**
 * 天气选择页 · 独立全屏（100dvh 无滚动）。
 * 四张「天气光线样本」：以各自色彩 / 纹理 / 排版传递天气，而非图标按钮。
 * 选中 → 卡片右移 6px + 箭头出现 + 其余降透明 → 转场进入该天气的刊页选片墙。
 */
interface Props {
  onWeather: (w: WeatherId) => void
  onBack: () => void
}

/** 每张卡的专属纹理层 */
function Texture({ id }: { id: WeatherId }) {
  if (id === 'sunny') {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 90px 46px at 18% 30%, rgba(58,66,32,0.16), transparent 70%)',
            'radial-gradient(ellipse 130px 60px at 62% 70%, rgba(58,66,32,0.13), transparent 70%)',
            'radial-gradient(ellipse 70px 34px at 86% 22%, rgba(58,66,32,0.18), transparent 70%)',
            'radial-gradient(ellipse 110px 50px at 38% 88%, rgba(58,66,32,0.10), transparent 70%)',
          ].join(','),
        }}
      />
    )
  }
  if (id === 'overcast') {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 180px 90px at 24% -12%, rgba(255,255,255,0.6), transparent 70%)',
        }}
      />
    )
  }
  if (id === 'rain') {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(100deg, transparent 0 24px, rgba(226,232,222,0.075) 24px 25px, transparent 25px 48px)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 150px 60px at 84% 108%, rgba(124,63,61,0.4), transparent 70%)',
          }}
        />
      </>
    )
  }
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: [
          'radial-gradient(ellipse 70px 44px at 82% 30%, rgba(232,106,51,0.30), transparent 72%)',
          'radial-gradient(ellipse 44px 28px at 64% 78%, rgba(242,200,121,0.22), transparent 72%)',
          'radial-gradient(ellipse 30px 20px at 22% 58%, rgba(232,106,51,0.14), transparent 72%)',
        ].join(','),
      }}
    />
  )
}

export default function WeatherPage({ onWeather, onBack }: Props) {
  const [sel, setSel] = useState<WeatherId | null>(null)

  const pick = (w: WeatherId) => {
    if (sel) return
    setSel(w)
    setTimeout(() => onWeather(w), 420)
  }

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: '100dvh', minHeight: '100dvh', padding: '18px 20px 16px', color: '#F1EDE4' }}
    >
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
          aria-label="返回首页"
        >
          <ArrowLeft size={13} strokeWidth={1.8} /> HOME
        </button>
        <span className="font-mono text-[10px] tracking-[0.22em]" style={{ color: '#9AA39C' }}>
          01 / 04
        </span>
      </motion.div>

      {/* 主标题 */}
      <div className="mt-7">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="font-serif text-[30px] font-normal leading-[1.35]"
        >
          <span className="block">今天的天，</span>
          <span className="block">像哪一种光？</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.24 }}
          className="mt-2.5 text-[12.5px] leading-6"
          style={{ color: '#9AA39C' }}
        >
          选一束光，再翻开它的拍摄刊页。
        </motion.p>
      </div>

      {/* 光线样本卡 */}
      <div className="mt-6 flex min-h-0 flex-1 flex-col gap-3">
        {WEATHER_CARDS.map((w, i) => {
          const active = sel === w.id
          const dimmed = sel !== null && !active
          return (
            <motion.button
              key={w.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: dimmed ? 0.45 : 1, x: active ? 6 : 0, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 + i * 0.08, opacity: { duration: 0.3 }, x: { duration: 0.25, ease: EASE } }}
              whileTap={{ scale: 0.99 }}
              onClick={() => pick(w.id)}
              className="relative min-h-0 flex-1 overflow-hidden rounded-[3px] text-left"
              style={{ maxWidth: 560, minHeight: 84, maxHeight: 112, background: `linear-gradient(118deg, ${w.from}, ${w.to})`, color: w.ink }}
              aria-label={`选择天气：${w.label}`}
            >
              <Texture id={w.id} />
              <span className="relative flex h-full items-center justify-between px-5">
                <span className="flex flex-col">
                  <span className="font-serif text-[19px] leading-[1.2]">{w.label}</span>
                  <span className="mt-1 text-[12px]" style={{ color: w.sub }}>
                    {w.zhLine}
                  </span>
                </span>
                <span className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em]" style={{ color: w.sub }}>
                  {w.enLabel}
                  <motion.span animate={{ opacity: active ? 1 : 0, x: active ? 0 : -4 }} transition={{ duration: 0.22 }}>
                    <ArrowRight size={14} strokeWidth={2} style={{ color: w.ink }} />
                  </motion.span>
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
