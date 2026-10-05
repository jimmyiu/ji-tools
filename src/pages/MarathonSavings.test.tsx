import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MarathonSavings from './MarathonSavings'

const PRESET_ROW = '2026-10-02 ~ 2027-02-01 (2.8% / 3% / 3.2%)'

function selectCurrency(label: 'HKD 實際等效年利率' | 'USD 實際等效年利率') {
  fireEvent.click(screen.getByText(label))
}

function editFirstPhase(hkdRate: string, usdRate: string) {
  fireEvent.click(screen.getByRole('button', { name: '編輯階段利率' }))
  fireEvent.change(screen.getAllByLabelText('HKD 年利率')[0], {
    target: { value: hkdRate },
  })
  fireEvent.change(screen.getAllByLabelText('USD 年利率')[0], {
    target: { value: usdRate },
  })
  fireEvent.click(screen.getByRole('button', { name: '確認' }))
}

function seedEditedInputs() {
  fireEvent.change(screen.getByLabelText('實際存款日期'), {
    target: { value: '2026-10-10' },
  })
  fireEvent.change(screen.getByLabelText('初始本金'), {
    target: { value: '50000' },
  })
  selectCurrency('USD 實際等效年利率')
  editFirstPhase('9', '7')
}

function openHistory() {
  fireEvent.click(screen.getByRole('button', { name: '載入歷史利率' }))
}

function loadPreset() {
  openHistory()
  fireEvent.click(screen.getByRole('radio', { name: PRESET_ROW }))
  fireEvent.click(screen.getByRole('button', { name: '載入' }))
}

describe('MarathonSavings history', () => {
  it('does not apply a preset on selection alone, and 取消 preserves current values', () => {
    render(<MarathonSavings />)
    seedEditedInputs()

    openHistory()
    fireEvent.click(screen.getByRole('radio', { name: PRESET_ROW }))

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-10')
    expect(screen.getByText('USD 7%')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '取消' }))

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-10')
    expect(screen.getByText('USD 7%')).toBeInTheDocument()
  })

  it('starts with no pending selection when reopened after cancel', () => {
    render(<MarathonSavings />)

    openHistory()
    fireEvent.click(screen.getByRole('radio', { name: PRESET_ROW }))
    fireEvent.click(screen.getByRole('button', { name: '取消' }))

    openHistory()

    expect(screen.getByRole('button', { name: '載入' })).toBeDisabled()
  })

  it('載入 replaces both currencies, sets the deposit date, and keeps unrelated inputs', () => {
    render(<MarathonSavings />)
    seedEditedInputs()

    loadPreset()

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-02')
    expect(screen.getByLabelText('初始本金')).toHaveValue(50000)
    expect(screen.getByText('USD 3.3%')).toBeInTheDocument()
    expect(screen.getByText('USD 3.5%')).toBeInTheDocument()
    expect(screen.getByText('USD 3.6%')).toBeInTheDocument()

    selectCurrency('HKD 實際等效年利率')
    expect(screen.getByText('HKD 2.8%')).toBeInTheDocument()
    expect(screen.getByText('HKD 3%')).toBeInTheDocument()
    expect(screen.getByText('HKD 3.2%')).toBeInTheDocument()

    selectCurrency('USD 實際等效年利率')
    expect(screen.getByText('123 日')).toBeInTheDocument()
    expect(screen.getByText('US$585.28')).toBeInTheDocument()
  })

  it('shows the preset schedule and HKD rates after calculator edits', () => {
    render(<MarathonSavings />)
    seedEditedInputs()

    openHistory()

    expect(screen.getByRole('radio', { name: PRESET_ROW })).toBeInTheDocument()
  })

  it('reloading restores the preset after edits', () => {
    render(<MarathonSavings />)
    seedEditedInputs()
    loadPreset()

    editFirstPhase('9', '8')
    expect(screen.getByText('USD 8%')).toBeInTheDocument()

    loadPreset()

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-02')
    expect(screen.getByText('USD 3.3%')).toBeInTheDocument()
    expect(screen.getByText('US$585.28')).toBeInTheDocument()
  })
})
