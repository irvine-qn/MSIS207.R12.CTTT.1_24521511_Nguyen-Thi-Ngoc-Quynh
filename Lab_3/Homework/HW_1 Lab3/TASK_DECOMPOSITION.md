# TASK DECOMPOSITION

**Project:** Production Studio Drum Kit (WCAG 2.2 AA & 100 Lighthouse)

**Stack Context:** React 19, Vite, Modern ES2024 JavaScript, Scoped CSS Modules, Web Audio API, ES6 `Map`, W3C `KeyboardEvent.code`

# 1. Yêu cầu đề bài

### Module 1: Keyboard Engine (Physical Key Codes)

* **Req 1.1: Physical Key Codes (`e.code`) thay cho `keyCode`**
  * Lắng nghe `keydown` / `keyup` trên `window`.
  * Dùng `e.code`: `'KeyW'`, `'KeyA'`, `'KeyS'`, `'KeyD'`, `'KeyJ'`, `'KeyK'`, `'KeyL'` để bộ gõ tiếng Việt (UniKey) không làm hỏng trigger.
  * Tra cứu pad qua `padMap.get(e.code)` (ES6 `Map`).
* **Req 1.2: Anti-Repeat Guard**
  * Chặn spam khi giữ phím: `if (e.repeat) return;`.
* **Req 1.3: Input Focus Isolation**
  * Bỏ qua phím tắt khi đang gõ trong `INPUT`, `TEXTAREA`, `SELECT`.
* **Req 1.4: Hook `useDrumKeyboard(padMap, onTriggerPad, isEnabled = true)`**
  * `e.preventDefault()` khi khớp pad.
  * Cleanup `removeEventListener` khi unmount hoặc dependency đổi.

### Module 2: Accessible Pads (WCAG 2.2 AA)

* **Req 2.1:** Pad là `<button aria-pressed={isActive}>`, dùng được bằng chuột, cảm ứng và bàn phím.
* **Req 2.2:** Focus hiển thị rõ ràng, tương phản màu đạt AA.

### Module 3: Deaf / Hard-of-Hearing Visual Feedback

* **Req 3.1:** Hit history render trong `<output aria-live="polite">`.
* **Req 3.2:** Visual decibel meter hiển thị mức âm lượng khi pad được kích hoạt.

### Module 4: Production Quality

* **Req 4.1:** Lighthouse đạt 100 (Performance, Accessibility, Best Practices, SEO).
* **Req 4.2:** Hiển thị đúng ở viewport 375px, không cuộn ngang.

# 2. Contract-First Definition

### 2.1 Data contract

```js
// Pad trong padMap: Map<code, Pad>
{ id, code, label, soundSrc }

// Hit log entry
{ id, padId, label, timestampMs }
```

### 2.2 Hook contract

```js
useDrumKeyboard(padMap, onTriggerPad, isEnabled = true)
// keydown: bỏ qua e.repeat, bỏ qua INPUT/TEXTAREA/SELECT,
// padMap.get(e.code) -> e.preventDefault() -> onTriggerPad(pad.id)
// return cleanup removeEventListener
```

### 2.3 Component Props contract

| Component        | Props                                          | Ghi chú                                                    |
| ---------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| `DrumPad`      | `{ id, label, keyHint, isActive = false, onTrigger }` | `<button type="button" aria-pressed={isActive}>`         |
| `DrumGrid`     | `{ pads, activeId, onTrigger }`              | `key={pad.id}`, không dùng index                         |
| `HitLog`       | `{ hits }`                                   | `<output aria-live="polite">`, danh sách lịch sử hit |
| `DecibelMeter` | `{ level }`                                  | Dẫn xuất từ state, không inline style                  |

# 3. Functional Slicing (WBS)

Mỗi dòng là 1 sub-task độc lập = 1 lần prompt AI = 1 atomic commit.

### Phase 0 - Setup

| ID  | Sub-task                                                               | Kiểm thử                    | Commit                                         |
| --- | ---------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------- |
| 0.1 | Khởi tạo project Vite React 19, `createRoot` bọc `<StrictMode>` | `npm run dev` chạy được | `chore(hw1): scaffold vite react 19 project` |
| 0.2 | Khai báo CSS Custom Properties tại `:root` theo color palette      | Không có inline style       | `style(hw1): add root css custom properties` |
| 0.3 | Thông báo và chuẩn bị file âm thanh cho 7 pad (người dùng cung cấp) | Đủ 7 file, load được   | `chore(hw1): add drum sound assets`          |

### Phase 1 - Module 1: Keyboard Engine

| ID  | Sub-task                                                                              | Kiểm thử                                 | Commit                                                |
| --- | ------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| 1.1 | Tạo `padMap` kiểu `Map` với 7 key `e.code`                                       | `padMap.get('KeyW')` trả đúng pad     | `feat(hw1): define drum pad map by event code`      |
| 1.2 | Hook `useDrumKeyboard` lắng nghe `keydown`, cleanup listener                     | Unmount không còn listener              | `feat(hw1): add useDrumKeyboard hook`               |
| 1.3 | Anti-repeat guard `e.repeat` và bỏ qua `INPUT`, `TEXTAREA`, `SELECT`         | Giữ phím chỉ kêu 1 lần, gõ input không kích hoạt pad | `fix(hw1): guard key repeat and input focus` |
| 1.4 | Xử lý `keyup` để tắt trạng thái active của pad                                | Nhả phím pad về trạng thái thường   | `feat(hw1): release pad state on keyup`             |

### Phase 2 - Module 2: Accessible Pads & Audio

| ID  | Sub-task                                                                                   | Kiểm thử                                  | Commit                                            |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------- |
| 2.1 | Component `DrumPad` với `<button aria-pressed>` và CSS Module                         | Accessibility Tree đúng role và state    | `feat(hw1): add accessible DrumPad button`      |
| 2.2 | Component `DrumGrid` layout Grid `auto-fit` cho 375px                                    | Không cuộn ngang ở 375px                | `feat(hw1): add responsive DrumGrid layout`     |
| 2.3 | Phát âm thanh qua Web Audio khi trigger, `AudioContext` khởi tạo theo user gesture, có cleanup | Nhấn chuột và bàn phím đều có tiếng | `feat(hw1): play pad sound with web audio`      |
| 2.4 | Style focus rõ ràng và tương phản đạt WCAG 2.2 AA                                    | Kiểm tra contrast, Tab qua các pad      | `fix(a11y): add visible focus and aa contrast`  |

### Phase 3 - Module 3: Visual Feedback

| ID  | Sub-task                                                                             | Kiểm thử                                  | Commit                                         |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------- | ---------------------------------------------- |
| 3.1 | Component `HitLog` trong `<output aria-live="polite">`, thêm hit bằng spread       | Screen reader đọc hit mới                 | `feat(hw1): add aria-live hit history log`   |
| 3.2 | Component `DecibelMeter` hiển thị mức âm, không inline style                    | Meter thay đổi khi nhấn pad              | `feat(hw1): add visual decibel meter`        |

### Phase 4 - Verification & Deliverables

| ID  | Sub-task                                                                           | Kiểm thử                     | Commit                                          |
| --- | ---------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------- |
| 4.1 | Chạy Lighthouse, sửa lỗi đến khi đạt 100 các mục                            | Report 100 / 100 / 100 / 100   | `perf(hw1): reach 100 lighthouse score`       |
| 4.2 | Kiểm thử bằng Chrome DevTools và UniKey, chụp bằng chứng                    | Đạt Acceptance Criteria      | `test(hw1): verify keyboard and a11y behavior`|
| 4.3 | Viết `AI_FAILURE_AUDIT.md` tối thiểu 3 lỗi AI kèm bằng chứng và code refactor | Đủ 3 lỗi                    | `docs(hw1): add ai failure audit`             |

---

# 4. Ràng buộc kỹ thuật bắt buộc

* 100% Functional Component, không `class`, không `defaultProps`, dùng default parameter.
* Chỉ import hook cần dùng: `import { useState, useEffect, useRef, useCallback, useId } from 'react'`.
* Không dùng `var`. Mặc định `const`, chỉ dùng `let` khi gán lại.
* Không `keypress` / `keyCode`, chỉ dùng `event.code`.
* Không `key={index}`, dùng `key={item.id}`.
* Không mutate state, dùng spread, `.filter()`, `.toSorted()`.
* Không tạo state dư thừa đồng bộ qua `useEffect`, dữ liệu dẫn xuất tính trong render.
* Mọi `useEffect` có side-effect (listener, AudioContext) phải trả về hàm cleanup.
* Không inline style, chỉ dùng `*.module.css` và CSS Custom Properties, màu theo palette `#9FA0FF`, `#D5E8E6`, `#FFF3E3`, `#FF7171`.
* Không Tailwind, Bootstrap, jQuery, CDN ngoài.
* Không `innerHTML`, không `window.alert()`.
* Semantic JSX: `main`, `section`, `header`, `output`, hạn chế `div`.
* Không tự ý thêm hình ảnh hay âm thanh, phải thông báo người dùng.

# 5. Acceptance Criteria Checklist

- [ ] 7 pad kích hoạt bằng `e.code` (W A S D J K L), hoạt động khi bật UniKey.
- [ ] Giữ phím không spam âm thanh (`e.repeat`).
- [ ] Gõ trong `<input>` không kích hoạt pad.
- [ ] Pad là `<button aria-pressed>`, thao tác được hoàn toàn bằng bàn phím.
- [ ] Hit log `aria-live="polite"` và decibel meter hoạt động.
- [ ] Lighthouse 100 cả 4 mục, WCAG 2.2 AA.
- [ ] Hiển thị đúng ở 375px, không cuộn ngang.
- [ ] Tối thiểu 10 atomic commits chuẩn Conventional Commits.
- [ ] Có đủ `project_rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md`.
