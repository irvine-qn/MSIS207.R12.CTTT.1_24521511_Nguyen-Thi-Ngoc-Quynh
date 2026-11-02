# AI FAILURE AUDIT

**Project:** 88-Key Polyphonic Synthesizer & Concurrent Audio Sequencer

**Phạm vi:** Các lỗi do AI sinh ra trong quá trình làm Ex_2, được phát hiện qua kiểm thử thủ công, Chrome DevTools và Lighthouse, sau đó refactor lại.

## Tổng hợp

| # | Lỗi                                                          | Sub-task      | Phát hiện bằng        | Mức độ                                    |
| - | ------------------------------------------------------------- | ------------- | ------------------------ | -------------------------------------------- |
| 1 | Nút Play bị khóa vĩnh viễn do thiếu prop `onPlay`     | 3.2           | Kiểm thử thủ công    | Cao: không dùng được chức năng replay |
| 2 | Độ tương phản màu chữ quá thấp                       | 0.2, 1.3, 3.2 | Lighthouse Accessibility | Trung bình: vi phạm WCAG AA                |
| 3 | `aria-label` của `PianoKey` không chứa chữ hiển thị | 1.5           | Lighthouse Accessibility | Trung bình: lỗi A11Y với voice control    |

# Lỗi 1: Nút Play bị khóa vĩnh viễn

**Mô tả:** Khi sinh `SequencerControls`, AI khóa nút Play nếu không có `onPlay`, nhưng trong `App.jsx` lại không truyền `onPlay`. Sau khi Record xong, người dùng vẫn không bấm được Play.

**Code lỗi:**

```jsx
// SequencerControls.jsx
<button disabled={!isIdle || !onPlay} onClick={onPlay}>Play</button>

// App.jsx
<SequencerControls
  status={status}
  speed={speed}
  onRecord={startRecording}
  onStop={stop}
  onSpeedChange={setSpeed}
/>
```

**Refactor:** Viết hàm `play` trong `useSequencer` và truyền vào `onPlay`. Nút chỉ bị khóa khi chưa có sự kiện nào.

```jsx
<SequencerControls
  status={status}
  speed={speed}
  onRecord={startRecording}
  onPlay={events.length > 0 ? play : undefined}
  onStop={stop}
  onSpeedChange={setSpeed}
/>
```

# Lỗi 2: Độ tương phản màu chữ quá thấp

**Mô tả:** AI dùng chính các màu trong palette làm màu chữ: chữ `#FFF3E3` trên nền `#9FA0FF` / `#FF7171`, và chữ `#9FA0FF` trên nền `#D5E8E6`. Màu nhìn hài hòa nhưng chữ rất khó đọc. Thẻ `select` còn bị chữ trắng trên nền kem.

**Code lỗi:**

```css
.shiftButton {
  color: var(--color-surface);
  background: var(--color-accent);
}

.title {
  color: var(--color-primary);
}

.select {
  font: inherit;
  background: var(--color-surface);
}
```

**Refactor:** Giữ nguyên palette cho nền và viền, chuyển toàn bộ màu chữ sang `--text` (`#000000`).

```css
.shiftButton {
  color: var(--text);
  background: var(--color-accent);
}

.title {
  color: var(--text);
}

.select {
  font: inherit;
  color: var(--text);
  background: var(--color-surface);
}
```

Sau refactor: chữ đen trên `#9FA0FF` khoảng 8.6:1, trên `#FF7171` khoảng 7.6:1, trên `#D5E8E6` khoảng 17:1. Lighthouse không còn báo lỗi `color-contrast`.

**Bài học:** Palette dùng cho nền không có nghĩa là dùng được cho chữ. Phải kiểm tra tỉ lệ tương phản, không chỉ nhìn bằng mắt.

# Lỗi 3: `aria-label` không khớp chữ hiển thị trên phím

**Mô tả:** AI đặt `aria-label` dạng `"C3, MIDI 48, 130.81 Hz, key Z"` cho `PianoKey`. Trên phím lại hiển thị `Z` và `C3`. `aria-label` ghi đè nội dung bên trong, nên tên mà trình đọc màn hình nhận được không bắt đầu bằng chữ hiển thị. Người dùng điều khiển bằng giọng nói nói "Z" sẽ không kích hoạt được phím.


**Code lỗi:**

```jsx
<button
  type="button"
  className={className}
  aria-label={`${noteName}, MIDI ${midi}, ${freqHz.toFixed(2)} Hz${shortcut ? `, key ${shortcut}` : ""}`}
  aria-pressed={isPressed}
>
  {shortcut && <kbd className={styles.shortcut}>{shortcut}</kbd>}
  <span className={styles.note}>{noteName}</span>
</button>
```

**Refactor:** Bỏ `aria-label`. Thông tin phụ đưa vào một `span` ẩn khỏi màn hình nhưng trình đọc màn hình vẫn đọc được. Tên accessible giờ là `Z C3, MIDI 48, 130.81 Hz`, chứa đúng chữ hiển thị.

```jsx
<button type="button" className={className} aria-pressed={isPressed}>
  {shortcut && <kbd className={styles.shortcut}>{shortcut}</kbd>}
  <span className={styles.note}>{noteName}</span>
  <span className={styles.srOnly}>
    , MIDI {midi}, {freqHz.toFixed(2)} Hz
  </span>
</button>
```

```css
.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```
