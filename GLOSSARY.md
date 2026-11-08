# ji-tools

Hong Kong-focused deposit calculators delivered as an installable, offline-capable web app.

## Language

**Install prompt**:
The standing offer to add the app to the device home screen, and whether that offer is currently available to this device and browser.
_Avoid_: install banner, A2HS, "add to home screen"

**Update prompt**:
The standing claim that a newer version of the app exists than the one running.
_Avoid_: update banner, refresh prompt, service worker prompt

**Prompt banner**:
The rendered notification that carries a prompt, occupying page space above or below the content.
_Avoid_: toast, alert, snackbar

**Phase**:
One rate window in the marathon savings schedule, carrying an HKD rate and a USD rate for its own span of days. Phases are always contiguous; see the contiguity invariant.
_Avoid_: tier, leg, segment. "Period" stays available for the FX calculator's rollover terms; never use it for a marathon phase.

**Phase schedule**:
The loaded schedule — a phase set together with its deposit date. After it is computed, the same term also names the allocation of that schedule: how many days of each phase fall inside the deposit window, how long each phase lasts, and where each phase sits on the timeline. The computed allocation is the sense most mentions use; the loaded sense is what a preset applies in one step.
_Avoid_: ladder, plan, forecast

**Contiguity invariant**:
Each phase starts the day after the previous phase ends. No day belongs to two phases, and while a phase's dates are set, no day between phases goes unassigned. A phase with a blank date breaks this temporarily — its own span and the next phase's start stay blank until dates are entered again.
_Avoid_: adjacency, ordering

**Deposit date**:
The first day of the deposit window: each phase contributes only on and after whichever is later, its own start or the deposit date, so days before it do not count. A deposit date before every phase still leaves earning to begin at the first phase's start; a deposit date after every phase leaves no phase earning.
_Avoid_: start date, entry date, value date

**Rollover** (滾存):
Reinvesting a matured term deposit for another deposit term.
_Avoid_: iterate, roll

**Deposit window**:
The total calendar span a deposit earns across, continuing from the deposit date through every stage of the term: the phase spans in the marathon savings schedule, every rollover in the FX comparison.
_Avoid_: deposit period, term

**Break-even rollover count**:
The rollover count at which the USD deposit's HKD-equivalent total first reaches or exceeds the HKD deposit's total. Absent when the USD deposit already wins.
_Avoid_: catch-up point, balance point
