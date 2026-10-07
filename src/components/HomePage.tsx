import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { DEMO_ISSUE } from '../data/issues'
import { EASE } from '../lib/utils'

/**
 * 首页 = 电影海报式摄影刊物封面，严格 100dvh 一屏。
 * 上段（约 62dvh）：全幅出血 Hero + 压图排版（WET FILM 大字 + 副题 + 索引）。
 * 下段（约 38dvh）：深墨绿编辑栏（主张两行 + 编辑目录入口 + 天气索引）。
 */
const C = {
  paper: '#17211D',
  ink: '#F4F0E8',
  muted: '#A2AAA3',
  wine: '#7C3F3D',
  cta: '#F1ECE1',
}

const demo = DEMO_ISSUE

export default function HomePage({ onStart }: { onStart: () => void }) {
  const [pressed, setPressed] = useState(false)
  const [hover, setHover] = useState(false)

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', minHeight: '100dvh', color: C.ink }}>
      {/* ============ 上段：全幅 Hero 封面摄影 ============ */}
      <section className="relative min-h-0 flex-[62] overflow-hidden">
        <motion.img
          src={demo.assets.hero}
          alt="WET FILM · 雨夜街头"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: '62% 45%' }}
          initial={{ scale: 1.05, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: EASE }}
        />
        {/* 顶部轻暗压：保证索引行可读 */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[90px]"
          style={{ background: 'linear-gradient(to bottom, rgba(23,33,29,0.52), rgba(23,33,29,0))' }}
        />
        {/* 底部深墨绿渐变：衔接编辑栏 */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%]"
          style={{ background: 'linear-gradient(to top, #17211D 4%, rgba(23,33,29,0.62) 42%, rgba(23,33,29,0) 100%)' }}
        />

        {/* 顶部索引（压图） */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
          className="absolute inset-x-0 top-0 flex items-baseline justify-between px-5 pt-[18px]"
        >
          <span className="font-mono text-[10px] font-bold tracking-[0.32em]" style={{ color: 'rgba(244,240,232,0.92)' }}>
            TODAY'S SHOOT
          </span>
          <span className="font-mono text-[10px] tracking-[0.22em]" style={{ color: 'rgba(244,240,232,0.62)' }}>
            ISSUE 05 / PREVIEW
          </span>
        </motion.div>

        {/* 封面主标题（压图左下，避开人物） */}
        <div className="absolute bottom-0 left-0 px-5 pb-5">
          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.26 }}
            className="font-display text-[70px] leading-[0.86] tracking-[0.01em]"
            style={{ color: C.ink, textShadow: '0 2px 24px rgba(10,16,13,0.45)' }}
          >
            WET
            <br />
            FILM
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.44 }}
            className="mt-3 font-serif text-[15px] leading-6"
            style={{ color: 'rgba(244,240,232,0.92)' }}
          >
            {demo.cardTitle}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.55 }}
            className="mt-1.5 font-mono text-[10px] tracking-[0.22em]"
            style={{ color: 'rgba(162,170,163,0.9)' }}
          >
            {demo.path.weather} / {demo.path.scene} / {demo.path.mood}
          </motion.p>
        </div>
      </section>

      {/* ============ 下段：编辑栏 ============ */}
      <section className="flex min-h-0 flex-[38] flex-col px-5" style={{ background: C.paper }}>
        {/* 主张 */}
        <div className="pt-5">
          <motion.h2
            className="font-serif text-[25px] font-normal leading-[1.42]"
            style={{ color: C.ink }}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
            >
              每一种天气，
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.68 }}
            >
              都有自己的镜头。
            </motion.span>
          </motion.h2>
        </div>

        {/* 编辑索引 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.72 }}
          className="mt-auto flex items-baseline gap-2.5 pb-2.5 font-mono text-[10px] tracking-[0.22em]"
          style={{ color: C.muted }}
        >
          <span>[ 01 ]</span>
          <span>TODAY'S ENTRY</span>
        </motion.div>

        {/* 主 CTA：实体按钮（点击态：暗酒红底 + 奶油字 + 箭头右移） */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.8 }}
          whileTap={{ y: 1 }}
          onClick={() => {
            setPressed(true)
            setTimeout(onStart, 170)
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="flex h-[62px] w-full items-center justify-between rounded-[2px] px-6"
          style={{
            background: pressed ? C.wine : C.cta,
            color: pressed ? '#F4F0E8' : '#13211D',
            boxShadow: pressed ? 'none' : '0 10px 24px rgba(0,0,0,0.28)',
            cursor: 'pointer',
          }}
          aria-label="今天拍什么，开始选择天气"
        >
          <span className="text-[16px] font-medium">今天拍什么</span>
          <motion.span
            className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.26em]"
            animate={{ x: pressed ? 5 : hover ? 3 : 0 }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            START
            <ArrowRight size={15} strokeWidth={2} />
          </motion.span>
        </motion.button>

        {/* 天气索引 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.94 }}
          className="py-3.5 text-center font-mono text-[10px] tracking-[0.34em]"
          style={{ color: C.muted }}
        >
          晴 / 阴 / 小雨 / 夜晚
        </motion.p>
      </section>
    </div>
  )
}
