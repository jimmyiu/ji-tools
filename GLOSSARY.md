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
One rate window in the marathon savings schedule, carrying an HKD rate and a USD rate for its own span of days. A phase sits next to the next phase, never apart from it.
_Avoid_: tier, leg, segment, period

**Phase schedule**:
The allocation of phases against the deposit date: how many days of each phase fall inside the deposit window, how long each phase lasts, and where each phase sits on the timeline.
_Avoid_: ladder, plan, forecast

**Contiguity invariant**:
Each phase starts the day after the previous phase ends. No day belongs to two phases and no day between phases goes unassigned.
_Avoid_: adjacency, ordering

**Deposit date**:
The first day inside the deposit window, and the day the schedule starts earning. It clamps every phase's contribution: days before it do not count.
_Avoid_: start date, entry date, value date
