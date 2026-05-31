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

    expect(screen.getByText('存款設定')).toBeInTheDocument()
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
