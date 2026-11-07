/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  DESKTOP_NAV_PX,
  NAV_BOTTOM_OFFSET,
  SIDE_NAV_WIDTH,
  TAB_BAR_HEIGHT,
  TAB_BAR_BOTTOM_INSET,
} from './navigation'

const cssPath = resolve(dirname(fileURLToPath(import.meta.url)), '../index.css')
const css = readFileSync(cssPath, 'utf8')

// The stylesheet declares mobile values in `:root` and overrides them inside the
// desktop media query, so each scope is read on its own.
function scope(pattern: RegExp): string {
  const match = css.match(pattern)
  if (!match) throw new Error(`scope not found: ${pattern}`)
  // The declaration block is always the final capture group, so a pattern can
  // constrain the media query in an earlier group.
  return match[match.length - 1]
}

const mobileScope = scope(/^:root \{([\s\S]*?)^\}/m)
const desktopScope = scope(/@media \(min-width: (\d+)px\) \{\n {2}:root \{([\s\S]*?)^ {2}\}/m)

function declaration(block: string, name: string): string {
  const match = block.match(new RegExp(`--${name}:\\s*([^;]+);`))
  if (!match) throw new Error(`--${name} not found`)
  return match[1].trim()
}

function firstPx(value: string): number {
  const match = value.match(/(\d+(?:\.\d+)?)px/)
  if (!match) throw new Error(`no px value in "${value}"`)
  return Number(match[1])
}

describe('navigation metrics match the stylesheet', () => {
  it('mobile content offset clears the tab bar', () => {
    expect(firstPx(declaration(mobileScope, 'nav-bottom-offset'))).toBe(NAV_BOTTOM_OFFSET)
  })

  it('update banner offset on mobile clears the tab bar', () => {
    expect(firstPx(declaration(mobileScope, 'update-banner-bottom'))).toBe(TAB_BAR_HEIGHT)
  })

  it('update banner offset on mobile keeps the tab bar inset', () => {
    const value = declaration(mobileScope, 'update-banner-bottom')
    expect(value).toContain(`${TAB_BAR_BOTTOM_INSET}px`)
  })

  it('desktop side nav offset equals the side nav width', () => {
    expect(firstPx(declaration(desktopScope, 'nav-left-offset'))).toBe(SIDE_NAV_WIDTH)
  })

  it('desktop drops the bottom offset', () => {
    expect(firstPx(declaration(desktopScope, 'nav-bottom-offset'))).toBe(0)
  })

  it('desktop media query equals the desktop navigation width', () => {
    const match = css.match(/@media \(min-width: (\d+)px\)/)
    expect(Number(match?.[1])).toBe(DESKTOP_NAV_PX)
  })
})
