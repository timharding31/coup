export const nonNil = <T extends {}>(val?: T | null): val is T => !!val

export function isEqual<T = string>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
