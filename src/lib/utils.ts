export const cx = (...xs: Array<string | false | undefined | null>) =>
  xs.filter(Boolean).join(' ')

/** 编辑日期：YYYY.MM.DD */
export function today(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

/** framer-motion 共用缓动（写成元组避免 TS 类型问题） */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
