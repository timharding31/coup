export const nonNil = <T extends {}>(val?: T | null): val is T => !!val
