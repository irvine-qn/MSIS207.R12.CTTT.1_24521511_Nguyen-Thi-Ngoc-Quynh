
# Requirement Decomposition & System Architecture

**Project:** VinaFlash - High-Concurrency Vietnam Mega-Sale Platform

**Assignment:** HW 3: High-Concurrency Flash-Sale E-Commerce Engine

**Focus:** Zero-Drift Countdown Timers, Optimistic Inventory Lock State Machine, AI Failure Audits & Conventional Commits

---

## 1. Executive Summary & Application Context

**VinaFlash** is an e-commerce platform engineered specifically for high-concurrency Vietnam Flash Sale events (modeled after Shopee/Lazada 11.11 Midnight Flash Sales).

During midnight mega-sales, millions of users hit the server simultaneously to claim high-demand items with limited stock (e.g., iPhone 16 Pro Max at 90% discount). The engine requires extreme precision:

1. A **Zero-Drift Timer** using `Date.now()` delta calculation with `requestAnimationFrame` to ensure all buyers see the exact same lock/sale expiry down to the millisecond.
2. An **Optimistic Inventory Lock State Machine** handling stock reservation, lock timeouts (e.g., 5-minute checkout reservation), release on expiration, and atomic checkout transitions.

---

## 2. Project Specification Decomposition

```
                         +-------------------------------------------------------+
                         | HW 3: High-Concurrency Flash-Sale E-Commerce Engine   |
                         +-------------------------------------------------------+
                                                     |
        +--------------------+-----------------------+-----------------------+--------------------+
        |                    |                       |                       |                    |
        v                    v                       v                       v                    v
+----------------+   +-------------------+   +-------------------+   +----------------+   +-------------------+
| Vietnam Domain |   | Zero-Drift Timer  |   | Inventory Lock    |   | AI Failure     |   | Atomic Commits    |
| (11.11 Sales)  |   | (rAF Delta Loop)  |   | State Machine     |   | Mode Audit     |   | (>= 8 Discrete)   |
+----------------+   +-------------------+   +-------------------+   +----------------+   +-------------------+
```

### A. Vietnam Mega-Sale Domain Specifics

* **Scenario:** High-velocity traffic surge during scheduled drops (11.11 Midnight, 12.12 Mega Sale).
* **High-Demand Stock:** Items with strict inventory caps (e.g., 50 units of flagship smartphones).
* **Locales & Formatting:** Display prices in VND (`₫`), localized countdown labels (Giờ, Phút, Giây, Millisecond).

### B. Zero-Drift Anti-Drift Timer Architecture

* **The Problem:** Standard `setInterval` or `setTimeout` drifts over time due to JavaScript Event Loop throttling, CPU load, and background tab execution.
* **The Solution:** Delta-based precision timer calculating `Math.max(0, targetTime - Date.now())` driven by `requestAnimationFrame` (rAF).
* **Guarantees:** Zero timer skew even across long countdown durations or heavy CPU load.

### C. Optimistic Inventory Lock State Machine

* **States:** `AVAILABLE` $\rightarrow$ `RESERVED` (Locked) $\rightarrow$ `PURCHASED` (Checked out) OR `EXPIRED` (Returned to pool).
* **Lock Expiry:** Temporary reservation lock (e.g., 300 seconds) given to a user when clicking "Claim/Hold Item".
* **Concurrency Protection:** Optimistic state transitions with rollback on lock expiration.

### D. AI Failure Mode Audit (`AI_FAILURE_AUDIT.md`)

* Documentation of $\ge 3$ distinct failure modes or bugs introduced by LLM code generation (e.g., race conditions during timer cleanup, state mutations in state machine, time drift under background tab throttling).

### E. Commit Strategy Constraints

* Minimum **8 discrete atomic commits** strictly adhering to the **Conventional Commits** specification (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).

---

## 3. Core Contract Code (`anti-drift-timer.ts`)

```typescript
// Precision Anti-Drift Countdown Implementation
export function createAntiDriftTimer(
  durationMs: number,
  onTick: (remaining: number) => void
): () => void {
  const targetTime = Date.now() + durationMs;
  let rafId: number;

  function tick() {
    const remaining = Math.max(0, targetTime - Date.now());
    onTick(remaining);
    if (remaining > 0) {
      rafId = requestAnimationFrame(tick); // Zero drift compared to setInterval
    }
  }

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}
```

---

## 4. State Machine Diagram

```
                 [ Item In Stock ] (AVAILABLE)
                         |
             User Clicks "Hold Item"
                         |
                         v
                 [ Stock Reserved ] (RESERVED)
                    /          \
      User Pays    /            \ Lock Timer Expires
      Within Time /              \ (300s Elapsed)
                 v                v
       [ Sold Out ]            [ Released Back ]
       (PURCHASED)               (AVAILABLE)
```

---

## 5. Requirement Verification Matrix

| Requirement                       | Module / Component                      | Verification Method                                                                                                     |
| :-------------------------------- | :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **Zero-Drift Timer**        | `src/engine/antiDriftTimer.ts`        | Delta evaluation test comparing `Date.now()` vs rAF execution                                                         |
| **Inventory State Machine** | `src/engine/inventoryStateMachine.ts` | Unit testing state transitions (`AVAILABLE` $\rightarrow$ `RESERVED` $\rightarrow$ `PURCHASED` / `EXPIRED`) |
| **Vietnam Market UX**       | `src/components/FlashSaleCard.tsx`    | VND currency formatting, Vietnamese UI strings, stock progress bar                                                      |
| **AI Audit Document**       | `AI_FAILURE_AUDIT.md`                 | Formal report analyzing 3+ AI-generated edge-case failures                                                              |
| **Atomic Commits**          | Git History                             | Verifying $\ge 8$ commit logs matching Conventional Commits rules                                                     |
