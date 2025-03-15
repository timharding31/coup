import React, { useEffect } from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import classNames from 'classnames'

const drawerHeightAtom = atom<number | null>(null)
const drawerOpenAtom = atom(false)
export const useDrawerHeight = () => useAtomValue(drawerHeightAtom)
export const useIsDrawerOpen = () => useAtomValue(drawerOpenAtom)
export const useDrawerOpenAtom = () => useAtom(drawerOpenAtom)

const Drawer: React.FC<React.ComponentProps<typeof DrawerPrimitive.Root>> = ({
  shouldScaleBackground = true,
  dismissible = false,
  onOpenChange,
  ...props
}) => {
  const [isOpen, setIsOpen] = useDrawerOpenAtom()
  useEffect(() => {
    setIsOpen(true)
  }, [])
  return (
    <DrawerPrimitive.Root
      {...props}
      shouldScaleBackground={shouldScaleBackground}
      dismissible={dismissible}
      open={dismissible ? isOpen : true}
      onOpenChange={value => {
        setIsOpen(value)
        onOpenChange?.(value)
      }}
    />
  )
}

const DrawerClose = DrawerPrimitive.Close
const DrawerPortal = DrawerPrimitive.Portal

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay ref={ref} className={`fixed inset-0 z-50 ${className}`} {...props} />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, forwardedRef) => {
  const setDrawerHeight = useSetAtom(drawerHeightAtom)
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={forwardedRef}
        onOpenAutoFocus={e => {
          if (e.target && e.target instanceof HTMLElement) {
            const height = e.target.clientHeight
            setDrawerHeight(height)
          }
        }}
        onCloseAutoFocus={e => setDrawerHeight(null)}
        className={classNames(
          'fixed left-max right-max bottom-0 z-50 flex h-auto flex-col  rounded-t-[24px] bg-nord-1 nord-shadow drawer duration-500 pb-4',
          className
        )}
        {...props}
      >
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = DrawerPrimitive.Content.displayName

export { Drawer, DrawerClose, DrawerContent }

// function getDrawerContainer() {
//   if (typeof window === 'undefined') {
//     return null
//   }
//   return document.getElementById('root')!
// }
