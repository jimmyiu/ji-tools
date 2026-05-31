import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CurrencyToggle } from './CurrencyToggle'

describe('CurrencyToggle', () => {
  const defaultProps = {
    hkdActualRate: 1.97,
    usdActualRate: 3.1,
    currency: 'HKD' as const,
    depositDate: '2026-05-31',
    onCurrencyChange: vi.fn(),
  }

  it('renders both currency rates', () => {
    render(<CurrencyToggle {...defaultProps} />)

    expect(screen.getByText('1.9700%')).toBeInTheDocument()
    expect(screen.getByText('3.1000%')).toBeInTheDocument()
  })

  it('renders HKD and USD labels', () => {
    render(<CurrencyToggle {...defaultProps} />)

    expect(screen.getByText('HKD 實際等效年利率')).toBeInTheDocument()
    expect(screen.getByText('USD 實際等效年利率')).toBeInTheDocument()
  })

  it('calls onCurrencyChange when tapping the inactive card', () => {
    const onCurrencyChange = vi.fn()
    render(<CurrencyToggle {...defaultProps} onCurrencyChange={onCurrencyChange} />)

    fireEvent.click(screen.getByText('USD 實際等效年利率'))

    expect(onCurrencyChange).toHaveBeenCalledWith('USD')
  })

  it('does not call onCurrencyChange when tapping the active card', () => {
    const onCurrencyChange = vi.fn()
    render(<CurrencyToggle {...defaultProps} onCurrencyChange={onCurrencyChange} />)

    fireEvent.click(screen.getByText('HKD 實際等效年利率'))

    expect(onCurrencyChange).not.toHaveBeenCalled()
  })

  it('renders deposit date subtitle using fmtDateShort', () => {
    render(<CurrencyToggle {...defaultProps} />)

    const subtitles = screen.getAllByText('由 31-May 起計')
    expect(subtitles).toHaveLength(2)
  })
})
