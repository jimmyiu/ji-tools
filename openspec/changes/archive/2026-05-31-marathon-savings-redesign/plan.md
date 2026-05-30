# Marathon Savings Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Marathon Savings page to prioritize value-first information hierarchy with a reusable EditableSection component and phase rate timeline visualization.

**Architecture:** Extract page into focused components (HeroMetrics, BasicParameters, ResultsPanel, PhaseRateTimeline, PhaseRateEditForm) orchestrated by EditableSection compound component. EditableSection manages responsive overlay switching between Sheet (mobile) and Dialog (desktop) using useMediaQuery hook. Timeline renders dual-label bar with boundary-aligned dates using absolute positioning.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, shadcn/ui (radix-ui primitives), date-fns, lucide-react, Vitest

---

## Task 1: Add fmtDateShort Utility

**Files:**
- Modify: `src/lib/format.ts`
- Test: `src/lib/format.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/format.test.ts
import { describe, it, expect } from 'vitest'
import { fmtDateShort } from './format'

describe('fmtDateShort', () => {
  it('formats 2026-05-04 to 04-May', () => {
    expect(fmtDateShort('2026-05-04')).toBe('04-May')
  })

  it('formats 2026-08-31 to 31-Aug', () => {
    expect(fmtDateShort('2026-08-31')).toBe('31-Aug')
  })

  it('formats 2026-01-01 to 01-Jan', () => {
    expect(fmtDateShort('2026-01-01')).toBe('01-Jan')
  })

  it('formats 2026-12-25 to 25-Dec', () => {
    expect(fmtDateShort('2026-12-25')).toBe('25-Dec')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/format.test.ts`
Expected: FAIL with "fmtDateShort is not defined"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/format.ts
import { format, parseISO } from 'date-fns'

export function fmt(n: number) {
  return n.toLocaleString('zh-HK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtRate(n: number) {
  return n.toFixed(4)
}

export function fmtDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd-MMM')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/format.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/format.ts src/lib/format.test.ts
git commit -m "feat: add fmtDateShort utility for dd-MMM date formatting"
```

---

## Task 2: Create useMediaQuery Hook

**Files:**
- Create: `src/hooks/useMediaQuery.ts`
- Test: `src/hooks/useMediaQuery.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/hooks/useMediaQuery.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false on server (no window)', () => {
    const originalWindow = global.window
    // @ts-ignore
    delete global.window

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.current).toBe(false)

    global.window = originalWindow
  })

  it('returns matchMedia result on client', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: '(min-width: 1024px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.current).toBe(true)
  })

  it('updates when media query changes', () => {
    let listener: ((e: { matches: boolean }) => void) | null = null
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(min-width: 1024px)',
      addEventListener: vi.fn((event: string, cb: (e: { matches: boolean }) => void) => {
        if (event === 'change') listener = cb
      }),
      removeEventListener: vi.fn(),
    })

    const { result, rerender } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.current).toBe(false)

    // Simulate media query change
    if (listener) listener({ matches: true })
    rerender()

    expect(result.current).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/hooks/useMediaQuery.test.ts`
Expected: FAIL with "Cannot find module './useMediaQuery'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/hooks/useMediaQuery.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useMediaQuery.ts src/hooks/useMediaQuery.test.ts
git commit -m "feat: add useMediaQuery hook for responsive breakpoint detection"
```

---

## Task 3: Create shadcn Dialog Component

**Files:**
- Create: `src/components/ui/dialog.tsx`

- [ ] **Step 1: Create Dialog component following shadcn pattern**

```typescript
// src/components/ui/dialog.tsx
"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-left-1/2 data-open:slide-in-from-top-[48%] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:slide-out-to-left-1/2 data-closed:slide-out-to-top-[48%] rounded-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-open:bg-accent data-open:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/dialog.tsx
git commit -m "feat: add shadcn Dialog component for centered modal overlay"
```

---

## Task 4: Create shadcn Sheet Component

**Files:**
- Create: `src/components/ui/sheet.tsx`

- [ ] **Step 1: Create Sheet component following shadcn pattern**

```typescript
// src/components/ui/sheet.tsx
"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "bottom",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "top" | "bottom" | "left" | "right"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-open:animate-in data-closed:animate-out data-open:duration-200 data-closed:duration-200",
          side === "top" &&
            "inset-x-0 top-0 border-b data-open:slide-in-from-top data-closed:slide-out-to-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 border-t rounded-t-xl data-open:slide-in-from-bottom data-closed:slide-out-to-bottom",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r data-open:slide-in-from-left data-closed:slide-out-to-left sm:max-w-sm",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l data-open:slide-in-from-right data-closed:slide-out-to-right sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-open:bg-accent data-open:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/sheet.tsx
git commit -m "feat: add shadcn Sheet component for bottom sheet overlay"
```

---

## Task 5: Create EditableSection Compound Component

**Files:**
- Create: `src/components/EditableSection.tsx`
- Test: `src/components/EditableSection.test.tsx`

**Key design decision:** Form manages draft state internally via render prop pattern. It passes `(draft, setDraft)` to children, renders Confirm/Cancel buttons itself, and closes the overlay on confirm/cancel. This ensures the overlay lifecycle is owned entirely by EditableSection.

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/EditableSection.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditableSection } from './EditableSection'

interface TestData {
  name: string
}

describe('EditableSection', () => {
  const testData: TestData = { name: 'original' }

  it('renders card with title and summary content', () => {
    render(
      <EditableSection title="階段利率">
        <EditableSection.Summary>
          <div>Summary content</div>
        </EditableSection.Summary>
        <EditableSection.Form data={testData} onConfirm={vi.fn()} onCancel={vi.fn()}>
          {() => <div>Form content</div>}
        </EditableSection.Form>
      </EditableSection>
    )

    expect(screen.getByText('階段利率')).toBeInTheDocument()
    expect(screen.getByText('Summary content')).toBeInTheDocument()
    expect(screen.queryByText('Form content')).not.toBeInTheDocument()
  })

  it('renders edit button with correct aria-label', () => {
    render(
      <EditableSection title="階段利率">
        <EditableSection.Summary>
          <div>Summary</div>
        </EditableSection.Summary>
        <EditableSection.Form data={testData} onConfirm={vi.fn()} onCancel={vi.fn()}>
          {() => <div>Form</div>}
        </EditableSection.Form>
      </EditableSection>
    )

    const editButton = screen.getByRole('button', { name: '編輯階段利率' })
    expect(editButton).toBeInTheDocument()
  })

  it('opens overlay and shows form content when edit button is clicked', () => {
    render(
      <EditableSection title="階段利率">
        <EditableSection.Summary>
          <div>Summary</div>
        </EditableSection.Summary>
        <EditableSection.Form data={testData} onConfirm={vi.fn()} onCancel={vi.fn()}>
          {() => <div>Form content</div>}
        </EditableSection.Form>
      </EditableSection>
    )

    const editButton = screen.getByRole('button', { name: '編輯階段利率' })
    fireEvent.click(editButton)

    expect(screen.getByText('Form content')).toBeInTheDocument()
  })

  it('renders Confirm and Cancel buttons in overlay', () => {
    render(
      <EditableSection title="階段利率">
        <EditableSection.Summary>
          <div>Summary</div>
        </EditableSection.Summary>
        <EditableSection.Form data={testData} onConfirm={vi.fn()} onCancel={vi.fn()}>
          {() => <div>Form content</div>}
        </EditableSection.Form>
      </EditableSection>
    )

    fireEvent.click(screen.getByRole('button', { name: '編輯階段利率' }))

    expect(screen.getByRole('button', { name: '確認' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
  })

  it('calls onConfirm with draft data and closes overlay when Confirm is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <EditableSection title="階段利率">
        <EditableSection.Summary>
          <div>Summary</div>
        </EditableSection.Summary>
        <EditableSection.Form data={testData} onConfirm={onConfirm} onCancel={vi.fn()}>
          {(draft, setDraft) => (
            <div>
              <span>Draft: {draft.name}</span>
              <button onClick={() => setDraft({ name: 'modified' })}>Modify</button>
            </div>
          )}
        </EditableSection.Form>
      </EditableSection>
    )

    fireEvent.click(screen.getByRole('button', { name: '編輯階段利率' }))
    fireEvent.click(screen.getByText('Modify'))
    fireEvent.click(screen.getByRole('button', { name: '確認' }))

    expect(onConfirm).toHaveBeenCalledWith({ name: 'modified' })
    expect(screen.queryByText('Form content')).not.toBeInTheDocument()
  })

  it('calls onCancel and closes overlay when Cancel is clicked', () => {
    const onCancel = vi.fn()
    render(
      <EditableSection title="階段利率">
        <EditableSection.Summary>
          <div>Summary</div>
        </EditableSection.Summary>
        <EditableSection.Form data={testData} onConfirm={vi.fn()} onCancel={onCancel}>
          {(draft, setDraft) => (
            <div>
              <span>Draft: {draft.name}</span>
              <button onClick={() => setDraft({ name: 'modified' })}>Modify</button>
            </div>
          )}
        </EditableSection.Form>
      </EditableSection>
    )

    fireEvent.click(screen.getByRole('button', { name: '編輯階段利率' }))
    fireEvent.click(screen.getByText('Modify'))
    fireEvent.click(screen.getByRole('button', { name: '取消' }))

    expect(onCancel).toHaveBeenCalled()
  })

  it('resets draft to original data on each open', () => {
    render(
      <EditableSection title="階段利率">
        <EditableSection.Summary>
          <div>Summary</div>
        </EditableSection.Summary>
        <EditableSection.Form data={testData} onConfirm={vi.fn()} onCancel={vi.fn()}>
          {(draft, setDraft) => (
            <div>
              <span>Draft: {draft.name}</span>
              <button onClick={() => setDraft({ name: 'modified' })}>Modify</button>
            </div>
          )}
        </EditableSection.Form>
      </EditableSection>
    )

    // Open, modify, cancel
    fireEvent.click(screen.getByRole('button', { name: '編輯階段利率' }))
    fireEvent.click(screen.getByText('Modify'))
    expect(screen.getByText('Draft: modified')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))

    // Reopen — draft should be reset
    fireEvent.click(screen.getByRole('button', { name: '編輯階段利率' }))
    expect(screen.getByText('Draft: original')).toBeInTheDocument()
  })

  it('handles missing Summary gracefully', () => {
    render(
      <EditableSection title="Test">
        <EditableSection.Form data={testData} onConfirm={vi.fn()} onCancel={vi.fn()}>
          {() => <div>Form</div>}
        </EditableSection.Form>
      </EditableSection>
    )

    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/components/EditableSection.test.tsx`
Expected: FAIL with "Cannot find module './EditableSection'"

- [ ] **Step 3: Write implementation**

```typescript
// src/components/EditableSection.tsx
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface EditableSectionContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  title: string
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

  const contextValue: EditableSectionContextValue = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    title,
  }

  return (
    <EditableSectionContext.Provider value={contextValue}>
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={contextValue.open}
            aria-label={`編輯${title}`}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
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

interface FormProps<T> {
  data: T
  onConfirm: (data: T) => void
  onCancel: () => void
  children: (draft: T, setDraft: (d: T) => void) => ReactNode
}

function Form<T>({ data, onConfirm, onCancel, children }: FormProps<T>) {
  const { isOpen, close, title } = useEditableSectionContext()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [draft, setDraft] = useState<T>(() => structuredClone(data))

  useEffect(() => {
    if (isOpen) {
      setDraft(structuredClone(data))
    }
  }, [isOpen, data])

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {overlayContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {overlayContent}
      </SheetContent>
    </Sheet>
  )
}

EditableSection.Summary = Summary
EditableSection.Form = Form

export { EditableSection }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/components/EditableSection.test.tsx`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/EditableSection.tsx src/components/EditableSection.test.tsx
git commit -m "feat: add EditableSection compound component with draft state and overlay lifecycle"
```

---

## Task 6: Create HeroMetrics Component

**Files:**
- Create: `src/components/HeroMetrics.tsx`
- Test: `src/components/HeroMetrics.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/HeroMetrics.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroMetrics } from './HeroMetrics'

describe('HeroMetrics', () => {
  it('renders HKD and USD effective rates', () => {
    render(<HeroMetrics hkdActualRate={1.97} usdActualRate={3.1} depositDate="2026-05-31" />)

    expect(screen.getByText('1.9700%')).toBeInTheDocument()
    expect(screen.getByText('3.1000%')).toBeInTheDocument()
  })

  it('renders deposit date subtitle using fmtDateShort', () => {
    render(<HeroMetrics hkdActualRate={1.97} usdActualRate={3.1} depositDate="2026-05-31" />)

    const subtitles = screen.getAllByText('由 31-May 起計')
    expect(subtitles).toHaveLength(2)
  })

  it('renders HKD and USD labels', () => {
    render(<HeroMetrics hkdActualRate={0} usdActualRate={0} depositDate="2026-01-01" />)

    expect(screen.getByText('HKD 實際等效年利率')).toBeInTheDocument()
    expect(screen.getByText('USD 實際等效年利率')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/components/HeroMetrics.test.tsx`
Expected: FAIL with "Cannot find module './HeroMetrics'"

- [ ] **Step 3: Write implementation**

```typescript
// src/components/HeroMetrics.tsx
import { fmtRate, fmtDateShort } from '@/lib/format'

interface HeroMetricsProps {
  hkdActualRate: number
  usdActualRate: number
  depositDate: string
}

export function HeroMetrics({ hkdActualRate, usdActualRate, depositDate }: HeroMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl p-5 border border-primary/30 bg-primary/5">
        <div className="text-xs text-muted-foreground mb-2">HKD 實際等效年利率</div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {fmtRate(hkdActualRate)}%
        </div>
        <div className="text-xs text-muted-foreground/60">由 {fmtDateShort(depositDate)} 起計</div>
      </div>
      <div className="rounded-xl p-5 border border-green-500/30 bg-green-500/5">
        <div className="text-xs text-muted-foreground mb-2">USD 實際等效年利率</div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {fmtRate(usdActualRate)}%
        </div>
        <div className="text-xs text-muted-foreground/60">由 {fmtDateShort(depositDate)} 起計</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/components/HeroMetrics.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/HeroMetrics.tsx src/components/HeroMetrics.test.tsx
git commit -m "feat: add HeroMetrics component with deposit date subtitle"
```

---

## Task 7: Create BasicParameters Component

**Files:**
- Create: `src/components/BasicParameters.tsx`
- Test: `src/components/BasicParameters.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/BasicParameters.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BasicParameters } from './BasicParameters'

describe('BasicParameters', () => {
  const defaultProps = {
    depositDate: '2026-05-31',
    currency: 'HKD' as const,
    principal: 100000,
    onDepositDateChange: vi.fn(),
    onCurrencyChange: vi.fn(),
    onPrincipalChange: vi.fn(),
  }

  it('renders all input labels', () => {
    render(<BasicParameters {...defaultProps} />)

    expect(screen.getByText('基本參數')).toBeInTheDocument()
    expect(screen.getByText('實際存款日期')).toBeInTheDocument()
    expect(screen.getByText('存款貨幣')).toBeInTheDocument()
    expect(screen.getByText('初始本金')).toBeInTheDocument()
  })

  it('displays current values', () => {
    render(<BasicParameters {...defaultProps} />)

    expect(screen.getByDisplayValue('2026-05-31')).toBeInTheDocument()
    expect(screen.getByDisplayValue('100000')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/components/BasicParameters.test.tsx`
Expected: FAIL with "Cannot find module './BasicParameters'"

- [ ] **Step 3: Write implementation**

```typescript
// src/components/BasicParameters.tsx
import { InputField } from './InputField'
import { DateField } from './DateField'
import { SelectField } from './SelectField'
import type { Currency } from '@/hooks/useMarathonSavings'

interface BasicParametersProps {
  depositDate: string
  currency: Currency
  principal: string | number
  onDepositDateChange: (v: string) => void
  onCurrencyChange: (v: Currency) => void
  onPrincipalChange: (v: string) => void
}

function parseCurrency(v: string): Currency {
  if (v === 'HKD' || v === 'USD') return v
  return 'HKD'
}

export function BasicParameters({
  depositDate,
  currency,
  principal,
  onDepositDateChange,
  onCurrencyChange,
  onPrincipalChange,
}: BasicParametersProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-sm font-semibold text-foreground mb-5">基本參數</h2>
      <div className="space-y-4">
        <DateField
          label="實際存款日期"
          value={depositDate}
          onChange={onDepositDateChange}
        />
        <SelectField
          label="存款貨幣"
          value={currency}
          onChange={(v) => onCurrencyChange(parseCurrency(v))}
          options={[
            { value: 'HKD', label: 'HKD 港元' },
            { value: 'USD', label: 'USD 美元' },
          ]}
        />
        <InputField
          label="初始本金"
          value={principal}
          onChange={onPrincipalChange}
          step={1000}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/components/BasicParameters.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/BasicParameters.tsx src/components/BasicParameters.test.tsx
git commit -m "feat: add BasicParameters component for deposit inputs"
```

---

## Task 8: Create ResultsPanel Component

**Files:**
- Create: `src/components/ResultsPanel.tsx`
- Test: `src/components/ResultsPanel.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/ResultsPanel.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultsPanel } from './ResultsPanel'
import type { PhaseResult } from '@/hooks/useMarathonSavings'

describe('ResultsPanel', () => {
  const mockPhaseResults: PhaseResult[] = [
    { days: 59, rate: 1.85, interest: 895.21 },
    { days: 32, rate: 2.0, interest: 526.03 },
    { days: 0, rate: 0, interest: 0 },
  ]

  it('renders HKD currency label and prefix', () => {
    render(
      <ResultsPanel
        currency="HKD"
        principal={100000}
        phaseResults={mockPhaseResults}
        totalDays={91}
        totalInterest={1421.24}
      />
    )

    expect(screen.getByText('港元 利息明細')).toBeInTheDocument()
    expect(screen.getByText('HK$1,421.24')).toBeInTheDocument()
  })

  it('renders USD currency label and prefix', () => {
    render(
      <ResultsPanel
        currency="USD"
        principal={100000}
        phaseResults={mockPhaseResults}
        totalDays={91}
        totalInterest={1421.24}
      />
    )

    expect(screen.getByText('美元 利息明細')).toBeInTheDocument()
    expect(screen.getByText('US$1,421.24')).toBeInTheDocument()
  })

  it('renders phase with zero days as not in deposit period', () => {
    render(
      <ResultsPanel
        currency="HKD"
        principal={100000}
        phaseResults={mockPhaseResults}
        totalDays={91}
        totalInterest={1421.24}
      />
    )

    expect(screen.getByText('（不在存款期內）')).toBeInTheDocument()
  })

  it('renders total days', () => {
    render(
      <ResultsPanel
        currency="HKD"
        principal={100000}
        phaseResults={mockPhaseResults}
        totalDays={91}
        totalInterest={1421.24}
      />
    )

    expect(screen.getByText('91 日')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/components/ResultsPanel.test.tsx`
Expected: FAIL with "Cannot find module './ResultsPanel'"

- [ ] **Step 3: Write implementation**

```typescript
// src/components/ResultsPanel.tsx
import { fmt } from '@/lib/format'
import type { Currency, PhaseResult } from '@/hooks/useMarathonSavings'

interface ResultsPanelProps {
  currency: Currency
  principal: string | number
  phaseResults: PhaseResult[]
  totalDays: number
  totalInterest: number
}

export function ResultsPanel({
  currency,
  principal,
  phaseResults,
  totalDays,
  totalInterest,
}: ResultsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          {currency === 'HKD' ? '港元' : '美元'} 利息明細
          <span className="ml-2 text-xs font-normal text-muted-foreground/60">
            (本金 HK$ {fmt(Number(principal))})
          </span>
        </h2>
        <div className="space-y-3">
          {phaseResults.map((pr, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div>
                <span className="text-sm text-muted-foreground">階段 {i + 1}</span>
                <span className="ml-2 text-xs text-muted-foreground/60">
                  {pr.days > 0 ? `${pr.days} 日 @ ${pr.rate}%` : '（不在存款期內）'}
                </span>
              </div>
              <span className={`text-sm font-medium ${pr.interest > 0 ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                {pr.interest > 0 ? `${currency === 'HKD' ? 'HK$' : 'US$'}${fmt(pr.interest)}` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-6 border border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">總存款日數</div>
            <div className="text-2xl font-bold text-foreground">{totalDays} 日</div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">期滿總利息</div>
            <div className="text-2xl font-bold text-primary">
              {currency === 'HKD' ? 'HK$' : 'US$'}{fmt(totalInterest)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/components/ResultsPanel.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultsPanel.tsx src/components/ResultsPanel.test.tsx
git commit -m "feat: add ResultsPanel component for interest breakdown display"
```

---

## Task 9: Create PhaseRateTimeline Component

**Files:**
- Create: `src/components/PhaseRateTimeline.tsx`
- Test: `src/components/PhaseRateTimeline.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/PhaseRateTimeline.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PhaseRateTimeline } from './PhaseRateTimeline'
import type { PhaseState } from '@/hooks/useMarathonSavings'

describe('PhaseRateTimeline', () => {
  const mockPhases: PhaseState[] = [
    { startDate: '2026-05-04', endDate: '2026-07-01', hkdRate: 1.85, usdRate: 3.0 },
    { startDate: '2026-07-02', endDate: '2026-08-02', hkdRate: 2.0, usdRate: 3.1 },
    { startDate: '2026-08-03', endDate: '2026-08-31', hkdRate: 2.2, usdRate: 3.3 },
  ]

  it('renders dual-label bar with HKD and USD rates', () => {
    render(<PhaseRateTimeline phases={mockPhases} depositDate="2026-05-04" />)

    expect(screen.getByText('HKD 1.85%')).toBeInTheDocument()
    expect(screen.getByText('USD 3.0%')).toBeInTheDocument()
    expect(screen.getByText('HKD 2.0%')).toBeInTheDocument()
    expect(screen.getByText('USD 3.1%')).toBeInTheDocument()
  })

  it('renders boundary dates', () => {
    render(<PhaseRateTimeline phases={mockPhases} depositDate="2026-05-04" />)

    expect(screen.getByText('04-May')).toBeInTheDocument()
    expect(screen.getByText('02-Jul')).toBeInTheDocument()
    expect(screen.getByText('03-Aug')).toBeInTheDocument()
    expect(screen.getByText('31-Aug')).toBeInTheDocument()
  })

  it('renders phase with zero effective days with muted styling', () => {
    const { container } = render(
      <PhaseRateTimeline phases={mockPhases} depositDate="2026-07-15" />
    )

    // Phase 1 should have 0 effective days (deposit after phase 1 end)
    // The segment should have opacity 0.4
    const mutedSegment = container.querySelector('[style*="opacity: 0.4"]')
    expect(mutedSegment).toBeInTheDocument()
  })

  it('shows zero days message when deposit date is after all phases', () => {
    render(<PhaseRateTimeline phases={mockPhases} depositDate="2026-12-01" />)

    expect(screen.getByText('存款日期在所有階段之後')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/components/PhaseRateTimeline.test.tsx`
Expected: FAIL with "Cannot find module './PhaseRateTimeline'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/components/PhaseRateTimeline.tsx
import { useMemo } from 'react'
import { parseISO, differenceInDays, addDays } from 'date-fns'
import { fmtDateShort } from '@/lib/format'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { PhaseState } from '@/hooks/useMarathonSavings'

interface PhaseRateTimelineProps {
  phases: PhaseState[]
  depositDate: string
}

function effectiveDays(depositDate: Date, phaseStartDate: Date, phaseEndDate: Date): number {
  const effectiveStart = depositDate > phaseStartDate ? depositDate : phaseStartDate
  if (effectiveStart > phaseEndDate) return 0
  return differenceInDays(phaseEndDate, effectiveStart) + 1
}

export function PhaseRateTimeline({ phases, depositDate }: PhaseRateTimelineProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const phaseData = useMemo(() => {
    const deposit = parseISO(depositDate)
    let previousEffectiveEnd: Date | null = null

    const data = phases.map((phase) => {
      const start = parseISO(phase.startDate)
      const end = parseISO(phase.endDate)
      const clampedStart = previousEffectiveEnd !== null && start <= previousEffectiveEnd
        ? addDays(previousEffectiveEnd, 1)
        : start
      const days = effectiveDays(deposit, clampedStart, end)
      const effectiveEnd = days > 0 ? addDays(clampedStart, days - 1) : null
      if (effectiveEnd) previousEffectiveEnd = effectiveEnd

      return {
        ...phase,
        days,
        startDate: phase.startDate,
        endDate: phase.endDate,
      }
    })

    const totalDays = data.reduce((sum, p) => sum + p.days, 0)
    let cumulativeDays = 0
    const boundaries = data.map((p, i) => {
      const boundary = totalDays > 0 ? (cumulativeDays / totalDays) * 100 : 0
      cumulativeDays += p.days
      return boundary
    })
    boundaries.push(100) // Last boundary

    return { data, totalDays, boundaries }
  }, [phases, depositDate])

  if (phaseData.totalDays === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        存款日期在所有階段之後
      </div>
    )
  }

  const opacities = [0.2, 0.35, 0.5]

  return (
    <div>
      {/* Dual-label bar */}
      <div className="flex rounded-md overflow-hidden h-11 mb-1">
        {phaseData.data.map((phase, i) => {
          const flexValue = phase.days > 0 ? phase.days : 1
          const opacity = opacities[i] || 0.5
          const isMuted = phase.days === 0

          return (
            <div
              key={i}
              className="flex flex-col items-center justify-center border-r border-background last:border-r-0"
              style={{
                flex: flexValue,
                backgroundColor: `rgba(124, 58, 237, ${opacity})`,
                opacity: isMuted ? 0.4 : 1,
              }}
            >
              <span className="text-xs font-bold text-purple-200">
                HKD {phase.hkdRate}%
              </span>
              <span className="text-xs text-green-300">
                USD {phase.usdRate}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Desktop: Phase captions */}
      {isDesktop && (
        <div className="flex text-xs mt-2">
          {phaseData.data.map((phase, i) => (
            <div
              key={i}
              className="text-center text-primary font-medium"
              style={{ flex: phase.days > 0 ? phase.days : 1 }}
            >
              階段 {i + 1} · {phase.days} 日
            </div>
          ))}
        </div>
      )}

      {/* Boundary dates */}
      <div className="relative h-4 text-xs text-muted-foreground mt-1">
        {phaseData.data.map((phase, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: `${phaseData.boundaries[i]}%`,
              transform: i === 0 ? 'translateX(0)' : 'translateX(-50%)',
            }}
          >
            {fmtDateShort(phase.startDate)}
          </span>
        ))}
        <span
          className="absolute"
          style={{
            right: '0',
            transform: 'translateX(0)',
          }}
        >
          {fmtDateShort(phaseData.data[phaseData.data.length - 1].endDate)}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/components/PhaseRateTimeline.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/PhaseRateTimeline.tsx src/components/PhaseRateTimeline.test.tsx
git commit -m "feat: add PhaseRateTimeline component with dual-label bar and boundary dates"
```

---

## Task 10: Create PhaseRateEditForm Component

**Files:**
- Create: `src/components/PhaseRateEditForm.tsx`
- Test: `src/components/PhaseRateEditForm.test.tsx`

**Key design decision:** PhaseRateEditForm is a **controlled component** — it receives `phases` and `onChange` props, has no internal state, and renders no buttons. Draft state management and Confirm/Cancel buttons are owned by `EditableSection.Form` (Task 5). PhaseRateEditForm is used as a render prop child of `EditableSection.Form`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/PhaseRateEditForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PhaseRateEditForm } from './PhaseRateEditForm'
import type { PhaseState } from '@/hooks/useMarathonSavings'

describe('PhaseRateEditForm', () => {
  const mockPhases: PhaseState[] = [
    { startDate: '2026-05-04', endDate: '2026-07-01', hkdRate: 1.85, usdRate: 3.0 },
    { startDate: '2026-07-02', endDate: '2026-08-02', hkdRate: 2.0, usdRate: 3.1 },
    { startDate: '2026-08-03', endDate: '2026-08-31', hkdRate: 2.2, usdRate: 3.3 },
  ]

  it('renders all phase fields', () => {
    render(
      <PhaseRateEditForm phases={mockPhases} onChange={vi.fn()} />
    )

    expect(screen.getByText('階段 1')).toBeInTheDocument()
    expect(screen.getByText('階段 2')).toBeInTheDocument()
    expect(screen.getByText('階段 3')).toBeInTheDocument()
  })

  it('calls onChange when a field is modified', () => {
    const onChange = vi.fn()
    render(
      <PhaseRateEditForm phases={mockPhases} onChange={onChange} />
    )

    const hkdInputs = screen.getAllByLabelText('HKD 年利率')
    fireEvent.change(hkdInputs[0], { target: { value: '2.5' } })

    expect(onChange).toHaveBeenCalled()
    const updatedPhases = onChange.mock.calls[0][0] as PhaseState[]
    expect(updatedPhases[0].hkdRate).toBe('2.5')
    // Other phases unchanged
    expect(updatedPhases[1].hkdRate).toBe(2.0)
    expect(updatedPhases[2].hkdRate).toBe(2.2)
  })

  it('does not render Confirm/Cancel buttons (owned by EditableSection.Form)', () => {
    render(
      <PhaseRateEditForm phases={mockPhases} onChange={vi.fn()} />
    )

    expect(screen.queryByText('確認')).not.toBeInTheDocument()
    expect(screen.queryByText('取消')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/components/PhaseRateEditForm.test.tsx`
Expected: FAIL with "Cannot find module './PhaseRateEditForm'"

- [ ] **Step 3: Write implementation**

```typescript
// src/components/PhaseRateEditForm.tsx
import { InputField } from './InputField'
import { DateField } from './DateField'
import type { PhaseState } from '@/hooks/useMarathonSavings'

interface PhaseRateEditFormProps {
  phases: PhaseState[]
  onChange: (updatedPhases: PhaseState[]) => void
}

function assertPhaseIndex(i: number): asserts i is 0 | 1 | 2 {
  if (i < 0 || i > 2) throw new Error(`Invalid phase index: ${i}`)
}

export function PhaseRateEditForm({ phases, onChange }: PhaseRateEditFormProps) {
  const updatePhase = (index: number, updates: Partial<PhaseState>) => {
    const next = [...phases]
    next[index] = { ...next[index], ...updates }
    onChange(next)
  }

  return (
    <div className="space-y-5">
      {phases.map((phase, i) => {
        assertPhaseIndex(i)
        return (
          <div key={i} className="space-y-3">
            <div className="text-xs font-medium text-primary">
              階段 {i + 1}
              <span className="ml-2 text-muted-foreground/60">
                ({phase.startDate} ~ {phase.endDate})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DateField
                label="開始日期"
                value={phase.startDate}
                onChange={(v) => updatePhase(i, { startDate: v })}
              />
              <DateField
                label="結束日期"
                value={phase.endDate}
                onChange={(v) => updatePhase(i, { endDate: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="HKD 年利率"
                value={phase.hkdRate}
                onChange={(v) => updatePhase(i, { hkdRate: v })}
                suffix="%"
                step={0.01}
              />
              <InputField
                label="USD 年利率"
                value={phase.usdRate}
                onChange={(v) => updatePhase(i, { usdRate: v })}
                suffix="%"
                step={0.01}
              />
            </div>
            {i < phases.length - 1 && <div className="border-t border-border" />}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/components/PhaseRateEditForm.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/PhaseRateEditForm.tsx src/components/PhaseRateEditForm.test.tsx
git commit -m "feat: add PhaseRateEditForm as controlled component for EditableSection.Form"
```

---

## Task 11: Refactor MarathonSavings Page

**Files:**
- Modify: `src/pages/MarathonSavings.tsx`

- [ ] **Step 1: Refactor page to use new components**

```typescript
// src/pages/MarathonSavings.tsx
import { useInputs, useCalculator } from '../hooks/useMarathonSavings'
import type { PhaseState } from '../hooks/useMarathonSavings'
import { HeroMetrics } from '../components/HeroMetrics'
import { BasicParameters } from '../components/BasicParameters'
import { ResultsPanel } from '../components/ResultsPanel'
import { PhaseRateTimeline } from '../components/PhaseRateTimeline'
import { PhaseRateEditForm } from '../components/PhaseRateEditForm'
import { EditableSection } from '../components/EditableSection'

export default function MarathonSavings() {
  const inputs = useInputs()
  const result = useCalculator(inputs)

  const handlePhaseConfirm = (updatedPhases: PhaseState[]) => {
    updatedPhases.forEach((phase, i) => {
      const index = i as 0 | 1 | 2
      inputs.setPhaseStartDate(index, phase.startDate)
      inputs.setPhaseEndDate(index, phase.endDate)
      inputs.setPhaseHkdRate(index, String(phase.hkdRate))
      inputs.setPhaseUsdRate(index, String(phase.usdRate))
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 page-enter">
      <p className="text-sm text-muted-foreground mb-8">
        揭示階梯式利率活期存款的「實際等效年利率」，擺脫銀行最高息宣傳迷思。
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <HeroMetrics
            hkdActualRate={result.hkdActualRate}
            usdActualRate={result.usdActualRate}
            depositDate={inputs.depositDate}
          />

          <EditableSection title="階段利率">
            <EditableSection.Summary>
              <PhaseRateTimeline
                phases={inputs.phases}
                depositDate={inputs.depositDate}
              />
            </EditableSection.Summary>
            <EditableSection.Form
              data={inputs.phases}
              onConfirm={handlePhaseConfirm}
              onCancel={() => {}}
            >
              {(draft, setDraft) => (
                <PhaseRateEditForm phases={draft} onChange={setDraft} />
              )}
            </EditableSection.Form>
          </EditableSection>

          <BasicParameters
            depositDate={inputs.depositDate}
            currency={inputs.currency}
            principal={inputs.principal}
            onDepositDateChange={inputs.setDepositDate}
            onCurrencyChange={inputs.setCurrency}
            onPrincipalChange={inputs.setPrincipal}
          />
        </div>

        <ResultsPanel
          currency={inputs.currency}
          principal={inputs.principal}
          phaseResults={result.phaseResults}
          totalDays={result.totalDays}
          totalInterest={result.totalInterest}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run all tests**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/pages/MarathonSavings.tsx
git commit -m "refactor: restructure MarathonSavings page with value-first layout"
```

---

## Task 12: Visual Verification and Polish

**Files:**
- Manual testing

- [ ] **Step 1: Start dev server**

Run: `pnpm dev`

- [ ] **Step 2: Test mobile viewport (<1024px)**

Open browser to http://localhost:5173/marathon-savings
- Verify Hero Metrics displays with deposit date subtitle
- Verify Timeline shows dual-label bar with boundary dates only (no phase captions)
- Click edit icon - verify Sheet slides up from bottom
- Edit a phase rate, click Cancel - verify changes are discarded
- Edit a phase rate, click Confirm - verify changes are applied
- Verify Basic Parameters and Results Panel render correctly

- [ ] **Step 3: Test desktop viewport (≥1024px)**

Resize browser to ≥1024px width
- Verify Timeline shows phase captions ("階段 X · N 日") under segments
- Click edit icon - verify Dialog appears centered with backdrop
- Test Escape key closes overlay
- Test backdrop click closes overlay
- Verify 2-column layout: left column has Hero/Timeline/Params, right has Results

- [ ] **Step 4: Test edge cases**

- Set deposit date after all phases - verify "存款日期在所有階段之後" message
- Set deposit date within phase 2 - verify phase 1 shows muted styling
- Verify all existing functionality preserved (currency switching, principal input, etc.)

- [ ] **Step 5: Run linter**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: visual verification and polish for marathon savings redesign"
```

---

## Task 13: Final Testing and Documentation

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 2: Run build**

Run: `pnpm build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Update tasks.md to mark all tasks complete**

Update `openspec/changes/marathon-savings-redesign/tasks.md` to check all boxes

- [ ] **Step 4: Final commit**

```bash
git add openspec/changes/marathon-savings-redesign/tasks.md
git commit -m "docs: mark all marathon savings redesign tasks complete"
```

---

**Plan complete. Ready for execution.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session, batch execution with checkpoints

**Which approach?**
