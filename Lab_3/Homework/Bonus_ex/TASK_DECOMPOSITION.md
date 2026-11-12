# TASK DECOMPOSITION

**Project:** 'Hẹn Hò Nhưng Không Yêu' State Machine - `<SituationshipAnalyzer />`

**Stack Context:** React 19 (`useReducer`, `useId`), Vite, Modern ES2024 JavaScript, Scoped CSS Modules, `AbortController`

# 1. Yêu cầu đề bài

### Module 1: Banning 'Situationship' Boolean Soup

* **Req 1.1:** Loại bỏ các boolean mâu thuẫn (`isDating = true && isLoved = false && hasTitle = false`) gây phá vỡ UI invariant.
* **Req 1.2:** Refactor thành FSM chặt chẽ với một biến phase duy nhất.
  * Slide đề bài nêu 2 tập phase khác nhau:
    * Spec: `'STRANGERS' | 'DATING_NO_LOVE' | 'COMMITTED' | 'SELF_RESPECT_EXIT'`
    * Contract code: `'FRIENDS' | 'DATING_NO_LOVE' | 'OFFICIAL_LOVE' | 'GHOSTED_EXIT'`
  * **Cần người dùng chốt 1 tập phase trước khi code sub-task 1.1.**

### Module 2: Asymmetric Effort Reducer ('Cố Trăm Lần vs Một Phần')

* **Req 2.1:** Mô hình 'Em cố trăm lần (100x weight 0.1) chẳng bằng ai đó một phần (1x weight 50)'.
* **Req 2.2:** Dùng immutable action log và pure Derived State.

### Module 3: 'Seen Không Rep' Ghosting Timer & AbortController

* **Req 3.1:** Gửi tin nhắn khởi động timer chờ trả lời 5s trong `useEffect`.
* **Req 3.2:** Nếu bị bỏ qua hoặc chuyển sang 'Ai Đó': abort promise đang chờ và giải phóng bộ nhớ (cleanup).

### Module 4: Accessible Red-Flag Alert & 375px UI

* **Req 4.1:** Mọi input signal ghép `label` qua `useId()`.
* **Req 4.2:** Cảnh báo Red-Flag qua `<output role="status" aria-live="polite">`.
* **Req 4.3:** Hiển thị đúng ở 375px.

# 2. Contract-First Definition

### 2.1 Domain contract (`hen-ho-khong-yeu-spec.ts`)

```ts
export type RelationshipPhase =
  | 'FRIENDS'
  | 'DATING_NO_LOVE'   // 'Hẹn hò nhưng không yêu'
  | 'OFFICIAL_LOVE'    // Verified mutual commitment
  | 'GHOSTED_EXIT';    // Unmounted & memory freed

export interface EffortSignal {
  readonly id: string;
  readonly actor: 'EM' | 'AI_DO';
  readonly steps: number;       // 1000 steps vs 1 step
  readonly multiplier: number;  // 0.05 vs 100.0
}
```

### 2.2 Reducer contract

```js
// state
{ phase, effortLog: EffortSignal[] }

// actions
{ type: 'LOG_EFFORT', signal }
{ type: 'TRANSITION', to }
{ type: 'GHOSTED' }
```

* Reducer là hàm thuần, chỉ cho phép transition hợp lệ theo bảng FSM.
* Tổng effort mỗi actor (`steps * multiplier`) là derived state tính trong render.

### 2.3 State Machine contract

```
FRIENDS --bắt đầu hẹn hò--> DATING_NO_LOVE --xác nhận cả hai--> OFFICIAL_LOVE
DATING_NO_LOVE --seen không rep quá 5s / chọn Ai Đó--> GHOSTED_EXIT
```

### 2.4 Component Props contract

| Component         | Props                          | Ghi chú                                                   |
| ----------------- | ------------------------------ | ---------------------------------------------------------- |
| `PhaseBadge`    | `{ phase }`                  | Hiển thị phase hiện tại                               |
| `EffortForm`    | `{ onLogEffort }`            | Input ghép `label` qua `useId()`, đọc `valueAsNumber` |
| `EffortSummary` | `{ effortLog }`              | `<dl>` hiển thị tổng effort EM và AI_DO              |
| `RedFlagAlert`  | `{ message }`                | `<output role="status" aria-live="polite">`             |
| `ChatPanel`     | `{ phase, onSend, onGhosted }` | Timer 5s, `AbortController` cleanup                   |

# 3. Functional Slicing (WBS)

Mỗi dòng là 1 sub-task độc lập = 1 lần prompt AI = 1 atomic commit.

### Phase 0 - Setup

| ID  | Sub-task                                                               | Kiểm thử                    | Commit                                           |
| --- | ---------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------ |
| 0.1 | Khởi tạo project Vite React 19, `createRoot` bọc `<StrictMode>` | `npm run dev` chạy được | `chore(bonus): scaffold vite react 19 project` |
| 0.2 | Khai báo CSS Custom Properties tại `:root` theo color palette      | Không có inline style       | `style(bonus): add root css custom properties` |

### Phase 1 - Module 1: FSM

| ID  | Sub-task                                                                      | Kiểm thử                                   | Commit                                            |
| --- | ----------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------- |
| 1.1 | Tạo contract `RelationshipPhase`, `EffortSignal` (theo tập phase đã chốt) | Khớp đề bài                              | `feat(bonus): define relationship fsm contract` |
| 1.2 | Reducer thuần với bảng transition hợp lệ                                | Transition sai bị bỏ qua, không mutate  | `feat(bonus): add relationship phase reducer`   |
| 1.3 | Component `PhaseBadge` thay cho boolean soup                              | Không còn `isDating`, `isLoved`         | `refactor(bonus): replace boolean soup with fsm`|

### Phase 2 - Module 2: Asymmetric Effort

| ID  | Sub-task                                                                                    | Kiểm thử                                        | Commit                                          |
| --- | ------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| 2.1 | Action `LOG_EFFORT` thêm signal bằng spread vào `effortLog`                           | Log bất biến, `key={signal.id}`                | `feat(bonus): add immutable effort action log`|
| 2.2 | Hàm thuần tính tổng effort (`steps * multiplier`) theo actor, derived trong render | 1000 x 0.05 = 50 nhỏ hơn 1 x 100 = 100              | `feat(bonus): derive asymmetric effort score` |
| 2.3 | Component `EffortForm` dùng `useId()`, `valueAsNumber` + `Number.isNaN`               | Nhập sai không ghép chuỗi                    | `feat(bonus): add accessible effort form`     |
| 2.4 | Component `EffortSummary` dùng `<dl>`                                                   | Hiển thị đúng 2 actor                        | `feat(bonus): add effort summary list`        |

### Phase 3 - Module 3: Ghosting Timer

| ID  | Sub-task                                                                                       | Kiểm thử                                    | Commit                                          |
| --- | ---------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| 3.1 | `ChatPanel` gửi tin nhắn khởi động timer 5s trong `useEffect`, cleanup timer           | Sau 5s không rep chuyển phase              | `feat(bonus): add seen no reply ghost timer`  |
| 3.2 | `AbortController` hủy promise chờ khi bị ghost hoặc chuyển sang 'Ai Đó', bỏ qua `AbortError` | Không lỗi giả, Memory tab không leak    | `fix(bonus): abort pending reply on ghosting` |

### Phase 4 - Module 4: Red-Flag Alert & UI

| ID  | Sub-task                                                                     | Kiểm thử                      | Commit                                            |
| --- | ---------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------- |
| 4.1 | `RedFlagAlert` qua `<output role="status" aria-live="polite">`, message derived từ phase và effort | Screen reader đọc cảnh báo | `feat(bonus): add accessible red flag alert`    |
| 4.2 | Layout responsive 375px                                                   | Không cuộn ngang ở 375px    | `style(bonus): make analyzer responsive`        |

### Phase 5 - Verification & Deliverables

| ID  | Sub-task                                                                                | Kiểm thử                | Commit                                            |
| --- | --------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------- |
| 5.1 | Kiểm thử FSM, timer, a11y bằng Chrome DevTools, chụp bằng chứng                  | Đạt Acceptance Criteria | `test(bonus): verify fsm timer and a11y`        |
| 5.2 | Viết `AI_FAILURE_AUDIT.md` tối thiểu 3 lỗi AI kèm bằng chứng và code refactor | Đủ 3 lỗi               | `docs(bonus): add ai failure audit`             |

---

# 4. Ràng buộc kỹ thuật bắt buộc

* 100% Functional Component, không `class`, không `defaultProps`, dùng default parameter.
* Chỉ import hook cần dùng: `import { useReducer, useEffect, useRef, useId } from 'react'`.
* Không dùng `var`. Mặc định `const`, chỉ dùng `let` khi gán lại.
* Không boolean soup, trạng thái quan hệ chỉ lưu trong 1 biến `phase`.
* Không `key={index}`, dùng `key={signal.id}`.
* Không mutate state, dùng spread, `.filter()`, `.toSorted()`.
* Không tạo state dư thừa đồng bộ qua `useEffect`, tổng effort và red-flag tính trong render.
* Mọi `useEffect` có side-effect (timer, promise) phải trả về hàm cleanup, dùng `AbortController`.
* Input số đọc qua `e.target.valueAsNumber` kèm `Number.isNaN`.
* Không inline style, chỉ dùng `*.module.css` và CSS Custom Properties, màu theo palette `#9FA0FF`, `#D5E8E6`, `#FFF3E3`, `#FF7171`.
* Không Tailwind, Bootstrap, jQuery, CDN ngoài.
* Không `innerHTML`, không `window.alert()`.
* Semantic JSX: `main`, `section`, `header`, `dl`, `output`, hạn chế `div`.

# 5. Acceptance Criteria Checklist

- [ ] Không còn boolean soup, FSM 4 phase với transition hợp lệ.
- [ ] Effort log bất biến, tổng effort là derived state đúng công thức bất đối xứng.
- [ ] Timer 5s 'Seen không rep' chuyển phase và abort promise, không leak.
- [ ] Mọi input ghép `label` qua `useId()`.
- [ ] Red-Flag thông báo qua `<output role="status" aria-live="polite">`.
- [ ] Hiển thị đúng ở 375px, không cuộn ngang.
- [ ] Tối thiểu 10 atomic commits chuẩn Conventional Commits.
- [ ] Có đủ `project_rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md`.
