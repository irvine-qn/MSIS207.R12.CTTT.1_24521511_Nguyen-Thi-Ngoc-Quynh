# TASK DECOMPOSITION

**Project:** KRAFTON x PUBG Vietnam Championship & Airdrop Arena

**Stack Context:** React 19, Vite, Modern ES2024 JavaScript, Scoped CSS Modules, `Intl.NumberFormat('vi-VN')`, `Page Visibility API`, `AbortController`

# 1. Yêu cầu đề bài

Nâng cấp `createAntiDriftTimer` và Virtual Scroller (Slide 22) của Lab 2 HW 3 thành nền tảng "PUBG Vietnam Series (PVS) Finals Ticket & G-Coin Contraband Crate Arena".

### Module 1: Zero-Drift Airdrop & Ticket Countdown Hook

* **Req 1.1:** Chuyển timer delta `Date.now()` của Lab 2 thành hook `usePubgAirdropTimer(targetEpochMs)`.
* **Req 1.2:** Thời gian còn lại = `Math.max(0, targetEpochMs - Date.now())`, cấm `setInterval(s => s - 1, 1000)`.
* **Req 1.3:** Đăng ký `visibilitychange` để đồng bộ lại khi mở lại tab background.
* **Req 1.4:** Chuyển phase theo `DropPhase`: `'WARMUP' | 'AIRDROP_LIVE' | 'LOOTED_OUT' | 'EXPIRED'`.

### Module 2: Optimistic Crate / Ticket Claim & 409 Rollback

* **Req 2.1:** Claim PVS Grand Finals VIP Ticket và G-Coin Crate.
* **Req 2.2:** Giá hiển thị VND qua `Intl.NumberFormat('vi-VN')`.
* **Req 2.3:** Trừ `remainingStock` theo optimistic update, tự động rollback khi server trả 409 Conflict.

### Module 3: Live PUBG VN Leaderboard & Kill-Feed Filter

* **Req 3.1:** Danh sách squad Việt Nam (The Expendables, Cerberus Esports, Roy Esports, AGG).
* **Req 3.2:** Lọc và sắp xếp theo WWCD, Placement Points, Kill Points.
* **Req 3.3:** Danh sách dài dùng Virtual List từ Lab 2 HW 3.

### Deliverable

* Nộp `AI_FAILURE_AUDIT.md`.

# 2. Contract-First Definition

### 2.1 Domain contract (`pubg-vn-arena-contract.ts`)

```ts
export type DropPhase = 'WARMUP' | 'AIRDROP_LIVE' | 'LOOTED_OUT' | 'EXPIRED';

export interface PubgCrateDrop {
  readonly id: string;
  readonly title: string;          // 'PVS Finals VIP Pass + 5,000 G-Coin'
  readonly priceVnd: number;       // Intl.NumberFormat('vi-VN')
  readonly remainingStock: number;
  readonly dropEpochMs: number;
}

export interface PubgVnSquadStanding {
  readonly squadId: string;        // 'te' | 'ces' | 'ge' | 'agg'
  readonly squadName: string;
  readonly wwcdCount: number;
  readonly placementPts: number;
  readonly killPts: number;
}
```

### 2.2 Hook contract

```js
usePubgAirdropTimer(targetEpochMs) -> { remainingMs, phase }
// cleanup: clear timer + removeEventListener('visibilitychange')
```

### 2.3 Component Props contract

| Component          | Props                                         | Ghi chú                                                         |
| ------------------ | --------------------------------------------- | ---------------------------------------------------------------- |
| `AirdropCountdown` | `{ targetEpochMs }`                        | Hiển thị qua `<time>` / `<output>`                          |
| `CrateCard`      | `{ drop, phase, onClaim }`                  | `<article>`, thông tin dùng `<dl>`, nút disable theo phase |
| `Leaderboard`    | `{ standings }`                             | Lọc và sắp xếp là derived state trong render              |
| `SquadRow`       | `{ squad }`                                 | `key={squad.squadId}`                                          |

### 2.4 State Machine contract (Drop)

```
WARMUP --hết đếm ngược--> AIRDROP_LIVE --stock = 0--> LOOTED_OUT
AIRDROP_LIVE --hết thời gian drop--> EXPIRED
```

# 3. Functional Slicing (WBS)

Mỗi dòng là 1 sub-task độc lập = 1 lần prompt AI = 1 atomic commit.

### Phase 0 - Setup

| ID  | Sub-task                                                               | Kiểm thử                    | Commit                                         |
| --- | ---------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------- |
| 0.1 | Khởi tạo project Vite React 19, `createRoot` bọc `<StrictMode>` | `npm run dev` chạy được | `chore(hw3): scaffold vite react 19 project` |
| 0.2 | Khai báo CSS Custom Properties tại `:root` theo color palette      | Không có inline style       | `style(hw3): add root css custom properties` |
| 0.3 | Tạo file contract `DropPhase`, `PubgCrateDrop`, `PubgVnSquadStanding` | Khớp đề bài              | `feat(hw3): define pubg vn arena contract`   |

### Phase 1 - Module 1: Airdrop Timer

| ID  | Sub-task                                                                                 | Kiểm thử                                    | Commit                                             |
| --- | ---------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| 1.1 | Hook `usePubgAirdropTimer` tính `Math.max(0, targetEpochMs - Date.now())`, có cleanup | Đếm đúng, unmount không leak            | `feat(hw3): add zero drift airdrop timer hook`   |
| 1.2 | Resync khi `visibilitychange`                                                         | Ẩn tab 30s, mở lại thời gian đúng       | `fix(hw3): resync timer on visibilitychange`     |
| 1.3 | Hàm thuần tính `DropPhase` từ thời gian và stock                                  | Phase đúng theo state machine              | `feat(hw3): derive drop phase from time and stock`|
| 1.4 | Component `AirdropCountdown` semantic, accessible                                     | Accessibility Tree đúng                    | `feat(hw3): add accessible airdrop countdown`    |

### Phase 2 - Module 2: Optimistic Claim

| ID  | Sub-task                                                                                         | Kiểm thử                                  | Commit                                          |
| --- | ------------------------------------------------------------------------------------------------ | ------------------------------------------- | ----------------------------------------------- |
| 2.1 | Component `CrateCard` dùng `<article>`, `<dl>`, giá VND qua `Intl.NumberFormat('vi-VN')` | Giá hiển thị dạng `5.000.000 ₫`       | `feat(hw3): add CrateCard with vnd price`     |
| 2.2 | Optimistic claim trừ `remainingStock` bất biến                                              | Stock giảm ngay khi nhấn               | `feat(hw3): add optimistic crate claim`       |
| 2.3 | Rollback khi 409 Conflict, thông báo qua `<output role="alert">`                         | Giả lập 409, stock trả về giá trị cũ | `fix(hw3): rollback claim on 409 conflict`    |
| 2.4 | Request claim dùng `AbortController`, `catch` bỏ qua `AbortError`                       | Unmount khi đang claim không lỗi giả  | `fix(hw3): abort pending claim request`       |

### Phase 3 - Module 3: Leaderboard

| ID  | Sub-task                                                                                           | Kiểm thử                         | Commit                                              |
| --- | -------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------- |
| 3.1 | Component `Leaderboard` render squad, `key={squad.squadId}`                                    | Hiển thị 4 squad VN             | `feat(hw3): add pubg vn leaderboard`              |
| 3.2 | Filter và sort bằng `.filter()`, `.toSorted()` là derived state trong render, control ghép `label` qua `useId()` | Sort đúng theo WWCD, Placement, Kill | `feat(hw3): filter and sort squad standings`   |
| 3.3 | Tích hợp Virtual List từ Lab 2 HW 3 cho danh sách dài                                   | DOM chỉ render các dòng hiển thị | `perf(hw3): virtualize leaderboard rows`          |
| 3.4 | Layout responsive 375px                                                                         | Không cuộn ngang ở 375px        | `style(hw3): make arena layout responsive`        |

### Phase 4 - Verification & Deliverables

| ID  | Sub-task                                                                                | Kiểm thử                | Commit                                          |
| --- | --------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------- |
| 4.1 | Kiểm thử timer, rollback, leaderboard bằng Chrome DevTools, chụp bằng chứng   | Đạt Acceptance Criteria | `test(hw3): verify timer claim and leaderboard` |
| 4.2 | Viết `AI_FAILURE_AUDIT.md` tối thiểu 3 lỗi AI kèm bằng chứng và code refactor | Đủ 3 lỗi               | `docs(hw3): add ai failure audit`             |

---

# 4. Ràng buộc kỹ thuật bắt buộc

* 100% Functional Component, không `class`, không `defaultProps`, dùng default parameter.
* Chỉ import hook cần dùng: `import { useState, useEffect, useRef, useId } from 'react'`.
* Không dùng `var`. Mặc định `const`, chỉ dùng `let` khi gán lại.
* Cấm `setInterval(s => s - 1, 1000)` thuần, dùng mốc `targetEpochMs - Date.now()` và `visibilitychange`.
* Không `key={index}`, dùng `key={item.id}` / `key={squad.squadId}`.
* Không mutate state, dùng spread, `.filter()`, `.toSorted()`.
* Không tạo state dư thừa đồng bộ qua `useEffect`, filter/sort tính trong render.
* Mọi `useEffect` có side-effect (timer, listener, fetch) phải trả về hàm cleanup, fetch dùng `AbortController`.
* Input số đọc qua `e.target.valueAsNumber` kèm `Number.isNaN`.
* Không inline style, chỉ dùng `*.module.css` và CSS Custom Properties, màu theo palette `#9FA0FF`, `#D5E8E6`, `#FFF3E3`, `#FF7171`.
* Không Tailwind, Bootstrap, jQuery, CDN ngoài.
* Không `innerHTML`, không `window.alert()`.
* Semantic JSX: `main`, `section`, `article`, `dl`, `output`, hạn chế `div`.
* Không tự ý thêm hình ảnh/logo squad, phải thông báo người dùng.

# 5. Acceptance Criteria Checklist

- [ ] `usePubgAirdropTimer` không drift, resync khi mở lại tab background.
- [ ] Phase chuyển đúng `WARMUP` → `AIRDROP_LIVE` → `LOOTED_OUT` / `EXPIRED`.
- [ ] Giá hiển thị VND qua `Intl.NumberFormat('vi-VN')`.
- [ ] Claim optimistic và rollback đúng khi 409 Conflict.
- [ ] Leaderboard lọc và sắp xếp theo WWCD, Placement Points, Kill Points.
- [ ] Hiển thị đúng ở 375px, không cuộn ngang.
- [ ] Tối thiểu 10 atomic commits chuẩn Conventional Commits.
- [ ] Có đủ `project_rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md`.
