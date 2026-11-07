import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Settings from './Settings'

const mockUsePwaPrompts = vi.fn()

vi.mock('../contexts/PwaPromptsContext', () => ({
  usePwaPrompts: () => mockUsePwaPrompts(),
}))

function prompts({ installVisible = false, updateVisible = false } = {}) {
  return {
    install: {
      visible: installVisible,
      isIOS: false,
      dismiss: vi.fn(),
      toggle: vi.fn(),
      prompt: vi.fn(),
    },
    update: {
      visible: updateVisible,
      dismiss: vi.fn(),
      toggle: vi.fn(),
      reload: vi.fn(),
    },
  }
}

function renderSettings() {
  return render(<BrowserRouter><Settings /></BrowserRouter>)
}

beforeEach(() => {
  mockUsePwaPrompts.mockReturnValue(prompts())
})

describe('Settings', () => {
  it('renders the app version from __APP_VERSION__', () => {
    renderSettings()
    expect(screen.getByText(__APP_VERSION__)).toBeInTheDocument()
  })

  it('renders GitHub link with external link icon', () => {
    renderSettings()
    const link = screen.getByText('GitHub').closest('a')
    expect(link).toHaveAttribute('href', 'https://github.com/jimmyiu/ji-tools')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('shows "隱藏更新提示" when the update prompt is visible', () => {
    mockUsePwaPrompts.mockReturnValue(prompts({ updateVisible: true }))
    renderSettings()
    expect(screen.getByText('隱藏更新提示')).toBeInTheDocument()
  })

  it('shows "顯示更新提示" when the update prompt is hidden', () => {
    renderSettings()
    expect(screen.getByText('顯示更新提示')).toBeInTheDocument()
  })

  it('toggles the update prompt when its row is clicked', () => {
    const update = prompts().update
    mockUsePwaPrompts.mockReturnValue({ ...prompts(), update })
    renderSettings()

    fireEvent.click(screen.getByText('顯示更新提示'))

    expect(update.toggle).toHaveBeenCalledOnce()
  })

  it('offers the install prompt reset when the install prompt is hidden', () => {
    renderSettings()
    expect(screen.getByText('重新顯示安裝提示')).toBeInTheDocument()
  })

  it('hides the install prompt reset when the install prompt is visible', () => {
    mockUsePwaPrompts.mockReturnValue(prompts({ installVisible: true }))
    renderSettings()
    expect(screen.queryByText('重新顯示安裝提示')).not.toBeInTheDocument()
  })

  it('restores the install prompt when its reset row is clicked', () => {
    const install = prompts().install
    mockUsePwaPrompts.mockReturnValue({ ...prompts(), install })
    renderSettings()

    fireEvent.click(screen.getByText('重新顯示安裝提示'))

    expect(install.toggle).toHaveBeenCalledOnce()
  })
})
