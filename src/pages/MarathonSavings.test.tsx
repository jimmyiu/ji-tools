import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MarathonSavings from './MarathonSavings'

describe('MarathonSavings history', () => {
  it('loads and restores the immutable default preset only after explicit confirmation', () => {
    render(<MarathonSavings />)

    fireEvent.change(screen.getByLabelText('實際存款日期'), {
      target: { value: '2026-10-10' },
    })
    fireEvent.change(screen.getByLabelText('初始本金'), {
      target: { value: '50000' },
    })
    fireEvent.click(screen.getByText('USD 實際等效年利率'))

    fireEvent.click(screen.getByRole('button', { name: '編輯階段利率' }))
    fireEvent.change(screen.getAllByLabelText('HKD 年利率')[0], {
      target: { value: '9' },
    })
    fireEvent.change(screen.getAllByLabelText('USD 年利率')[0], {
      target: { value: '7' },
    })
    fireEvent.click(screen.getByRole('button', { name: '確認' }))

    expect(screen.getByText('USD 7%')).toBeInTheDocument()

    const presetRow =
      '2026-10-02 – 2027-02-01 · 2.8% / 3% / 3.2%'
    fireEvent.click(screen.getByRole('button', { name: '載入歷史利率' }))
    fireEvent.click(screen.getByRole('radio', { name: presetRow }))

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-10')
    expect(screen.getByText('USD 7%')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-10')
    expect(screen.getByText('USD 7%')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '載入歷史利率' }))
    fireEvent.click(screen.getByRole('radio', { name: presetRow }))
    fireEvent.click(screen.getByRole('button', { name: '載入' }))

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-02')
    expect(screen.getByLabelText('初始本金')).toHaveValue(50000)
    expect(screen.getByText('USD 3.3%')).toBeInTheDocument()
    expect(screen.getByText('USD 3.5%')).toBeInTheDocument()
    expect(screen.getByText('USD 3.6%')).toBeInTheDocument()
    fireEvent.click(screen.getByText('HKD 實際等效年利率'))
    expect(screen.getByText('HKD 2.8%')).toBeInTheDocument()
    expect(screen.getByText('HKD 3%')).toBeInTheDocument()
    expect(screen.getByText('HKD 3.2%')).toBeInTheDocument()
    fireEvent.click(screen.getByText('USD 實際等效年利率'))
    expect(screen.getByText('123 日')).toBeInTheDocument()
    expect(screen.getByText('US$585.28')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '編輯階段利率' }))
    fireEvent.change(screen.getAllByLabelText('USD 年利率')[0], {
      target: { value: '8' },
    })
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    expect(screen.getByText('USD 8%')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '載入歷史利率' }))
    fireEvent.click(screen.getByRole('radio', { name: presetRow }))
    fireEvent.click(screen.getByRole('button', { name: '載入' }))

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-02')
    expect(screen.getByText('USD 3.3%')).toBeInTheDocument()
    expect(screen.getByText('US$585.28')).toBeInTheDocument()
  })
})
