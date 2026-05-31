import { useInputs, useCalculator } from '../hooks/useMarathonSavings'
import type { PhaseState } from '../hooks/useMarathonSavings'
import { CurrencyToggle } from '../components/CurrencyToggle'
import { BasicParameters } from '../components/BasicParameters'
import { InterestBreakdown } from '../components/InterestBreakdown'
import { DepositSummary } from '../components/DepositSummary'
import { PhaseRateTimeline } from '../components/PhaseRateTimeline'
import { PhaseRateEditForm } from '../components/PhaseRateEditForm'
import { EditableSection } from '../components/EditableSection'
import { SectionSeparator } from '../components/SectionSeparator'

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
    <div className="max-w-5xl mx-auto py-4 page-enter">
      <p className="text-sm text-muted-foreground mb-4 px-4">
        計算階梯式利率活期存款的實際等效年利率
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3">
        <div>
          <CurrencyToggle
            hkdActualRate={result.hkdActualRate}
            usdActualRate={result.usdActualRate}
            currency={inputs.currency}
            depositDate={inputs.depositDate}
            onCurrencyChange={inputs.setCurrency}
          />

          <SectionSeparator />

          <EditableSection title="階段利率">
            <EditableSection.Summary>
              <PhaseRateTimeline
                phases={inputs.phases}
                depositDate={inputs.depositDate}
                currency={inputs.currency}
              />
            </EditableSection.Summary>
            <EditableSection.Form
              data={[...inputs.phases]}
              onConfirm={handlePhaseConfirm}
              onCancel={() => {}}
            >
              {(draft, setDraft) => (
                <PhaseRateEditForm phases={draft} onChange={setDraft} />
              )}
            </EditableSection.Form>
          </EditableSection>

          <SectionSeparator />

          <BasicParameters
            depositDate={inputs.depositDate}
            principal={inputs.principal}
            onDepositDateChange={inputs.setDepositDate}
            onPrincipalChange={inputs.setPrincipal}
          />
        </div>

        <SectionSeparator className="lg:hidden" />

        <div>
          <InterestBreakdown
            currency={inputs.currency}
            principal={inputs.principal}
            phaseResults={result.phaseResults}
          />

          <SectionSeparator />

          <DepositSummary
            currency={inputs.currency}
            totalDays={result.totalDays}
            totalInterest={result.totalInterest}
          />
        </div>
      </div>
    </div>
  )
}
