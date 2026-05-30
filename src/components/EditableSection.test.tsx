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

    fireEvent.click(screen.getByRole('button', { name: '編輯階段利率' }))
    fireEvent.click(screen.getByText('Modify'))
    expect(screen.getByText('Draft: modified')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))

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
