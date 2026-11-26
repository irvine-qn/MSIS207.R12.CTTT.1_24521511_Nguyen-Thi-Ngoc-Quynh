# TASK_DECOMPOSITION – HW_4

Đề bài: Live Defense Challenge Bank – 4 Real-Time Refactoring Prompts
Tham chiếu: Slide 18 (Live Defense Protocol), Slide 28 (Challenge Bank)
Code nền: Lab_4/Exercise/Ex_1

## CHALLENGE 1: URL SEARCH PARAMS SYNC

### Task 1.1: Xác định state cần đưa lên URL
* Liệt kê filter / pagination / channel đang dùng `useState` trong Ex_1.
* Commit: `docs: list state to sync with url`

### Task 1.2: Refactor sang `useSearchParams()`
* Đọc giá trị từ URL (có default), ghi bằng `setSearchParams`. Không dùng `useEffect` để đồng bộ.
* Commit: `refactor: sync filters with search params`

## CHALLENGE 2: CROSS-FIELD VALIDATION

### Task 2.1: Thêm field và rule
* Thêm `password` + `confirmPassword` vào form; rule khớp nhau trong hàm validate đồng bộ.
* Lỗi gắn vào `confirmPassword`, cập nhật ngay khi sửa một trong hai field.
* Commit: `feat: cross-field password validation`

## CHALLENGE 3: AUTO-RETRY BACKOFF

### Task 3.1: Hàm `sleep(ms, signal)` hủy được
* Reject ngay khi `signal` abort, clear timeout.
* Commit: `feat: abortable sleep helper`

### Task 3.2: Retry trong `useForumMessages`
* Tối đa 3 lần, delay `500 * 2 ** attempt`. Không retry `AbortError` / 4xx.
* Giữ guard `signal.aborted` ở try/catch/finally. Expose `error` khi hết lượt.
* Commit: `feat: exponential backoff retry in useForumMessages`

## CHALLENGE 4: PROTECTED ROUTE GUARD

### Task 4.1: Auth state
* Context auth tối giản (`user`, `login`, `logout`). HỎI TÔI cách login giả lập.
* Commit: `feat: minimal auth context`

### Task 4.2: `RequireAuth` + trang Login
* Chưa login → `<Navigate to="/login" replace state={{ from: location }} />`.
* Login xong → `navigate(from, { replace: true })`.
* Commit: `feat: protected route guard with redirect back`

## CHUẨN BỊ DEFENSE (3 PHÚT)
- [ ] Giải thích sơ đồ module và quan hệ giữa các file
- [ ] Bảo vệ lựa chọn state: local / context / URL / server
- [ ] Tập fix nhanh 1 bug bị cài (VD: thiếu dependency, thiếu abort, dùng `<Switch>`)
- [ ] Ghi lỗi AI gặp phải vào `AI_FAILURE_AUDIT.md`
