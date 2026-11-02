# TASK DECOMPOSITION

**Project:** 88-Key Polyphonic Synthesizer & Concurrent Audio Sequencer

**Stack Context:** React 19 (`memo`), Vite, Modern ES2024 JavaScript, Scoped CSS Modules, Web Audio API, ES6 `Map`, `AbortController`

# 1. Yêu cầu đề bài

### Module 1: Algorithmic Piano Key Generation & Render Optimization

* **Req 1.1: Dynamic 88-Key Generation ($A_0$ to $C_8$)**
  * **Math Formula:** $f = 440 \times 2^{(midi - 69) / 12}$.
  * **Structure:** 52 white keys và 36 black keys (88 keys, 7+ octaves) sinh bằng thuật toán, không hardcode thẻ DOM.
  * **MIDI Range:** $A_0$ (MIDI 21, 27.5 Hz) đến $C_8$ (MIDI 108, 4186 Hz).
* **Req 1.2: Strict Component Isolation via `memo`**
  * Bọc `PianoKey` bằng `memo()`.
  * `isPressed` được cô lập theo từng phím.
  * **Target:** Nhấn 1 phím chỉ re-render đúng phím đó, 87 phím còn lại không render (kiểm chứng bằng React DevTools Profiler).

### Module 2: Audio Engine & Polyphonic Voice Management

* **Req 2.1: 8-Voice Polyphony Management**
  * Tối đa 8 oscillator Web Audio chạy đồng thời.
  * Chống clipping và méo tiếng bằng giới hạn số voice.
* **Req 2.2: $O(1)$ FIFO Voice Stealing**
  * Theo dõi voice bằng ES6 `Map` (`activeVoices`), giữ thứ tự chèn.
  * Nốt thứ 9 (`activeVoices.size >= 8`): lấy nốt cũ nhất bằng `activeVoices.keys().next().value` và gọi `noteOff(oldestMidi)`.
* **Req 2.3: Click-Free ADSR Envelope**
  * Chống tiếng pop/click khi nhả phím.
  * `gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)` trước khi gọi `osc.stop()`.

### Module 3: Concurrent FIFO Sequencer & Replay Engine

* **Req 3.1: Event Recording (FIFO Queue)**
  * Ghi sự kiện dạng `{ midi, freqHz, durationMs, deltaMs }`.
  * Lưu tuần tự trong hàng đợi FIFO.
* **Req 3.2: Asynchronous Variable-Speed Replay**
  * Phát lại bất đồng bộ với tốc độ `0.5x`, `1.0x`, `2.0x`.
  * Tính lại thời gian phát theo hệ số tốc độ.
* **Req 3.3: Immediate Cancellation via `AbortController`**
  * Gắn thao tác phát lại với một `AbortController`.
  * Nhấn "Stop Sequence" hoặc unmount component phải gọi `controller.abort()`, hủy ngay các promise đang chờ và tắt các audio node đang kêu.

# 2. Contract-First Definition

### 2.1 Data contract

```js
// Key
{ id, midi, freqHz, isBlack }

// Voice trong activeVoices: Map<midi, Voice>
{ osc, gain }

// Recorded event
{ id, midi, freqHz, durationMs, deltaMs }
```

### 2.2 Component Props contract

| Component             | Props                                                                | Ghi chú                                                                 |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `PianoKey`          | `{ midi, freqHz, isBlack, isPressed = false, onPress, onRelease }` | Bọc `memo`. `onPress`, `onRelease` phải có reference ổn định |
| `Keyboard`          | `{ keys, pressedSet, onPress, onRelease }`                         | `key={item.id}`, không dùng index                                    |
| `SequencerControls` | `{ status, speed, onRecord, onPlay, onStop, onSpeedChange }`       | `select` tốc độ ghép `label` qua `useId()`                     |

### 2.3 State Machine contract (Sequencer)

```
idle --record--> recording --stop--> idle
idle --play----> playing   --stop / hết sequence / unmount--> idle
```

* Trạng thái hiển thị qua `<output role="status">`, không dùng `window.alert()`.

# 3. Functional Slicing (WBS)

Mỗi dòng là 1 sub-task độc lập = 1 lần prompt AI = 1 atomic commit.

### Phase 0 - Setup

| ID  | Sub-task                                                               | Kiểm thử                    | Commit                                         |
| --- | ---------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------- |
| 0.1 | Khởi tạo project Vite React 19, `createRoot` bọc `<StrictMode>` | `npm run dev` chạy được | `chore(ex2): scaffold vite react 19 project` |
| 0.2 | Khai báo CSS Custom Properties tại `:root` theo color palette      | Không có inline style       | `style(ex2): add root css custom properties` |

### Phase 1 - Module 1: Piano Keys

| ID  | Sub-task                                                                                                                    | Kiểm thử                                         | Commit                                             |
| --- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| 1.1 | Hàm thuần `midiToFreq(midi)` theo công thức chuẩn                                                                    | MIDI 21 = 27.5 Hz, 69 = 440 Hz, 108 = 4186 Hz      | `feat(ex2): add midi to frequency util`          |
| 1.2 | Hàm thuần `generateKeys()` sinh mảng 88 phím MIDI 21 - 108                                                            | Đếm 52 white, 36 black                           | `feat(ex2): generate 88 keys programmatically`   |
| 1.3 | Component `PianoKey` bọc `memo`, CSS Module riêng                                                                     | Hiển thị phím trắng và đen                   | `feat(ex2): add memoized PianoKey component`     |
| 1.4 | Component `Keyboard` render danh sách phím, quản lý `pressedSet` bất biến (`new Set(prev)`), handler ổn định | Profiler: nhấn 1 phím chỉ 1 `PianoKey` render | `perf(ex2): isolate key re-render with memo`     |
| 1.5 | Bàn phím máy tính dùng `event.code`, listener có cleanup                                                            | Gõ với UniKey không lỗi, unmount không leak   | `feat(ex2): map keyboard events with event.code` |

### Phase 2 - Module 2: Audio Engine

| ID  | Sub-task                                                                                            | Kiểm thử                                     | Commit                                             |
| --- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------- |
| 2.1 | Khởi tạo `AudioContext` khi người dùng tương tác lần đầu, đóng context trong cleanup | Không có cảnh báo autoplay                 | `feat(ex2): init audio context on user gesture`  |
| 2.2 | `noteOn(midi)` / `noteOff(midi)` dùng `activeVoices` kiểu `Map`                           | Nhấn phím có tiếng, nhả phím tắt tiếng | `feat(ex2): add noteOn noteOff with voice map`   |
| 2.3 | Giới hạn 8 voice và FIFO voice stealing O(1)                                                     | Nhấn 9 phím, phím đầu tiên bị tắt      | `feat(ex2): add fifo voice stealing at 8 voices` |
| 2.4 | Release envelope bằng `exponentialRampToValueAtTime` trước `osc.stop()`                      | Không có tiếng pop/click                    | `fix(audio): add click free release envelope`    |

### Phase 3 - Module 3: Sequencer

| ID  | Sub-task                                                                                                                                                | Kiểm thử                               | Commit                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| 3.1 | Ghi sự kiện vào hàng đợi FIFO bằng spread (`[...prev, event]`), tính `deltaMs`, `durationMs` theo `performance.now()`                   | Log queue đúng thứ tự và thời gian | `feat(ex2): record key events into fifo queue`  |
| 3.2 | Component `SequencerControls` với semantic HTML, `select` tốc độ ghép `label` bằng `useId()`, trạng thái qua `<output role="status">` | Accessibility Tree đúng                | `feat(ex2): add accessible sequencer controls`  |
| 3.3 | Hàm replay async, thời gian chờ = `deltaMs / speed`, `durationMs / speed`                                                                        | Phát đúng ở 0.5x, 1.0x, 2.0x         | `feat(ex2): add async variable speed replay`    |
| 3.4 | Gắn `AbortController`: Stop và unmount gọi `abort()`, `catch` bỏ qua `AbortError`, tắt toàn bộ voice                                     | Nhấn Stop dừng ngay, không lỗi giả  | `feat(ex2): cancel replay with AbortController` |

### Phase 4 - Verification & Deliverables

| ID  | Sub-task                                                                                | Kiểm thử                | Commit                                            |
| --- | --------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------- |
| 4.1 | Kiểm thử toàn bộ bằng Chrome DevTools và React Profiler, chụp bằng chứng       | Đạt Acceptance Criteria | `test(ex2): verify profiler and audio behavior` |
| 4.2 | Viết `AI_FAILURE_AUDIT.md` tối thiểu 3 lỗi AI kèm bằng chứng và code refactor | Đủ 3 lỗi               | `docs(ex2): add ai failure audit`               |

---

# 4. Ràng buộc kỹ thuật bắt buộc

* 100% Functional Component, không `class`, không `defaultProps`, dùng default parameter.
* Chỉ import hook cần dùng: `import { memo, useState, useEffect, useRef, useCallback, useId } from 'react'`.
* Không dùng `var`. Mặc định `const`, chỉ dùng `let` khi gán lại.
* Không `key={index}`, dùng `key={item.id}`.
* Không mutate state (`.push()`, `.sort()`), dùng spread, `.filter()`, `.toSorted()`.
* Không tạo state dư thừa đồng bộ qua `useEffect`, dữ liệu dẫn xuất tính trực tiếp trong render.
* Mọi `useEffect` có side-effect (listener, AudioContext, timer) phải trả về hàm cleanup.
* Không inline style, chỉ dùng `*.module.css` và CSS Custom Properties.
* Không Tailwind, Bootstrap, jQuery, CDN ngoài.
* Không `innerHTML`, không `window.alert()`, không `keypress` / `keyCode`.
* Semantic JSX: `main`, `section`, `header`, `output`, hạn chế `div`, dùng Fragment thay wrapper thừa.

# 5. Acceptance Criteria Checklist

- [X] 88 keys được tính bằng công thức MIDI chuẩn, không hardcode.
- [X] Profiler xác nhận chỉ 1 key component re-render mỗi lần nhấn.
- [X] Audio Engine xử lý tối đa 8 voice đồng thời, không có pop/click.
- [X] Nốt thứ 9 lấy đúng voice cũ nhất trong $O(1)$.
- [X] Sequence phát lại chính xác ở `0.5x`, `1.0x`, `2.0x`.
- [X] Nhấn "Stop" dừng phát lại ngay qua `AbortController`.
- [X] Tối thiểu 10 atomic commits chuẩn Conventional Commits.
- [X] Có đủ `project_rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md`.
