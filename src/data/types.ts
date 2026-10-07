export type WeatherId = 'sunny' | 'overcast' | 'rain' | 'night'

/** 三套杂志版式体系：A Soft Editorial / B Noir Film Strip / C Night Market Zine */
export type Family = 'editorial' | 'noir' | 'zine'

export type AmbientEffect = 'none' | 'sun' | 'clouds' | 'rain' | 'night'

export interface PaletteColor {
  name: string
  hex: string
}

export interface Shot {
  no: string
  /** 镜头英文代号（版面主标识） */
  titleEn: string
  /** 镜头中文标题 */
  title: string
  /** 动作说明（每张最多两句） */
  action: string
  /** 构图说明（小字 caption） */
  composition: string
  image: string
}

export interface IssuePath {
  weather: string
  scene: string
  mood: string
}

export interface IssueTheme {
  family: Family
  /** 纸面底色 */
  paper: string
  /** 正文墨色 */
  ink: string
  /** 次级文字色 */
  muted: string
  /** 强调色 */
  accent: string
  /** 细线/边框色（rgba） */
  hairline: string
  /** 镜头卡底色（深色刊物用） */
  card: string
  dark: boolean
  /** 页面颗粒强度 0–1 */
  grain: number
  effect: AmbientEffect
  /** 镜头卡图片比例：wide=16:10 横幅（默认），portrait=4:5 竖幅（实拍竖图用，避免拦腰裁切） */
  shotImageRatio?: 'wide' | 'portrait'
}

export interface Issue {
  id: string
  no: string
  titleEn: string
  subtitle: string
  weatherId: WeatherId
  path: IssuePath
  /** hero 图焦点（CSS object-position / background-position），实拍图替换后可微调裁切 */
  heroFocus?: string
  /** 封面卡上的一句短句 */
  oneLiner: string
  light: {
    labelEn: string
    labelZh: string
    /** 可行动的光线判断 */
    line: string
  }
  /** 推荐拍摄时间 */
  window: string
  /** 光线说明（文学感段落） */
  description: string
  palette: PaletteColor[]
  props: string[]
  shots: Shot[]
  pitfall: string
  /** 发布卡强标题 */
  cardTitle: string
  theme: IssueTheme
  assets: {
    hero: string
    shots: string[]
  }
}
