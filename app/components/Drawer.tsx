import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

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
  <DrawerPrimitive.Overlay
    ref={ref}
    className={`fixed inset-0 z-50 animate-in fade-in duration-300 ${className}`}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal container={getDrawerContainer()}>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={`
        fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col 
        rounded-t-[24px] bg-ui nord-shadow
        animate-in slide-in-from-bottom duration-500
        ${className}`}
      {...props}
    >
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = DrawerPrimitive.Content.displayName

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent }

function getDrawerContainer() {
  if (typeof window === 'undefined') {
    return null
  }
  return document.getElementById('root')!
}
