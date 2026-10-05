import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { SectionHeader } from './SectionHeader'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'

interface ResponsiveOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}

export function ResponsiveOverlay({ open, onOpenChange, title, children }: ResponsiveOverlayProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const closeButton = (
    <button
      type="button"
      aria-label="關閉"
      className="text-muted-foreground transition-colors hover:text-foreground"
    >
      <X className="h-4 w-4" />
    </button>
  )

  const body = (
    <>
      <SectionHeader
        title={title}
        action={
          isDesktop ? (
            <DialogClose asChild>{closeButton}</DialogClose>
          ) : (
            <SheetClose asChild>{closeButton}</SheetClose>
          )
        }
      />
      {children}
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent hideClose aria-describedby={undefined} onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {body}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent hideClose aria-describedby={undefined} side="bottom" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {body}
      </SheetContent>
    </Sheet>
  )
}
