import { useState, createContext, useContext, type ReactNode } from 'react'
import { Pencil, X } from 'lucide-react'
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

interface EditableSectionContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  title: string
  openVersion: number
}

const EditableSectionContext = createContext<EditableSectionContextValue | null>(null)

function useEditableSectionContext() {
  const context = useContext(EditableSectionContext)
  if (!context) {
    throw new Error('EditableSection sub-components must be used within EditableSection')
  }
  return context
}

interface EditableSectionProps {
  title: string
  children: ReactNode
}

function EditableSection({ title, children }: EditableSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openVersion, setOpenVersion] = useState(0)

  const open = () => {
    setOpenVersion((v) => v + 1)
    setIsOpen(true)
  }

  const close = () => setIsOpen(false)

  const contextValue: EditableSectionContextValue = {
    isOpen,
    open,
    close,
    title,
    openVersion,
  }

  return (
    <EditableSectionContext.Provider value={contextValue}>
      <div className="px-4 py-4">
        <SectionHeader
          title={title}
          action={
            <button
              type="button"
              onClick={contextValue.open}
              aria-label={`編輯${title}`}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          }
        />
        {children}
      </div>
    </EditableSectionContext.Provider>
  )
}

interface SummaryProps {
  children: ReactNode
}

function Summary({ children }: SummaryProps) {
  return <div>{children}</div>
}

interface FormInnerProps<T> {
  data: T
  onConfirm: (data: T) => void
  onCancel: () => void
  children: (draft: T, setDraft: (d: T) => void) => ReactNode
  close: () => void
  title: string
  isDesktop: boolean
  isOpen: boolean
}

function FormInner<T>({ data, onConfirm, onCancel, children, close, title, isDesktop, isOpen }: FormInnerProps<T>) {
  const [draft, setDraft] = useState<T>(() => structuredClone(data))

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel()
      close()
    }
  }

  const handleConfirm = () => {
    onConfirm(draft)
    close()
  }

  const handleCancel = () => {
    onCancel()
    close()
  }

  const overlayContent = (
    <>
      <div>{children(draft, setDraft)}</div>
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          確認
        </button>
      </div>
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent hideClose aria-describedby={undefined} onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <SectionHeader
            title={title}
            action={
              <DialogClose asChild>
                <button type="button" aria-label="關閉" className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            }
          />
          {overlayContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent hideClose aria-describedby={undefined} side="bottom" onOpenAutoFocus={(e) => e.preventDefault()}>
          <SheetTitle className="sr-only">{title}</SheetTitle>
          <SectionHeader
            title={title}
            action={
              <SheetClose asChild>
                <button type="button" aria-label="關閉" className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </SheetClose>
            }
          />
          {overlayContent}
        </SheetContent>
      </Sheet>
  )
}

interface FormProps<T> {
  data: T
  onConfirm: (data: T) => void
  onCancel: () => void
  children: (draft: T, setDraft: (d: T) => void) => ReactNode
}

function Form<T>({ data, onConfirm, onCancel, children }: FormProps<T>) {
  const { isOpen, close, title, openVersion } = useEditableSectionContext()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <FormInner
      key={openVersion}
      data={data}
      onConfirm={onConfirm}
      onCancel={onCancel}
      close={close}
      title={title}
      isDesktop={isDesktop}
      isOpen={isOpen}
    >
      {children}
    </FormInner>
  )
}

EditableSection.Summary = Summary
EditableSection.Form = Form

export { EditableSection }
