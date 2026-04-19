# Mobile Layout Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix mobile layout where the question card and map-layer controls overlap the map, making the interactive map surface too small on phones.

**Architecture:** All changes are CSS/Tailwind responsive tweaks inside two files — `Main.tsx` (question card, re-center, map-layer controls) and `GameBar.tsx` (session badges). No new components, no state changes. Mobile-first: base styles target narrow screens; `sm:` prefix restores current desktop behavior.

**Tech Stack:** Next.js 15, Tailwind CSS v4, React, TypeScript

---

## Problem Summary (from screenshot)

On mobile (~390px wide), the right-side overlay column stacks three elements that together cover ~55% of the viewport height:
1. **Question card** — large padding, `text-xl` title, full instruction text, Live badge row
2. **Re-center button** — full text label
3. **Map Layer controls** — full icon+label buttons (Play / Pulse / Terrain)

Additionally the top-left session badges (MODE / SESSION) overlap the top of the map.

The bottom GameBar buttons are fine, but the `pb-20` map viewport offset could be tightened.

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/components/game/Main.tsx:443` | Right column max-width, question card padding/font, instruction text, re-center icon-only, map-layer icon-only on mobile |
| `src/lib/components/game/GameBar.tsx:278` | Session badge font sizes compact on mobile |

---

## Task 1: Compact the question card on mobile

**Problem:** The question card uses `px-4 py-3.5`, `text-xl` title, and always shows an instruction paragraph. On mobile this makes the card ~180px tall.

**Fix:** Reduce padding/font on mobile; hide instruction text on mobile.

**Files:**
- Modify: `src/lib/components/game/Main.tsx` (lines ~443–636)

- [ ] **Step 1: Open Main.tsx and locate the question card div**

  The question card starts at line ~446:
  ```tsx
  <div className="w-full rounded-[24px] border border-slate-900/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.78),rgba(30,41,59,0.72))] px-4 py-3.5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.24)] backdrop-blur-md">
  ```

- [ ] **Step 2: Reduce question card padding on mobile**

  Change:
  ```tsx
  <div className="w-full rounded-[24px] border border-slate-900/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.78),rgba(30,41,59,0.72))] px-4 py-3.5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.24)] backdrop-blur-md">
  ```
  To:
  ```tsx
  <div className="w-full rounded-[24px] border border-slate-900/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.78),rgba(30,41,59,0.72))] px-3 py-2.5 sm:px-4 sm:py-3.5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.24)] backdrop-blur-md">
  ```

- [ ] **Step 3: Reduce the header row bottom margin on mobile**

  The header `<div className="mb-3 flex items-center justify-between gap-3">` becomes:
  ```tsx
  <div className="mb-2 sm:mb-3 flex items-center justify-between gap-3">
  ```

- [ ] **Step 4: Reduce target name font size on mobile**

  Line ~514:
  ```tsx
  <p className="truncate text-xl font-black leading-tight text-white">
  ```
  Change to:
  ```tsx
  <p className="truncate text-base sm:text-xl font-black leading-tight text-white">
  ```

- [ ] **Step 5: Hide instruction paragraph on mobile**

  Line ~517 — the `<p>` with "Tap fast, trust your map read…" / "Read the land first…":
  ```tsx
  <p className="mt-1 text-xs font-medium text-slate-300">
  ```
  Change to:
  ```tsx
  <p className="hidden sm:block mt-1 text-xs font-medium text-slate-300">
  ```

- [ ] **Step 6: Reduce icon badge padding on mobile**

  The icon span at line ~488:
  ```tsx
  <span className={`mt-0.5 rounded-2xl p-2.5 text-white ...`}>
  ```
  Change to:
  ```tsx
  <span className={`mt-0.5 rounded-2xl p-2 sm:p-2.5 text-white ...`}>
  ```

- [ ] **Step 7: Verify by visual inspection**

  Start dev server (`npm run dev`), open DevTools, set viewport to 390×844 (iPhone 14). Confirm the question card is now noticeably shorter with just the target name visible and no instruction text.

- [ ] **Step 8: Commit**

  ```bash
  git add src/lib/components/game/Main.tsx
  git commit -m "fix: compact question card padding and hide instruction text on mobile"
  ```

---

## Task 2: Make map-layer control buttons icon-only on mobile

**Problem:** The Play/Pulse/Terrain buttons each show an icon + label text on two lines, making the control panel ~110px tall on mobile.

**Fix:** Hide the label text on mobile; keep the icon. The button becomes a compact icon-only square.

**Files:**
- Modify: `src/lib/components/game/Main.tsx` (lines ~653–712)

- [ ] **Step 1: Locate the map-layer controls container**

  Line ~653:
  ```tsx
  <div className="w-full rounded-[22px] border border-slate-900/10 bg-white/88 p-2 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur-md">
  ```

- [ ] **Step 2: Hide the "Map Layer / N signals" header on mobile**

  Line ~654:
  ```tsx
  <div className="mb-2 flex items-center justify-between gap-3 px-1">
  ```
  Change to:
  ```tsx
  <div className="hidden sm:flex mb-2 items-center justify-between gap-3 px-1">
  ```

- [ ] **Step 3: Reduce button padding and hide label on mobile**

  Each option button (line ~700):
  ```tsx
  className={`inline-flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 text-xs font-semibold transition cursor-pointer ${...}`}
  ```
  Change to:
  ```tsx
  className={`inline-flex flex-col items-center justify-center gap-1 rounded-2xl border p-2 sm:px-2 sm:py-2.5 text-xs font-semibold transition cursor-pointer ${...}`}
  ```

  And the label span (line ~706):
  ```tsx
  <span>{option.label}</span>
  ```
  Change to:
  ```tsx
  <span className="hidden sm:inline">{option.label}</span>
  ```

- [ ] **Step 4: Reduce map-layer container padding on mobile**

  Line ~653, change `p-2` to `p-1.5 sm:p-2`:
  ```tsx
  <div className="w-full rounded-[22px] border border-slate-900/10 bg-white/88 p-1.5 sm:p-2 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur-md">
  ```

- [ ] **Step 5: Verify buttons are compact icon squares on mobile**

  DevTools 390px viewport. The three buttons should look like small icon squares (~36px each) instead of tall pill buttons.

- [ ] **Step 6: Commit**

  ```bash
  git add src/lib/components/game/Main.tsx
  git commit -m "fix: show icon-only map layer buttons on mobile"
  ```

---

## Task 3: Make Re-center button icon-only on mobile

**Problem:** Re-center button shows "Re-center" text label on mobile, unnecessarily wide.

**Files:**
- Modify: `src/lib/components/game/Main.tsx` (lines ~639–651)

- [ ] **Step 1: Locate the re-center button**

  Line ~644:
  ```tsx
  className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-md transition hover:border-sky-300 hover:text-slate-900 cursor-pointer"
  ```

- [ ] **Step 2: Reduce padding and hide label on mobile**

  ```tsx
  className="inline-flex items-center gap-0 sm:gap-2 rounded-full border border-sky-200/80 bg-white/90 p-2 sm:px-4 sm:py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-md transition hover:border-sky-300 hover:text-slate-900 cursor-pointer"
  ```

  And hide the label:
  ```tsx
  <span className="hidden sm:inline">Re-center</span>
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/lib/components/game/Main.tsx
  git commit -m "fix: show icon-only re-center button on mobile"
  ```

---

## Task 4: Reduce right-column max-width on mobile

**Problem:** The right column uses `max-w-[min(19rem,calc(100%-1.5rem))]`. On a 390px device this allows up to 19rem (~304px) = 78% of the screen width, leaving almost no visible map on the left.

**Files:**
- Modify: `src/lib/components/game/Main.tsx` (line ~443)

- [ ] **Step 1: Locate the right column container**

  ```tsx
  <div className="pointer-events-auto absolute right-3 top-3 flex max-w-[min(19rem,calc(100%-1.5rem))] flex-col items-end gap-2 sm:right-5 sm:top-5">
  ```

- [ ] **Step 2: Constrain width more aggressively on mobile**

  Change to:
  ```tsx
  <div className="pointer-events-auto absolute right-3 top-3 flex max-w-[min(13rem,calc(100%-1.5rem))] sm:max-w-[min(19rem,calc(100%-1.5rem))] flex-col items-end gap-2 sm:right-5 sm:top-5">
  ```

  13rem ≈ 208px which on a 390px phone leaves ~170px of map visible on the left — enough to see context while reading the question.

- [ ] **Step 3: Also reduce gap between stacked elements on mobile**

  Change `gap-2` to `gap-1.5 sm:gap-2`:
  ```tsx
  <div className="pointer-events-auto absolute right-3 top-3 flex max-w-[min(13rem,calc(100%-1.5rem))] sm:max-w-[min(19rem,calc(100%-1.5rem))] flex-col items-end gap-1.5 sm:gap-2 sm:right-5 sm:top-5">
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/lib/components/game/Main.tsx
  git commit -m "fix: reduce right overlay column max-width on mobile"
  ```

---

## Task 5: Compact session badges on mobile (GameBar.tsx)

**Problem:** The MODE/SESSION badges use `text-sm` for the value labels and `px-3 py-1.5` padding. On mobile this is fine height-wise (they're horizontal), but the text is large relative to screen.

**Files:**
- Modify: `src/lib/components/game/GameBar.tsx` (lines ~278–294)

- [ ] **Step 1: Locate the session badge container**

  Line ~278:
  ```tsx
  <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 sm:left-5 sm:top-5">
  ```

- [ ] **Step 2: Reduce badge padding and font on mobile**

  First badge (MODE), line ~279:
  ```tsx
  <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-slate-950/72 px-3 py-1.5 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur-md">
      <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-200/90">
          Mode
      </span>
      <span className="text-sm font-semibold text-white">
          {modeLabel}
      </span>
  </div>
  ```
  Change to:
  ```tsx
  <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/14 bg-slate-950/72 px-2.5 py-1 sm:px-3 sm:py-1.5 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur-md">
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.24em] text-sky-200/90">
          Mode
      </span>
      <span className="text-xs sm:text-sm font-semibold text-white">
          {modeLabel}
      </span>
  </div>
  ```

  Second badge (SESSION), same treatment:
  ```tsx
  <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/14 bg-slate-950/72 px-2.5 py-1 sm:px-3 sm:py-1.5 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur-md">
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300/90">
          Session
      </span>
      <span className="text-xs sm:text-sm font-semibold text-white">
          {sessionLabel}
      </span>
  </div>
  ```

- [ ] **Step 3: Reduce gap between badges on mobile**

  Container: `gap-2` → `gap-1.5 sm:gap-2`:
  ```tsx
  <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-1.5 sm:gap-2 sm:left-5 sm:top-5">
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/lib/components/game/GameBar.tsx
  git commit -m "fix: compact session badges padding and font on mobile"
  ```

---

## Task 6: Final review and verification

- [ ] **Step 1: Start dev server**

  ```bash
  npm run dev
  ```

- [ ] **Step 2: Open Chrome DevTools → Responsive mode → 390×844 (iPhone 14)**

  Verify:
  - Question card height is ≤ 100px when showing target name only
  - Map layer buttons are icon-only squares (~36px)
  - Re-center button is a circle icon
  - More than 50% of the map viewport is unobscured
  - Left side of map is visible (session badges don't overflow)
  - Bottom bar action buttons are still accessible and not clipped

- [ ] **Step 3: Test 375×667 (iPhone SE / smallest common)**

  Same checks. No overflow. No elements cut off.

- [ ] **Step 4: Test 768px (tablet — should look like desktop)**

  Verify `sm:` styles fully restore the desktop experience. Map layer buttons show labels. Question card uses full padding and shows instruction text.

- [ ] **Step 5: Test game flow on mobile**

  - Start a game
  - Tap the map to set a marker
  - Tap "Lock Guess"
  - Tap "Next Target"
  - Verify no layout breaks at any step

- [ ] **Step 6: Final commit (if any cleanup needed)**

  ```bash
  git add -p
  git commit -m "fix: mobile layout final cleanup"
  ```
