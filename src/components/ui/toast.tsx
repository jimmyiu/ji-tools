import * as React from 'react'
import { Toast as ToastPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitive.Provider

const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-[calc(var(--nav-bottom-offset)+1rem)] left-1/2 z-[60] flex max-h-[100svh] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 outline-none',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      'group pointer-events-auto relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-4 text-center text-card-foreground shadow-lg data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-full data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-full',
      className
    )}
    {...props}
  />
))
Toast.displayName = ToastPrimitive.Root.displayName

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-xs text-muted-foreground', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

export {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
}
