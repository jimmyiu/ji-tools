## Why

Mobile inner pages are horizontally squeezed by floating card wrappers (double margin penalty), form inputs have mismatched baselines, spacing is inconsistent across the app, and the currency dropdown in the calculator adds unnecessary cognitive load when both HKD and USD data could be managed via a single global toggle.

## What Changes

- **Inner pages**: Remove floating card wrappers (MarathonSavings, FxDepositCompare, Settings), transition to edge-to-edge layout with background bands and bottom borders for section separation
- **Homepage**: Retains card-based layout (unchanged)
- **Global spacing**: Standardize whitespace values across all components — tighter section-header gaps (mb-5 → mb-3), reduced card padding (p-6 → p-4), smaller grid gaps
- **Uniform inputs**: Audit and enforce identical rendered heights for SelectField, DateField, InputField, ReadonlyDateField
- **Currency toggle**: Replace HeroMetrics with an interactive HKD/USD toggle (V4 hybrid: side-by-side cards, 12px radio dot at top-right, active/inactive states)
- **Remove internal dropdown**: Delete "存款貨幣" SelectField from BasicParameters — currency state lives in the hero toggle only

## Capabilities

### New Capabilities
- `currency-toggle`: Interactive HKD/USD toggle with radio dot indicators, active/inactive states, global page-wide filtering
- `edge-to-edge-layout`: Flat section layout for inner pages without floating card wrappers
- `standardized-spacing`: Global whitespace token system and uniform input heights

### Modified Capabilities
<!-- No existing specs have requirement changes — this change applies new layout/styling patterns -->

## Impact

- **Pages**: MarathonSavings (layout restructured, currency toggle), FxDepositCompare (edge-to-edge), Settings (edge-to-edge), Home (unchanged)
- **Components**: HeroMetrics removed, CurrencyToggle added, BasicParameters simplified, SectionHeader spacing adjusted, form field height alignment
- **Hooks**: Currency state already in useMarathonSavings — toggle will call the same setter
- **No route changes, no dependency changes, no API changes**
