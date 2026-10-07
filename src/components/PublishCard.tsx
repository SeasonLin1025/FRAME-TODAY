import type { Issue } from '../data/types'
import { today } from '../lib/utils'

/**
 * 笔记发布卡 · 严格 1242 × 1660（3:4，小红书图文比例）
 *
 * html2canvas 导出兼容约束（本组件内禁止）：
 * - box-shadow / text-shadow（不支持，会被忽略）
 * - transform / mix-blend-mode（渲染不可靠）
 * - oklch 色值（解析失败导致空白）
 * 图片一律用 background-image（object-fit 在 html2canvas 中支持不完整）。
 */
export default function PublishCard({ issue }: { issue: Issue }) {
  const t = issue.theme
  const MONO = "'Space Mono', 'Noto Sans SC', monospace"
  const SERIF = "'Noto Serif SC', 'Songti SC', serif"
  const SANS = "'Noto Sans SC', sans-serif"

  return (
    <div
      style={{
        width: 1242,
        height: 1660,
        backgroundColor: t.paper,
        color: t.ink,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '72px 72px 60px',
        boxSizing: 'border-box',
        fontFamily: SANS,
      }}
    >
      {/* 索引行 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontFamily: MONO,
          fontSize: 21,
          letterSpacing: '0.26em',
          color: t.muted,
        }}
      >
        <span style={{ color: t.ink, fontWeight: 700 }}>TODAY'S SHOOT</span>
        <span>ISSUE No.{issue.no}</span>
        <span>{today()}</span>
      </div>
      <div style={{ height: 1, backgroundColor: t.hairline, marginTop: 26 }} />

      {/* 主视觉 */}
      <div
        style={{
          marginTop: 44,
          width: '100%',
          height: 780,
          backgroundImage: `url(${issue.assets.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: issue.heroFocus ?? 'center',
          border: `1px solid ${t.hairline}`,
          boxSizing: 'border-box',
        }}
      />

      {/* 强标题 */}
      <div style={{ marginTop: 52 }}>
        <div style={{ width: 72, height: 8, backgroundColor: t.accent }} />
        <h1
          style={{
            margin: '30px 0 0',
            fontFamily: SERIF,
            fontWeight: 900,
            fontSize: 82,
            lineHeight: 1.16,
            letterSpacing: '0.02em',
          }}
        >
          {issue.cardTitle}
        </h1>
      </div>

      {/* 元信息：刊名 + 用户路径 */}
      <div
        style={{
          marginTop: 34,
          display: 'flex',
          alignItems: 'baseline',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.1em' }}>
          {issue.titleEn}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 21, color: t.muted, letterSpacing: '0.06em' }}>
          {issue.path.weather} · {issue.path.scene} · {issue.path.mood}
        </span>
      </div>

      {/* TODAY'S LIGHT */}
      <div style={{ marginTop: 28, display: 'flex', alignItems: 'baseline', gap: 20 }}>
        <span style={{ fontFamily: MONO, fontSize: 19, letterSpacing: '0.3em', color: t.muted }}>TODAY'S LIGHT</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.1em', color: t.accent }}>
          {issue.light.labelEn}
        </span>
        <span style={{ fontSize: 21, color: t.muted }}>{issue.light.labelZh}</span>
      </div>

      {/* 三个镜头标题 */}
      <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {issue.shots.map((s) => (
          <div
            key={s.no}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 26,
              padding: '24px 0',
              borderTop: `1px solid ${t.hairline}`,
            }}
          >
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: t.accent }}>{s.no}</span>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, letterSpacing: '0.02em' }}>
              {s.title}
            </span>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${t.hairline}` }} />
      </div>

      {/* 极小低对比署名：靠右缘，不抢内容 */}
      <div
        style={{
          marginTop: 'auto',
          textAlign: 'right',
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: '0.4em',
          color: t.muted,
          opacity: 0.62,
        }}
      >
        TODAY'S SHOOT
      </div>
    </div>
  )
}
