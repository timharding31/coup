import { useCallback } from 'react'
import type { MutableRefObject, RefCallback } from 'react'

type RefType<T> = MutableRefObject<T> | RefCallback<T> | null

export function useMergedRefs<T>(...refs: RefType<T>[]) {
  return useCallback((value: T) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null) {
        ref.current = value
      }
    })
  }, refs)
}
