# Homework 3: Resilient Event Hub & AI Failure Audit

# Resilient Landing Page

## Slice 1: Drift-Free Countdown Engine

- Build a countdown timer using ISO 8601 timestamps with explicit timezones (UTC preferred).
- Calculate the remaining time from the current timestamp to prevent timer drift.
- Handle invalid or expired timestamps and clean up timers properly.

## Slice 2: State-Machine Form

- Build a form with four states: `idle`, `submitting`, `success`, and `error`.
- Handle state transitions based on submission results.
- Display loading, success, and error messages, and allow users to retry after failure.

## Slice 3: Double-submit Prevention & Input Sanitization

- Prevent duplicate form submissions caused by repeated clicks or Enter presses.
- Validate and sanitize user input before processing.
- Render user input safely to prevent XSS and avoid unsafe HTML insertion.

---

# AI Failure Audit

- Tạo file AI_FAILURE_AUDIT.md.
- Ghi lại 3 lỗi AI thực sự gặp phải.
- Với mỗi lỗi, trình bày mô tả, phương pháp chẩn đoán và giải pháp sửa.
