import type { AmbientEffect, Issue, WeatherId } from '../data/types'

export interface Ambient {
  paper: string
  ink: string
  muted: string
  accent: string
  hairline: string
  dark: boolean
  grain: number
  effect: AmbientEffect
}

/** 选择页初始（未选天气）的中性暖纸 */
export const NEUTRAL_AMBIENT: Ambient = {
  paper: '#EFEAE2',
  ink: '#33302A',
  muted: '#8A8272',
  accent: '#B5824C',
  hairline: 'rgba(51, 48, 42, 0.28)',
  dark: false,
  grain: 0.05,
  effect: 'none',
}

/** 首页 = 小雨 / WET FILM 示例氛围（DEMO PREVIEW） */
export const HOME_AMBIENT: Ambient = {
  paper: '#232720',
  ink: '#E9E7DF',
  muted: '#8E9484',
  accent: '#C0524C',
  hairline: 'rgba(233, 231, 223, 0.16)',
  dark: true,
  grain: 0.12,
  effect: 'rain',
}

export const WEATHER_AMBIENT: Record<WeatherId, Ambient> = {
  sunny: {
    paper: '#F2E8D5',
    ink: '#2E2A20',
    muted: '#7C7458',
    accent: '#B5824C',
    hairline: 'rgba(46, 42, 32, 0.3)',
    dark: false,
    grain: 0.05,
    effect: 'sun',
  },
  overcast: {
    paper: '#E9E8E4',
    ink: '#3B3934',
    muted: '#85827A',
    accent: '#626861',
    hairline: 'rgba(59, 57, 52, 0.26)',
    dark: false,
    grain: 0.04,
    effect: 'clouds',
  },
  rain: {
    paper: '#262A23',
    ink: '#E9E7DF',
    muted: '#8E9484',
    accent: '#C0524C',
    hairline: 'rgba(233, 231, 223, 0.16)',
    dark: true,
    grain: 0.12,
    effect: 'rain',
  },
  night: {
    paper: '#171D33',
    ink: '#EDEDF3',
    muted: '#8E93B5',
    accent: '#E8905A',
    hairline: 'rgba(237, 237, 243, 0.18)',
    dark: true,
    grain: 0.1,
    effect: 'night',
  },
}

/** 天气选择页（独立全屏页）的编辑氛围 */
export const WEATHER_PAGE_AMBIENT: Ambient = {
  paper: '#1B241F',
  ink: '#F1EDE4',
  muted: '#9AA39C',
  accent: '#7C3F3D',
  hairline: 'rgba(241, 237, 228, 0.16)',
  dark: true,
  grain: 0.07,
  effect: 'none',
}

export function ambientFromIssue(issue: Issue): Ambient {
  return {
    paper: issue.theme.paper,
    ink: issue.theme.ink,
    muted: issue.theme.muted,
    accent: issue.theme.accent,
    hairline: issue.theme.hairline,
    dark: issue.theme.dark,
    grain: issue.theme.grain,
    effect: issue.theme.effect,
  }
}
