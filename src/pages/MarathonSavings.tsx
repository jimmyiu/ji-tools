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
              data={[...inputs.phases]}
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
