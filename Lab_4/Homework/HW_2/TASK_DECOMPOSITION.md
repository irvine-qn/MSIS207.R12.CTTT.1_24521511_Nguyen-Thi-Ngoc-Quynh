# TASK_DECOMPOSITION – HW_2

Đề bài: Full-Stack Interactive Card-Swipe Deck – 'Hen Ho Nhung Khong Yeu' Edition
Tham chiếu: Slide 20 (Homework 1 Card-Swipe), Slide 31 (SwipeDeck.jsx Frontend Contract), Slide 32 (Express + Mongoose 8 Backend Contract)

## SPRINT 0: SETUP & CONTRACT

### Task 0.1: Cấu trúc thư mục
* `client/` (Vite + React 19) và `server/` (Express + Mongoose 8).
* `.env.example` chứa `MONGODB_URI=` và `PORT=`; `.env` trong `.gitignore`.
* Commit: `init: scaffold hw2 swipe deck client and server`

### Task 0.2: API Contract
* `GET /api/profiles` → `200 [{ _id, name, age, bio, imageUrl }]`
* `POST /api/swipe` body `{ profileId, direction: 'left'|'right'|'up' }` → `201` record | `400 { error }`
* Commit: `docs: define swipe api contract`

## SPRINT 1: BACKEND

### Task 1.1: Kết nối DB an toàn
* Guard `MONGODB_URI`, `await mongoose.connect(uri)` không flag deprecated, CORS origin `http://localhost:5173`, `express.json()`.
* Commit: `feat: mongoose 8 connection with env guard`

### Task 1.2: Models
* `Profile` và `Swipe` schema (direction là enum, `profileId` required, timestamps).
* Commit: `feat: add profile and swipe models`

### Task 1.3: Endpoints
* `GET /api/profiles` dùng `.find().lean()`.
* `POST /api/swipe` validate payload → `Swipe.create()` trong `try/catch`.
* Commit: `feat: profiles and swipe endpoints`

## SPRINT 2: FRONTEND STATE

### Task 2.1: Hook `useProfiles`
* Fetch có `AbortController`, guard `signal.aborted` ở try/catch/finally, trả `{ data, loading, error }`.
* Commit: `feat: useProfiles hook with abort controller`

### Task 2.2: LIFO Undo Stack
* `history` bất biến, `swipe(direction)` thêm phần tử, `undoLastSwipe()` dùng `slice(0, -1)`.
* Lá bài hiện tại = Derived State từ `profiles` và `history.length`.
* Commit: `feat: lifo undo stack for swipe history`

### Task 2.3: Asymmetric Score
* Hằng số trọng số + `history.reduce(...)` trong render. Không lưu score vào state.
* Commit: `feat: derived asymmetric score`

## SPRINT 3: EVENT LISTENERS

### Task 3.1: Keyboard
* `onKeyDown` trên container `tabIndex={0}`: ArrowLeft / ArrowRight / ArrowUp / Backspace.
* Commit: `feat: keyboard swipe controls`

### Task 3.2: Pointer
* `onPointerDown` lưu `startPos`, `onPointerUp` tính `dx` (ngưỡng 50px), guard `startPos` null.
* Commit: `feat: pointer swipe gesture`

### Task 3.3: Persist swipe
* Mỗi swipe gọi `POST /api/swipe`; lỗi hiển thị trong `role="alert"`, không có unhandled rejection.
* Commit: `feat: persist swipe to backend`

## SPRINT 4: UI & AUDIT

### Task 4.1: SwipeCard UI
* `<article>` thẻ bài, nút icon có `aria-label`, score trong `<output aria-live="polite">`, mobile-first 375px.
* Commit: `feat: accessible swipe card ui`

### Task 4.2: Audit
* Ghi lỗi AI (callback Mongoose cũ, hardcode URI, score bằng useEffect...) vào `AI_FAILURE_AUDIT.md`.
* Commit: `docs: ai failure audit hw2`

## CHECKLIST NGHIỆM THU
- [ ] Bàn phím và chuột/cảm ứng đều swipe được
- [ ] Undo nhiều lần khôi phục đúng thứ tự
- [ ] Score đúng sau swipe và undo
- [ ] Server chạy được khi thiếu `.env` thì báo lỗi rõ ràng
- [ ] Tối thiểu 10 commit atomic
