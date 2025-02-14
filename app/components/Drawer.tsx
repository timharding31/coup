import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useMergedRefs } from '~/hooks/useMergedRefs'

const drawerHeightAtom = atom<number | null>(null)

export const useDrawerHeight = () => useAtomValue(drawerHeightAtom)

const Drawer = ({
  shouldScaleBackground = true,
  dismissible = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} dismissible={dismissible} {...props} />
)
Drawer.displayName = 'Drawer'

const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerClose = DrawerPrimitive.Close
const DrawerPortal = DrawerPrimitive.Portal

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay ref={ref} className={`fixed inset-0 z-60 ${className}`} {...props} />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, forwardedRef) => {
  const setDrawerHeight = useSetAtom(drawerHeightAtom)
  const ref = useMergedRefs(forwardedRef, node => {
    if (node) {
      setDrawerHeight(node.clientHeight)
    } else {
      setDrawerHeight(null)
    }
  })
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={`
        fixed left-max right-max bottom-0 z-50 flex h-auto flex-col 
        rounded-t-[24px] bg-nord-1 nord-shadow
        slide-in-from-bottom duration-500
        pb-4
        ${className}`}
        {...props}
      >
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = DrawerPrimitive.Content.displayName

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent }

// function getDrawerContainer() {
//   if (typeof window === 'undefined') {
//     return null
//   }
//   return document.getElementById('root')!
// }
