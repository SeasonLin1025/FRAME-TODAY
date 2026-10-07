import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Ambient } from '../lib/theme'
import { EASE } from '../lib/utils'

const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/%3E%3C/svg%3E\")"

export default function AmbientBackdrop({ ambient }: { ambient: Ambient }) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      initial={{ backgroundColor: ambient.paper }}
      animate={{ backgroundColor: ambient.paper }}
      transition={{ duration: 0.9, ease: EASE }}
      aria-hidden
    >
      <EffectLayer key={ambient.effect} effect={ambient.effect} />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: GRAIN_URI, backgroundSize: '240px', opacity: ambient.grain, mixBlendMode: 'overlay' }}
      />
    </motion.div>
  )
}

function EffectLayer({ effect }: { effect: Ambient['effect'] }) {
  if (effect === 'rain') return <RainLayer count={26} />
  if (effect === 'night') return <NightLayer />
  if (effect === 'sun') return <SunLayer />
  if (effect === 'clouds') return <CloudLayer />
  return null
}

/** 雨丝：细线匀速下落，低频克制 */
function RainLayer({ count = 20 }: { count?: number }) {
  const drops = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        h: 44 + Math.random() * 66,
        dur: 1.35 + Math.random() * 1.15,
        delay: -Math.random() * 3,
        o: 0.04 + Math.random() * 0.09,
      })),
    [count],
  )
  return (
    <div className="absolute inset-0">
      {drops.map((d, i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: 0,
            width: 1,
            height: d.h,
            background: `linear-gradient(to bottom, transparent, rgba(233,231,223,${d.o}))`,
            transform: 'rotate(8deg)',
          }}
          animate={{ y: [-d.h - 60, '108vh'] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

/** 晴天：两团暖光缓慢漂移 */
function SunLayer() {
  return (
    <div className="absolute inset-0">
      {[
        { left: '8%', top: '6%', size: 300 },
        { left: '62%', top: '26%', size: 380 },
      ].map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(240,213,148,0.5) 0%, rgba(240,213,148,0) 65%)',
          }}
          animate={{ x: [0, 30, -14, 0], y: [0, -20, 12, 0] }}
          transition={{ duration: 24 + i * 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/** 阴天：宽幅云影横向漂移 */
function CloudLayer() {
  return (
    <div className="absolute inset-0">
      {[
        { top: '12%', size: 560, o: 0.5, dur: 34 },
        { top: '54%', size: 700, o: 0.32, dur: 46 },
      ].map((c, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: '-20%',
            top: c.top,
            width: c.size,
            height: c.size * 0.42,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(255,255,255,${c.o}) 0%, rgba(255,255,255,0) 68%)`,
          }}
          animate={{ x: [0, 140, 0] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/** 夜晚：微弱星点 + 底部一处暖光 */
function NightLayer() {
  const dots = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 60,
        size: 1.5 + Math.random() * 2,
        dur: 2 + Math.random() * 3.5,
      })),
    [],
  )
  return (
    <div className="absolute inset-0">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: 'rgba(242,200,121,0.7)',
          }}
          animate={{ opacity: [0.08, 0.5, 0.08] }}
          transition={{ duration: d.dur, repeat: Infinity, ease: 'easeInOut', delay: -Math.random() * 4 }}
        />
      ))}
      <motion.div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '-18%',
          width: 620,
          height: 480,
          marginLeft: -310,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(232,106,51,0.22) 0%, rgba(232,106,51,0) 62%)',
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
