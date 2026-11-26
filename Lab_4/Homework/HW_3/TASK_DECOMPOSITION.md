# TASK_DECOMPOSITION – HW_3

Đề bài: Full-Stack Esports Fair-Play Appeal Tribunal – Himass & TanVuu Case Study
Tham chiếu: Slide 21 (Homework 2 Specification), Slide 33 (FairPlayAppealPortal.jsx & useAppealSlaTimer.js Contract)

## SPRINT 0: SETUP & CONTRACT

### Task 0.1: Cấu trúc thư mục
* `client/` (Vite + React 19 + React Router v7), `server/` (Express + Mongoose 8), `.env.example`.
* Commit: `init: scaffold hw3 appeal tribunal`

### Task 0.2: Data & API Contract
* Dossier: `{ playerID, name, team, violations: [...], appealDeadline }` (deadline là timestamp tuyệt đối).
* `GET /api/dossiers/:playerID` → `200` | `404`
* `POST /api/appeals` body `{ playerID, reason, evidenceUrl, contactEmail }` → `201` | `400`
* Rule validate dùng chung cho client và server.
* Commit: `docs: define dossier and appeal contract`

## SPRINT 1: BACKEND

### Task 1.1: Server + Models
* Guard `MONGODB_URI`, CORS, `Dossier` và `Appeal` schema. Seed dữ liệu Himass, TanVuu (HỎI TÔI nội dung).
* Commit: `feat: dossier and appeal models`

### Task 1.2: Endpoints
* GET dossier theo `playerID` (`.lean()`), POST appeal validate payload, async/await + try/catch.
* Commit: `feat: dossier and appeal endpoints`

## SPRINT 2: MULTI-ROUTE DOSSIER

### Task 2.1: Layout + routing
* `PortalLayout` với `<nav>` NavLink tới từng player, `<Outlet />`. Route `/dossier/:playerID`.
* Commit: `feat: portal layout with dossier routes`

### Task 2.2: DossierView
* `useParams()` + hook fetch có AbortController. 404 → `role="alert"`. Chi tiết bằng `<dl>`.
* Commit: `feat: dossier detail view`

### Task 2.3: Disproportionality Matrix
* `computeMatrix()` thuần, `useMemo` theo `dossierData`, render `<table>` có `<caption>`.
* Commit: `feat: derived disproportionality matrix`

## SPRINT 3: APPEAL FORM ENGINE

### Task 3.1: FormContext
* `AppealFormProvider`: `values` trong state, `errors`/`isValid` là Derived State. `useFormContext()`.
* Commit: `feat: appeal form context`

### Task 3.2: InputField
* `useId()`, `<label htmlFor>`, `aria-invalid`, `aria-describedby`, lỗi `role="alert"`.
* Commit: `feat: accessible appeal input fields`

### Task 3.3: Submit
* Submit khi `isValid`, POST lên server, hiển thị kết quả hoặc lỗi 400 từ server.
* Commit: `feat: submit appeal to api`

## SPRINT 4: SLA TIMER

### Task 4.1: `useAppealSlaTimer(deadline)`
* `remaining = Math.max(0, deadline - Date.now())` mỗi tick; trả `{ remaining, isExpired }`.
* `visibilitychange` → resync khi tab visible. Cleanup interval và listener.
* Commit: `feat: zero-drift appeal sla timer`

### Task 4.2: Hiển thị countdown
* `<time>` / `<output aria-live="polite">`; hết hạn thì khóa form.
* Commit: `feat: show sla countdown and lock expired appeal`

## SPRINT 5: AUDIT

### Task 5.1: AI_FAILURE_AUDIT.md (post-mortem kiến trúc)
* Ghi API ảo, vòng lặp effect, timer bị drift, và cách đã kiểm chứng/sửa.
* Commit: `docs: ai failure audit hw3`

## CHECKLIST NGHIỆM THU
- [ ] `/dossier/<id sai>` hiện 404
- [ ] Ẩn tab vài phút rồi quay lại, countdown vẫn đúng
- [ ] Payload sai bị chặn ở cả client và server
- [ ] Tối thiểu 10 commit atomic
