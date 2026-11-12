# TASK DECOMPOSITION

**Project:** Production Studio Drum Kit (WCAG 2.2 AA & 100 Lighthouse)

**Stack Context:** React 19, Vite, Modern ES2024 JavaScript, Scoped CSS Modules, Web Audio API, ES6 `Map`, W3C `KeyboardEvent.code`

**Nguồn refactor:**

* Legacy Slide 26 Drum Kit (phím `w a s d j k l`).
* Lab 2 HW 1 `Lab_2/Homework/HW_1/my-app` (Enterprise Data-Grid, WCAG 2.2 AA & 100 Lighthouse): kế thừa kỹ thuật keyboard và focus.

# 1. Phân tích nguồn kế thừa Lab 2 HW 1

### 1.1 Kỹ thuật được giữ lại và áp dụng cho Drum Kit

| Lab 2 HW 1 (`DataGrid.tsx`)                                                        | Áp dụng trong Lab 3 HW 1                                                          |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Roving `tabIndex` (`isActive ? 0 : -1`) và `cellRefs` kiểu `Map` để focus   | Di chuyển focus giữa các pad bằng phím mũi tên, chỉ 1 pad có `tabIndex={0}` |
| `switch (event.key)` + `event.preventDefault()` cho Arrow, Home, End, Enter, Space | Điều hướng trong lưới pad. Trigger pad bằng phím tắt phải dùng `e.code`    |
| Vùng thông báo `<p role="status" aria-live="polite">` (`announcement`)          | Chuyển thành `<output aria-live="polite">` cho Hit Log                         |
| `aria-sort`, `aria-selected` phản ánh state                                      | `aria-pressed={isActive}` trên `<button>` pad                                   |
| `focusRing` `focus-visible` outline 2px, offset 2px                                | Giữ quy tắc focus-visible, viết lại bằng CSS Module                           |
| Ma trận contrast 4.5:1 (text) và 3:1 (UI, focus)                                   | Kiểm tra lại contrast với palette mới                                         |
| `useId()` ghép `label` cho `input`, `select`                                     | Giữ cho input nhập liệu (dùng để kiểm thử Input Focus Isolation)          |
| Sách hướng dẫn phím tắt cho người dùng (đoạn hướng dẫn trong `page.tsx`) | Hiển thị bảng phím tắt pad bằng `<dl>`                                     |

### 1.2 Anti-pattern trong Lab 2 HW 1 phải loại bỏ khi refactor

| Lab 2 HW 1                                                                 | Vi phạm project_rules                         | Cách sửa                                        |
| -------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- |
| Next.js + TypeScript                                                      | Core stack là Vite + ES2024 JavaScript       | Dựng lại bằng Vite React 19                    |
| Tailwind CSS (`@import "tailwindcss"`, class utility)                    | Cấm Tailwind                                  | CSS Modules + CSS Custom Properties tại `:root` |
| Hardcode màu `#0F172A`, `#38BDF8`, `#94A3B8`                          | Màu phải nằm trong palette                  | Dùng `#9FA0FF`, `#D5E8E6`, `#FFF3E3`, `#FF7171` qua biến CSS |
| `defaultGetRowId` trả về `String(index)`                              | Cấm index làm key                            | Mọi pad có `id` ổn định                    |
| `[...filtered].sort(...)`                                                | Bắt buộc `.toSorted()`                      | Dùng `.toSorted()` nếu cần sắp xếp         |
| `useEffect` chỉ để focus theo `shouldFocus` ref                        | Hạn chế effect đồng bộ                     | Gọi `focus()` trực tiếp trong event handler   |
| Lắng nghe phím bằng `event.key`                                        | Trigger pad phải dùng `e.code` (UniKey)     | Hook `useDrumKeyboard` dùng `e.code`          |
| `onKeyDown` gắn trên từng `<td>`, không có anti-repeat               | Đề yêu cầu `window` listener và `e.repeat` | Listener trên `window`, có cleanup             |

# 2. Yêu cầu đề bài

### Module 1: Keyboard Engine (Physical Key Codes)

* **Req 1.1:** Lắng nghe `keydown` / `keyup` trên `window`, dùng `e.code` (`'KeyW'`, `'KeyA'`, `'KeyS'`, `'KeyD'`, `'KeyJ'`, `'KeyK'`, `'KeyL'`), tra cứu bằng `padMap.get(e.code)`.
* **Req 1.2: Anti-Repeat Guard:** `if (e.repeat) return;`.
* **Req 1.3: Input Focus Isolation:** bỏ qua khi `e.target.tagName` là `INPUT`, `TEXTAREA`, `SELECT`.
* **Req 1.4:** Hook `useDrumKeyboard(padMap, onTriggerPad, isEnabled = true)`, `e.preventDefault()` khi khớp pad, cleanup `removeEventListener`.

### Module 2: Accessible Pads (WCAG 2.2 AA, kế thừa Lab 2 HW 1)

* **Req 2.1:** Pad là `<button type="button" aria-pressed={isActive}>`.
* **Req 2.2:** Roving `tabIndex` và phím mũi tên di chuyển focus giữa các pad.
* **Req 2.3:** Focus-visible rõ ràng, contrast 4.5:1 cho text và 3:1 cho UI/focus.

### Module 3: Deaf / Hard-of-Hearing Visual Feedback

* **Req 3.1:** Hit history trong `<output aria-live="polite">`.
* **Req 3.2:** Visual decibel meter.

### Module 4: Production Quality

* **Req 4.1:** Lighthouse 100 cả 4 mục.
* **Req 4.2:** Hiển thị đúng ở 375px, không cuộn ngang.

# 3. Contract-First Definition

### 3.1 Data contract

```js
// Pad trong padMap: Map<code, Pad>
{ id, code, label, soundSrc }

// Hit log entry
{ id, padId, label, timestampMs }
```

### 3.2 Hook contract

```js
useDrumKeyboard(padMap, onTriggerPad, isEnabled = true)
// keydown: bỏ qua e.repeat, bỏ qua INPUT/TEXTAREA/SELECT,
// padMap.get(e.code) -> e.preventDefault() -> onTriggerPad(pad.id)
// return cleanup removeEventListener
```

### 3.3 Component Props contract

| Component        | Props                                                              | Ghi chú                                                              |
| ---------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `DrumPad`      | `{ id, label, keyHint, isActive = false, isFocusable = false, onTrigger }` | `<button aria-pressed>`, `tabIndex` theo roving focus             |
| `DrumGrid`     | `{ pads, activeId, onTrigger }`                                  | Roving focus kế thừa Lab 2 HW 1, `key={pad.id}`                  |
| `KeyLegend`    | `{ pads }`                                                       | `<dl>` hiển thị phím tắt và tên pad                            |
| `HitLog`       | `{ hits }`                                                       | `<output aria-live="polite">`                                      |
| `DecibelMeter` | `{ level }`                                                      | Dẫn xuất từ state, không inline style                            |

# 4. Functional Slicing (WBS)

Mỗi dòng là 1 sub-task độc lập = 1 lần prompt AI = 1 atomic commit.

### Phase 0 - Setup & Migration

| ID  | Sub-task                                                                                 | Kiểm thử                              | Commit                                              |
| --- | ---------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------- |
| 0.1 | Khởi tạo project Vite React 19, `createRoot` bọc `<StrictMode>`                   | `npm run dev` chạy được           | `chore(hw1): scaffold vite react 19 project`      |
| 0.2 | Khai báo CSS Custom Properties tại `:root` theo palette, thay màu hardcode Lab 2 | Không còn hex ngoài palette          | `style(hw1): add root css custom properties`      |
| 0.3 | Chuyển `focusRing` Tailwind của Lab 2 thành class focus-visible trong CSS Module    | Tab thấy outline rõ ràng          | `refactor(hw1): port focus ring to css module`    |
| 0.4 | Thông báo và chuẩn bị file âm thanh cho 7 pad (người dùng cung cấp)           | Đủ 7 file, load được             | `chore(hw1): add drum sound assets`               |

### Phase 1 - Module 1: Keyboard Engine

| ID  | Sub-task                                                                       | Kiểm thử                                              | Commit                                          |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------- |
| 1.1 | Tạo `padMap` kiểu `Map` với 7 key `e.code`, mỗi pad có `id` ổn định | `padMap.get('KeyW')` trả đúng pad                  | `feat(hw1): define drum pad map by event code`|
| 1.2 | Hook `useDrumKeyboard` lắng nghe `keydown` trên `window`, cleanup      | Unmount không còn listener                           | `feat(hw1): add useDrumKeyboard hook`         |
| 1.3 | Anti-repeat `e.repeat` và bỏ qua `INPUT`, `TEXTAREA`, `SELECT`      | Giữ phím chỉ kêu 1 lần, gõ input không kích hoạt pad | `fix(hw1): guard key repeat and input focus` |
| 1.4 | Xử lý `keyup` tắt trạng thái active                                    | Nhả phím pad về trạng thái thường                | `feat(hw1): release pad state on keyup`       |

### Phase 2 - Module 2: Accessible Pads & Audio

| ID  | Sub-task                                                                                              | Kiểm thử                                 | Commit                                            |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| 2.1 | Component `DrumPad` với `<button aria-pressed>`, CSS Module                                      | Accessibility Tree đúng role và state   | `feat(hw1): add accessible DrumPad button`      |
| 2.2 | Component `DrumGrid` layout Grid `auto-fit` cho 375px                                               | Không cuộn ngang ở 375px               | `feat(hw1): add responsive DrumGrid layout`     |
| 2.3 | Refactor roving `tabIndex` và `Map` refs từ Lab 2 HW 1, focus trực tiếp trong handler (bỏ `useEffect` focus) | Arrow di chuyển focus, chỉ 1 pad có tabIndex 0 | `refactor(hw1): port roving focus from data grid` |
| 2.4 | Phát âm thanh qua Web Audio, `AudioContext` khởi tạo theo user gesture, có cleanup               | Chuột, cảm ứng, bàn phím đều có tiếng | `feat(hw1): play pad sound with web audio`      |
| 2.5 | Component `KeyLegend` bảng phím tắt bằng `<dl>`                                                  | Screen reader đọc đúng cặp phím - pad | `feat(hw1): add keyboard shortcut legend`       |

### Phase 3 - Module 3: Visual Feedback

| ID  | Sub-task                                                                                           | Kiểm thử                     | Commit                                       |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------- |
| 3.1 | Chuyển vùng `announcement` Lab 2 thành `HitLog` trong `<output aria-live="polite">`, thêm hit bằng spread | Screen reader đọc hit mới    | `feat(hw1): add aria-live hit history log` |
| 3.2 | Component `DecibelMeter`, không inline style                                                    | Meter thay đổi khi nhấn pad | `feat(hw1): add visual decibel meter`      |

### Phase 4 - Verification & Deliverables

| ID  | Sub-task                                                                           | Kiểm thử                                 | Commit                                          |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| 4.1 | Kiểm tra contrast palette mới theo ma trận Lab 2 (4.5:1 text, 3:1 UI)     | Mọi cặp màu đạt AA                    | `fix(a11y): verify palette contrast ratios`   |
| 4.2 | Chạy Lighthouse, sửa đến khi đạt 100 các mục                            | Report 100 / 100 / 100 / 100               | `perf(hw1): reach 100 lighthouse score`       |
| 4.3 | Kiểm thử bằng Chrome DevTools, bàn phím thuần và UniKey, chụp bằng chứng | Đạt Acceptance Criteria                  | `test(hw1): verify keyboard and a11y behavior`|
| 4.4 | Viết `AI_FAILURE_AUDIT.md` tối thiểu 3 lỗi AI kèm bằng chứng và code refactor | Đủ 3 lỗi                                | `docs(hw1): add ai failure audit`             |

---

# 5. Ràng buộc kỹ thuật bắt buộc

* 100% Functional Component, không `class`, không `defaultProps`, dùng default parameter.
* Chỉ import hook cần dùng: `import { useState, useEffect, useRef, useCallback, useId } from 'react'`.
* Không dùng `var`. Mặc định `const`, chỉ dùng `let` khi gán lại.
* Không `keypress` / `keyCode`. Trigger pad dùng `event.code`.
* Không `key={index}`, dùng `key={pad.id}`.
* Không mutate state, dùng spread, `.filter()`, `.toSorted()`.
* Không tạo state dư thừa đồng bộ qua `useEffect`, dữ liệu dẫn xuất tính trong render.
* Mọi `useEffect` có side-effect (listener, AudioContext) phải trả về hàm cleanup.
* Không inline style, chỉ dùng `*.module.css` và CSS Custom Properties, màu theo palette `#9FA0FF`, `#D5E8E6`, `#FFF3E3`, `#FF7171`.
* Không Tailwind, Bootstrap, jQuery, CDN ngoài (loại bỏ toàn bộ Tailwind từ Lab 2 HW 1).
* Không `innerHTML`, không `window.alert()`.
* Semantic JSX: `main`, `section`, `header`, `dl`, `output`, hạn chế `div`.
* Không tự ý thêm hình ảnh hay âm thanh, phải thông báo người dùng.
* Không sửa hay xóa code trong `Lab_2/Homework/HW_1`, chỉ tham khảo.

# 6. Acceptance Criteria Checklist

- [ ] Kỹ thuật roving focus, aria-live, focus-visible của Lab 2 HW 1 được áp dụng, không còn Tailwind và màu ngoài palette.
- [ ] 7 pad kích hoạt bằng `e.code` (W A S D J K L), hoạt động khi bật UniKey.
- [ ] Giữ phím không spam âm thanh (`e.repeat`).
- [ ] Gõ trong `<input>` không kích hoạt pad.
- [ ] Pad là `<button aria-pressed>`, thao tác được hoàn toàn bằng bàn phím.
- [ ] Hit log `aria-live="polite"` và decibel meter hoạt động.
- [ ] Lighthouse 100 cả 4 mục, WCAG 2.2 AA.
- [ ] Hiển thị đúng ở 375px, không cuộn ngang.
- [ ] Tối thiểu 10 atomic commits chuẩn Conventional Commits.
- [ ] Có đủ `project_rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md`.
