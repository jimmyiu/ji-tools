# Disable Zoom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Disable pinch-to-zoom and double-tap-to-zoom on mobile by adding `maximum-scale=1` to the viewport meta tag.

**Architecture:** Single HTML attribute change to the viewport meta tag in `index.html`. No CSS or JavaScript changes required.

**Tech Stack:** HTML5 viewport meta tag

---

### Task 1: Add `maximum-scale=1` to viewport meta tag

**Files:**
- Modify: `index.html:6`

- [ ] **Step 1: Update the viewport meta tag**

Change line 6 of `index.html` from:

```html
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

to:

```html
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, viewport-fit=cover" />
```

- [ ] **Step 2: Verify the change**

Run: `grep 'viewport' index.html`
Expected: output contains `maximum-scale=1`

- [ ] **Step 3: Run existing tests to confirm nothing is broken**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "fix: disable pinch-to-zoom and double-tap-zoom via viewport meta"
```