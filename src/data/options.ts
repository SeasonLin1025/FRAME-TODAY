import type { WeatherId } from './types'

export interface WeatherOption {
  id: WeatherId
  label: string
  en: string
}

/** 只展示有刊页的四种天气；多云等组合在页脚以「筹备中」说明 */
export const WEATHERS: WeatherOption[] = [
  { id: 'sunny', label: '晴', en: 'SUNNY' },
  { id: 'overcast', label: '阴', en: 'OVERCAST' },
  { id: 'rain', label: '小雨', en: 'LIGHT RAIN' },
  { id: 'night', label: '夜晚', en: 'NIGHT' },
]

export const WEATHER_LABELS: Record<WeatherId, string> = {
  sunny: '晴天',
  overcast: '阴天',
  rain: '小雨',
  night: '夜晚',
}

/** 天气 → 可用刊页（策展映射，不是生成器） */
export const WEATHER_TO_ISSUES: Record<WeatherId, string[]> = {
  sunny: ['sunlit-sunday', 'city-shadows'],
  overcast: ['soft-grey', 'slow-museum'],
  rain: ['wet-film'],
  night: ['neon-after-dark'],
}

/** 天气光线样本卡（选择页）：每张卡用自己的色彩与纹理传递天气 */
export interface WeatherCardVisual {
  id: WeatherId
  label: string
  zhLine: string
  enLabel: string
  from: string
  to: string
  ink: string
  sub: string
}

export const WEATHER_CARDS: WeatherCardVisual[] = [
  { id: 'sunny', label: '晴', zhLine: '树影落下来', enLabel: 'SUN / DAPPLED', from: '#E7DEC1', to: '#C7BA8D', ink: '#332F1F', sub: '#6E6650' },
  { id: 'overcast', label: '阴', zhLine: '光线被揉开', enLabel: 'CLOUD / DIFFUSED', from: '#E7E6E1', to: '#D3D2CC', ink: '#3A3833', sub: '#787570' },
  { id: 'rain', label: '小雨', zhLine: '城市开始反光', enLabel: 'RAIN / REFLECTIVE', from: '#1F2A23', to: '#11190F', ink: '#E8EDE3', sub: '#97A29A' },
  { id: 'night', label: '夜晚', zhLine: '招牌亮起来', enLabel: 'NIGHT / LOW LIGHT', from: '#1B2440', to: '#0F162B', ink: '#EDEDF0', sub: '#97A0C0' },
]
