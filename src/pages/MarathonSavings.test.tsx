import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MarathonSavings from './MarathonSavings'
import { ToastProvider } from '@/contexts/ToastContext'

const PRESET_ROW =
  '2026-10-02 ~ 2027-02-01 (HKD 2.8% / 3.0% / 3.2%；USD 3.3% / 3.5% / 3.6%)'
const PRESET_HKD_ROW = 'preset-default-marathon-period-hkd'
const PRESET_USD_ROW = 'preset-default-marathon-period-usd'

function renderPage() {
  return render(
    <ToastProvider>
      <MarathonSavings />
    </ToastProvider>
  )
}

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
  fireEvent.click(screen.getByRole('button', { name: '歷史階段利率' }))
}

function loadPreset() {
  openHistory()
  fireEvent.click(screen.getByRole('radio', { name: PRESET_ROW }))
  fireEvent.click(screen.getByRole('button', { name: '套用' }))
}

describe('MarathonSavings history', () => {
  it('does not apply a preset on selection alone, and 取消 preserves current values', () => {
    renderPage()
    seedEditedInputs()

    openHistory()
    fireEvent.click(screen.getByRole('radio', { name: PRESET_ROW }))

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-10')
    expect(screen.getByText('USD 7.0%')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '取消' }))

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-10')
    expect(screen.getByText('USD 7.0%')).toBeInTheDocument()
  })

  it('preselects the first preset by default, including after reopening', () => {
    renderPage()

    openHistory()

    expect(screen.getByRole('radio', { name: PRESET_ROW })).toBeChecked()
    expect(screen.getByRole('button', { name: '套用' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    openHistory()

    expect(screen.getByRole('radio', { name: PRESET_ROW })).toBeChecked()
    expect(screen.getByRole('button', { name: '套用' })).toBeEnabled()
  })

  it('套用 replaces both currencies, sets the deposit date, and keeps unrelated inputs', () => {
    renderPage()
    seedEditedInputs()

    loadPreset()

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-02')
    expect(screen.getByLabelText('初始本金')).toHaveValue(50000)
    expect(screen.getByText('USD 3.3%')).toBeInTheDocument()
    expect(screen.getByText('USD 3.5%')).toBeInTheDocument()
    expect(screen.getByText('USD 3.6%')).toBeInTheDocument()

    selectCurrency('HKD 實際等效年利率')
    expect(screen.getByText('HKD 2.8%')).toBeInTheDocument()
    expect(screen.getByText('HKD 3.0%')).toBeInTheDocument()
    expect(screen.getByText('HKD 3.2%')).toBeInTheDocument()

    selectCurrency('USD 實際等效年利率')
    expect(screen.getByText('123 日')).toBeInTheDocument()
    expect(screen.getByText('US$585.28')).toBeInTheDocument()
  })

  it('shows the preset schedule and HKD rates after calculator edits', () => {
    renderPage()
    seedEditedInputs()

    openHistory()

    expect(screen.getByRole('radio', { name: PRESET_ROW })).toBeInTheDocument()
  })

  it('shows both currencies and highlights the active currency in the history list', () => {
    renderPage()

    openHistory()

    expect(screen.getByText('2.8% / 3.0% / 3.2%')).toBeInTheDocument()
    expect(screen.getByText('3.3% / 3.5% / 3.6%')).toBeInTheDocument()
    expect(screen.getByTestId(PRESET_HKD_ROW)).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId(PRESET_USD_ROW)).toHaveAttribute('data-active', 'false')
  })

  it('highlights USD when the global toggle is set to USD', () => {
    renderPage()
    selectCurrency('USD 實際等效年利率')

    openHistory()

    expect(screen.getByTestId(PRESET_HKD_ROW)).toHaveAttribute('data-active', 'false')
    expect(screen.getByTestId(PRESET_USD_ROW)).toHaveAttribute('data-active', 'true')
  })

  it('marks the selected preset with a primary border', () => {
    renderPage()

    openHistory()

    const radio = screen.getByRole('radio', { name: PRESET_ROW })
    expect(radio).toBeChecked()

    const row = radio.closest('label')
    expect(row).toHaveAttribute('data-selected', 'true')
    expect(row).toHaveClass('border-primary')
  })

  it('confirms with a success toast and checkmark after applying a preset', () => {
    const { container } = renderPage()

    loadPreset()

    expect(screen.getByText('已成功套用歷史利率')).toBeInTheDocument()
    expect(container.querySelector('.lucide-circle-check')).toBeInTheDocument()
  })

  it('flashes the deposit date field after applying a preset', () => {
    renderPage()

    const field = screen.getByLabelText('實際存款日期').parentElement
    expect(field).not.toHaveAttribute('data-flash')

    loadPreset()

    expect(field).toHaveAttribute('data-flash', '')
  })

  it('reloading restores the preset after edits', () => {
    renderPage()
    seedEditedInputs()
    loadPreset()

    editFirstPhase('9', '8')
    expect(screen.getByText('USD 8.0%')).toBeInTheDocument()

    loadPreset()

    expect(screen.getByLabelText('實際存款日期')).toHaveValue('2026-10-02')
    expect(screen.getByText('USD 3.3%')).toBeInTheDocument()
    expect(screen.getByText('US$585.28')).toBeInTheDocument()
  })
})
