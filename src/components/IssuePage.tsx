import { motion } from 'framer-motion'
import { ArrowLeft, Download } from 'lucide-react'
import type { Issue } from '../data/types'
import { EASE, today } from '../lib/utils'
import { CaptionStrip, FilmPalette, MonoRow, Pitfall, StripLabel, ZinePalette } from './issue/parts'
import ShotCard from './issue/ShotCard'

interface Props {
  issue: Issue
  onChange: () => void
  onDownload: () => void
}

/** 长标题折行：'SUNLIT SUNDAY' → ['SUNLIT','SUNDAY']；'NEON AFTER DARK' → ['NEON AFTER','DARK'] */
const titleLines = (s: string): string[] => {
  if (s.length > 10 && s.includes(' ')) {
    const i = s.lastIndexOf(' ')
    return [s.slice(0, i), s.slice(i + 1)]
  }
  return [s]
}

function Section({ children, mt = 12 }: { children: React.ReactNode; mt?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{ marginTop: mt }}
    >
      {children}
    </motion.section>
  )
}

export default function IssuePage({ issue, onChange, onDownload }: Props) {
  const t = issue.theme
  const fam = t.family

  const cta = (
    <Section mt={12}>
      <motion.button
        whileTap={{ scale: 0.985 }}
        onClick={onDownload}
        className="flex w-full items-center justify-between px-6 py-4"
        style={{
          background: fam === 'editorial' ? t.ink : t.accent,
          color: fam === 'editorial' ? t.paper : fam === 'zine' ? '#221108' : '#171310',
        }}
      >
        <span className="text-[15px] font-medium">保存为笔记发布卡</span>
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em]">
          PNG · 3:4 <Download size={16} strokeWidth={1.8} />
        </span>
      </motion.button>

      <div className="mt-9 text-center">
        <button onClick={onChange} className="text-[13px] underline underline-offset-4" style={{ color: t.muted }}>
          换一本刊页
        </button>
        <p className="mt-5 font-serif text-[15px]" style={{ color: t.muted }}>
          带上这张卡，出门去拍吧。
        </p>
      </div>
    </Section>
  )

  return (
    <div className="min-h-dvh pb-10" style={{ color: t.ink }}>
      {/* 置顶栏 */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between border-b px-6 py-3"
        style={{ background: t.paper, borderColor: t.hairline }}
      >
        <p className="font-mono text-[10px] tracking-[0.22em]" style={{ color: t.muted }}>
          ISSUE No.{issue.no} — {today()}
        </p>
        <div className="flex items-center gap-4">
          <button onClick={onChange} className="flex items-center gap-1.5 text-[12px]" style={{ color: t.muted }} aria-label="换一本刊页">
            <ArrowLeft size={13} strokeWidth={1.8} />
            换一本刊页
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] tracking-[0.16em]"
            style={{ borderColor: t.hairline, color: t.ink }}
            aria-label="保存发布卡"
          >
            <Download size={12} strokeWidth={1.8} />
            PNG
          </button>
        </div>
      </div>

      {/* ================= A. Soft Editorial ================= */}
      {fam === 'editorial' && (
        <>
          <div className="px-6 pt-9">
            <MonoRow issue={issue} left={`TODAY'S SHOOT`} right={`No.{issue.no}`} />
            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.22 }}
              className="mt-6 font-display text-[54px] leading-[0.95]"
              style={{ color: t.ink }}
            >
              {titleLines(issue.titleEn).map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 font-serif text-[13px] tracking-[0.14em]"
              style={{ color: t.muted }}
            >
              {issue.subtitle}
            </motion.p>
          </div>

          {/* Hero：出血印刷相纸 */}
          <motion.div
            initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="mt-8"
          >
            <img
              src={issue.assets.hero}
              alt={`${issue.titleEn} 主视觉`}
              className="aspect-[4/5] w-full object-cover"
              style={{ objectPosition: issue.heroFocus ?? 'center' }}
            />
            <div className="px-6">
              <MonoRow issue={issue} className="mt-2.5" left={`PLATE ${issue.no} — ${issue.titleEn}`} right={`TODAY'S SHOOT`} />
            </div>
          </motion.div>

          {/* 编辑导语 */}
          <Section mt={11}>
            <div className="px-6">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11.5px] font-bold tracking-[0.14em]" style={{ color: t.accent }}>
                  {issue.light.labelEn}
                </span>
                <span className="text-[11.5px]" style={{ color: t.muted }}>
                  {issue.light.labelZh}
                </span>
              </div>
              <p className="mt-5 max-w-[36ch] font-serif text-[17px] leading-[1.9]" style={{ color: t.ink }}>
                {issue.light.line}
              </p>
              <p className="mt-4 max-w-[34ch] font-serif text-[13.5px] leading-7" style={{ color: t.muted }}>
                {issue.description}
              </p>
            </div>
          </Section>

          {/* WINDOW / PALETTE / TAKE 合并 caption strip */}
          <Section mt={10}>
            <div className="px-6">
              <CaptionStrip issue={issue} />
            </div>
          </Section>

          {/* 三个镜头：主图 / 窄图 / 贴边图 */}
          <Section mt={12}>
            <div className="px-6">
              <StripLabel issue={issue} en="THE SHOTS" zh="三个照着拍的镜头" />
            </div>
            <div className="mt-8 flex flex-col">
              {issue.shots.map((s, i) => (
                <ShotCard key={s.no} issue={issue} shot={s} index={i} />
              ))}
            </div>
          </Section>

          <Section mt={12}>
            <div className="px-6">
              <Pitfall issue={issue} />
            </div>
          </Section>

          <div className="px-6">{cta}</div>
        </>
      )}

      {/* ================= B. Noir Film Strip ================= */}
      {fam === 'noir' && (
        <>
          {/* 首屏：Hero 大字压图 */}
          <motion.div
            initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 0.95, ease: EASE, delay: 0.12 }}
            className="relative h-[56dvh] min-h-[430px] overflow-hidden"
          >
            <img
              src={issue.assets.hero}
              alt={`${issue.titleEn} 主视觉`}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: issue.heroFocus ?? 'center' }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
              style={{ background: `linear-gradient(to bottom, transparent, ${t.paper})` }}
            />
            <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.42 }}
                className="font-display text-[58px] leading-[0.92]"
                style={{ color: t.ink }}
              >
                {titleLines(issue.titleEn).map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.58 }}
                className="mt-4 flex items-baseline gap-3"
              >
                <span className="font-mono text-[11px] font-bold tracking-[0.16em]" style={{ color: t.accent }}>
                  {issue.light.labelEn}
                </span>
                <span className="text-[11px]" style={{ color: t.muted }}>
                  {issue.light.labelZh}
                </span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.66 }}
                className="mt-2.5 max-w-[38ch] text-[13.5px] leading-6"
                style={{ color: t.ink }}
              >
                {issue.light.line}
              </motion.p>
            </div>
          </motion.div>

          <div className="px-6">
            <MonoRow issue={issue} className="mt-4" left={`ISSUE No.${issue.no} — ${issue.titleEn}`} right={today()} />

            {/* 小型 mono 索引：BEST WINDOW / TAKE */}
            <Section mt={8}>
              <div className="flex items-baseline justify-between gap-6 border-b pb-4" style={{ borderColor: t.hairline }}>
                <span className="shrink-0 font-mono text-[9.5px] tracking-[0.26em]" style={{ color: t.muted }}>
                  BEST WINDOW
                </span>
                <span className="text-right text-[13px] leading-6" style={{ color: t.ink }}>
                  {issue.window}
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-6">
                <span className="shrink-0 font-mono text-[9.5px] tracking-[0.26em]" style={{ color: t.muted }}>
                  TAKE
                </span>
                <span className="text-right text-[13px] leading-6" style={{ color: t.ink }}>
                  {issue.props.join('  /  ')}
                </span>
              </div>
            </Section>

            {/* 胶片色带 */}
            <Section mt={10}>
              <StripLabel issue={issue} en="PALETTE" zh="胶片色样" />
              <div className="mt-6">
                <FilmPalette issue={issue} />
              </div>
            </Section>
          </div>

          {/* 连续胶片帧 */}
          <Section mt={12}>
            <div className="px-6">
              <StripLabel issue={issue} en="THE SHOTS" zh="三个照着拍的镜头" />
            </div>
            <div className="mt-2 flex flex-col">
              {issue.shots.map((s, i) => (
                <ShotCard key={s.no} issue={issue} shot={s} index={i} />
              ))}
            </div>
          </Section>

          <Section mt={10}>
            <div className="px-6">
              <Pitfall issue={issue} />
            </div>
          </Section>

          <div className="px-6">{cta}</div>
        </>
      )}

      {/* ================= C. Night Market Zine ================= */}
      {fam === 'zine' && (
        <>
          {/* 首屏：夜市海报 */}
          <motion.div
            initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 0.95, ease: EASE, delay: 0.12 }}
            className="relative h-[58dvh] min-h-[440px] overflow-hidden"
          >
            <img
              src={issue.assets.hero}
              alt={`${issue.titleEn} 主视觉`}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: issue.heroFocus ?? 'center' }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%]"
              style={{ background: `linear-gradient(to bottom, transparent, ${t.paper})` }}
            />
            <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.42 }}
                className="font-display text-[54px] leading-[0.92]"
                style={{ color: t.accent }}
              >
                {titleLines(issue.titleEn).map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.58 }}
                className="mt-4 flex items-baseline gap-3"
              >
                <span className="font-mono text-[11px] font-bold tracking-[0.16em]" style={{ color: t.accent }}>
                  {issue.light.labelEn}
                </span>
                <span className="text-[11px]" style={{ color: t.muted }}>
                  {issue.light.labelZh}
                </span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.66 }}
                className="mt-2.5 max-w-[38ch] text-[13.5px] leading-6"
                style={{ color: t.ink }}
              >
                {issue.light.line}
              </motion.p>
            </div>
          </motion.div>

          <div className="px-6">
            <MonoRow issue={issue} className="mt-4" left={`ISSUE No.${issue.no} — ${issue.titleEn}`} right={today()} />

            {/* 摊位票据条 */}
            <Section mt={7}>
              <div className="border border-dashed px-4 py-3.5" style={{ borderColor: `rgba(232,144,90,0.5)` }}>
                <p className="font-mono text-[9.5px] font-bold tracking-[0.26em]" style={{ color: t.accent }}>
                  TIME / 出摊时间
                </p>
                <p className="mt-1.5 text-[13px] leading-6" style={{ color: t.ink }}>
                  {issue.window}
                </p>
              </div>
              <div className="mt-3 border border-dashed px-4 py-3.5" style={{ borderColor: `rgba(232,144,90,0.5)` }}>
                <p className="font-mono text-[9.5px] font-bold tracking-[0.26em]" style={{ color: t.accent }}>
                  TAKE / 带上摊
                </p>
                <p className="mt-1.5 text-[13px] leading-6" style={{ color: t.ink }}>
                  {issue.props.join('  /  ')}
                </p>
              </div>
            </Section>

            {/* 夜市色带 */}
            <Section mt={9}>
              <p className="font-mono text-[9.5px] tracking-[0.26em]" style={{ color: t.muted }}>
                PALETTE / 今晚配色
              </p>
              <div className="mt-3.5">
                <ZinePalette issue={issue} />
              </div>
            </Section>

            {/* 左右错位镜头 */}
            <Section mt={11}>
              <StripLabel issue={issue} en="THE SHOTS" zh="三个照着拍的镜头" />
              <div className="mt-8 flex flex-col">
                {issue.shots.map((s, i) => (
                  <ShotCard key={s.no} issue={issue} shot={s} index={i} />
                ))}
              </div>
            </Section>

            <Section mt={12}>
              <Pitfall issue={issue} />
            </Section>
          </div>

          <div className="px-6">{cta}</div>
        </>
      )}

      {/* 页脚 */}
      <div className="mt-14 px-6">
        <div
          className="flex items-center justify-between border-t pt-4 font-mono text-[9px] tracking-[0.2em]"
          style={{ borderColor: t.hairline, color: t.muted }}
        >
          <span>TODAY'S SHOOT</span>
          <span>
            ISSUE No.{issue.no} · {today()}
          </span>
        </div>
      </div>
    </div>
  )
}
