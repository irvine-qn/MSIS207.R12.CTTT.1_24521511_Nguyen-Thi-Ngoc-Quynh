# TASK DECOMPOSITION

**Project:** 88-Key Polyphonic Piano & Concurrent FIFO Sequencer

**Stack Context:** React 19 (`memo`), Vite, Modern ES2024 JavaScript, Scoped CSS Modules, Web Audio API, ES6 `Map`, FIFO `AudioTaskQueue`

# 1. Yêu cầu đề bài

### Module 1: Algorithmic 88-Key Generation (A0 to C8)

* **Req 1.1:** Sinh phím bằng thuật toán từ MIDI 21 (A0) đến MIDI 108 (C8).
  * Công thức: $f = 440 \times 2^{(midi - 69) / 12}$.
  * Kết quả: 52 white keys, 36 black keys, trên 7+ octave.
  * **Cấm** hardcode 88 thẻ.

### Module 2: React.memo Render Isolation (88 Components)

* **Req 2.1:** `PianoKey` bọc `memo`, dùng shallowEqual mặc định.
* **Req 2.2:** Nhấn 1 phím chỉ re-render đúng phím đó, không re-render cả 88 phím (kiểm chứng bằng React DevTools Profiler).
* **Req 2.3:** Props theo contract: `{ midi, noteName, isBlack, isPressed, onNoteOn, onNoteOff }`, render `<button type="button" aria-pressed={isPressed}>` với `onPointerDown` / `onPointerUp`.

### Module 3: 8-Voice Polyphony & FIFO Voice Stealing

* **Req 3.1:** Chơi hợp âm tối đa 8 oscillator Web Audio đồng thời.
* **Req 3.2:** Nốt thứ 9: cướp voice cũ nhất theo thứ tự FIFO để chống clipping.

### Module 4: Concurrent FIFO AudioTaskQueue (Lab 2 HW 2)

* **Req 4.1:** Kết hợp FIFO `AudioTaskQueue` từ Lab 2 HW 2 để xếp hàng và phát lại các tác vụ âm thanh theo đúng thứ tự.

# 2. Contract-First Definition

### 2.1 Data contract

```js
// Key
{ id, midi, noteName, freqHz, isBlack }

// Voice trong activeVoices: Map<midi, Voice>
{ osc, gain }

// Audio task trong AudioTaskQueue
{ id, midi, freqHz, durationMs, deltaMs }
```

### 2.2 Component Props contract

| Component     | Props                                                              | Ghi chú                                                         |
| ------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `PianoKey`  | `{ midi, noteName, isBlack, isPressed = false, onNoteOn, onNoteOff }` | Bọc `memo`. `onNoteOn`, `onNoteOff` phải có reference ổn định |
| `Keyboard`  | `{ keys, pressedSet, onNoteOn, onNoteOff }`                      | `key={item.id}`, không dùng index                           |
| `Sequencer` | `{ status, onRecord, onPlay, onStop }`                           | Trạng thái qua `<output role="status">`                      |

# 3. Functional Slicing (WBS)

Mỗi dòng là 1 sub-task độc lập = 1 lần prompt AI = 1 atomic commit.

### Phase 0 - Setup

| ID  | Sub-task                                                               | Kiểm thử                    | Commit                                         |
| --- | ---------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------- |
| 0.1 | Khởi tạo project Vite React 19, `createRoot` bọc `<StrictMode>` | `npm run dev` chạy được | `chore(hw2): scaffold vite react 19 project` |
| 0.2 | Khai báo CSS Custom Properties tại `:root` theo color palette      | Không có inline style       | `style(hw2): add root css custom properties` |

### Phase 1 - Module 1: Key Generation

| ID  | Sub-task                                                         | Kiểm thử                                       | Commit                                          |
| --- | ---------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| 1.1 | Hàm thuần `midiToFreq(midi)`                                   | MIDI 21 = 27.5 Hz, 69 = 440 Hz, 108 ≈ 4186 Hz    | `feat(hw2): add midi to frequency util`       |
| 1.2 | Hàm thuần `midiToNoteName(midi)`                               | 21 = A0, 60 = C4, 108 = C8                        | `feat(hw2): add midi to note name util`       |
| 1.3 | Hàm thuần `generateKeys()` sinh 88 phím                       | Đếm 52 white, 36 black                         | `feat(hw2): generate 88 keys programmatically`|

### Phase 2 - Module 2: Render Isolation

| ID  | Sub-task                                                                                       | Kiểm thử                                     | Commit                                        |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| 2.1 | Component `PianoKey` bọc `memo`, CSS Module `key--white` / `key--black`                 | Hiển thị đúng phím trắng và đen        | `feat(hw2): add memoized PianoKey component`|
| 2.2 | Component `Keyboard`, `pressedSet` cập nhật bất biến, handler ổn định bằng `useCallback` | Profiler: nhấn 1 phím chỉ 1 `PianoKey` render | `perf(hw2): isolate key re-render with memo`|
| 2.3 | Layout bàn phím responsive ở 375px (cuộn trong vùng bàn phím, không cuộn ngang trang) | Không cuộn ngang trang ở 375px         | `style(hw2): make keyboard responsive`      |

### Phase 3 - Module 3: Polyphony

| ID  | Sub-task                                                                                    | Kiểm thử                               | Commit                                             |
| --- | ------------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| 3.1 | Khởi tạo `AudioContext` khi người dùng tương tác lần đầu, đóng trong cleanup | Không có cảnh báo autoplay           | `feat(hw2): init audio context on user gesture`  |
| 3.2 | `noteOn` / `noteOff` với `activeVoices` kiểu `Map`                                  | Nhấn có tiếng, nhả tắt tiếng       | `feat(hw2): add noteOn noteOff with voice map`   |
| 3.3 | Giới hạn 8 voice, nốt thứ 9 cướp voice cũ nhất theo FIFO                          | Nhấn 9 nốt, nốt đầu bị tắt        | `feat(hw2): add fifo voice stealing at 8 voices` |

### Phase 4 - Module 4: FIFO AudioTaskQueue

| ID  | Sub-task                                                                                         | Kiểm thử                          | Commit                                        |
| --- | ------------------------------------------------------------------------------------------------ | ----------------------------------- | --------------------------------------------- |
| 4.1 | Tích hợp `AudioTaskQueue` FIFO từ Lab 2 HW 2, ghi task bằng spread                        | Queue đúng thứ tự               | `feat(hw2): integrate fifo AudioTaskQueue`  |
| 4.2 | Component `Sequencer` semantic, trạng thái qua `<output role="status">`                     | Accessibility Tree đúng          | `feat(hw2): add accessible sequencer ui`    |
| 4.3 | Phát lại queue bất đồng bộ, hủy bằng `AbortController`, `catch` bỏ qua `AbortError` | Stop dừng ngay, không lỗi giả | `feat(hw2): replay queue with abort control`|

### Phase 5 - Verification & Deliverables

| ID  | Sub-task                                                                                | Kiểm thử                | Commit                                            |
| --- | --------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------- |
| 5.1 | Kiểm thử bằng React DevTools Profiler và Chrome DevTools, chụp bằng chứng     | Đạt Acceptance Criteria | `test(hw2): verify profiler and audio behavior` |
| 5.2 | Viết `AI_FAILURE_AUDIT.md` tối thiểu 3 lỗi AI kèm bằng chứng và code refactor | Đủ 3 lỗi               | `docs(hw2): add ai failure audit`               |

---

# 4. Ràng buộc kỹ thuật bắt buộc

* 100% Functional Component, không `class`, không `defaultProps`, dùng default parameter.
* Chỉ import hook cần dùng: `import { memo, useState, useEffect, useRef, useCallback } from 'react'`.
* Không dùng `var`. Mặc định `const`, chỉ dùng `let` khi gán lại.
* Không `key={index}`, dùng `key={item.id}`.
* Không mutate state, dùng spread, `new Set(prev)`, `.filter()`, `.toSorted()`.
* Không tạo state dư thừa đồng bộ qua `useEffect`, dữ liệu dẫn xuất tính trong render.
* Mọi `useEffect` có side-effect (AudioContext, listener, timer) phải trả về hàm cleanup.
* Không inline style, chỉ dùng `*.module.css` và CSS Custom Properties, màu theo palette `#9FA0FF`, `#D5E8E6`, `#FFF3E3`, `#FF7171`.
* Không Tailwind, Bootstrap, jQuery, CDN ngoài.
* Không `innerHTML`, không `window.alert()`, không `keypress` / `keyCode`.
* Semantic JSX: `main`, `section`, `header`, `output`, hạn chế `div`.

# 5. Acceptance Criteria Checklist

- [ ] 88 phím (52 trắng, 36 đen) sinh bằng công thức MIDI, không hardcode.
- [ ] Profiler xác nhận nhấn 1 phím chỉ 1 `PianoKey` re-render.
- [ ] Tối đa 8 voice đồng thời, nốt thứ 9 cướp voice cũ nhất theo FIFO.
- [ ] `AudioTaskQueue` phát lại đúng thứ tự FIFO, hủy được bằng `AbortController`.
- [ ] Hiển thị đúng ở 375px, không cuộn ngang trang.
- [ ] Tối thiểu 10 atomic commits chuẩn Conventional Commits.
- [ ] Có đủ `project_rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md`.
