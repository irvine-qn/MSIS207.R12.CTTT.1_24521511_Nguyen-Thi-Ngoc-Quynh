# TASK_DECOMPOSITION – HW_1

Đề bài: Production Multi-Route Photo & Evidence Gallery SPA (React Router v7)
Tham chiếu: Slide 19 (Homework 1 Specification), Slide 30 (PhotoGalleryLayout.jsx Contract)

## SPRINT 0: SETUP & CONTRACT

### Task 0.1: Khởi tạo project
* Scaffold Vite + React 19, cài `react-router`.
* `main.jsx` dùng `createRoot` + `<StrictMode>`.
* Commit: `init: scaffold hw1 photo gallery spa`

### Task 0.2: Định nghĩa contract dữ liệu
* Cấu trúc 1 photo: `{ id, title, category, src, alt, width, height }`.
* Danh sách category cố định. Nguồn ảnh: HỎI TÔI trước, không tự gen link.
* Commit: `docs: define photo data contract`

## SPRINT 1: ROUTING & LAYOUT

### Task 1.1: Router v7 + Layout
* `<Routes>` / `<Route element>` lồng nhau, `GalleryLayout` có `<nav>` + `<Outlet />`.
* `<NavLink className={({isActive}) => ...}>`.
* Route lazy bằng `React.lazy` + `<Suspense fallback={<Skeleton aria-busy="true" aria-live="polite" />}>`.
* Commit: `feat: add react router v7 gallery layout`

### Task 1.2: Grid thumbnail responsive
* CSS Modules, CSS Grid mobile-first 375px, không width cứng, không cuộn ngang.
* Ảnh có `alt`, `width`, `height`, `loading="lazy"`.
* Commit: `feat: responsive photo grid`

## SPRINT 2: DEEP LINKING

### Task 2.1: Category filter qua URL
* `useSearchParams()` đọc/ghi `?category=`. Danh sách ảnh lọc là Derived State.
* Category không hợp lệ → hiện toàn bộ hoặc thông báo rỗng.
* Commit: `feat: category filter via search params`

### Task 2.2: Photo id qua URL
* Click thumbnail → set `photoId`, giữ `category`.
* `selectedPhotoId = searchParams.get('photoId')`; `photoId` sai → không mở dialog.
* Commit: `feat: deep link selected photo`

## SPRINT 3: LIGHTBOX `<dialog>`

### Task 3.1: PhotoLightbox với native dialog
* `useRef` + `useEffect([selectedPhotoId])` gọi `showModal()` / `close()`.
* `onClose` xóa `photoId` khỏi URL.
* Commit: `feat: native dialog lightbox`

### Task 3.2: Điều hướng trong lightbox
* Nút Prev / Next / Close có `aria-label`; phím mũi tên chuyển ảnh, `Esc` đóng.
* Commit: `feat: lightbox keyboard navigation`

## SPRINT 4: QUALITY & ACCESSIBILITY

### Task 4.1: Focus management
* Đóng dialog → focus trở lại thumbnail vừa mở.
* Commit: `fix: restore focus after closing lightbox`

### Task 4.2: Audit
* Lighthouse (Performance, Accessibility) + kiểm tra WCAG 2.2 AA (contrast, focus visible).
* Ghi lỗi AI vào `AI_FAILURE_AUDIT.md`.
* Commit: `docs: lighthouse and a11y audit`

## CHECKLIST NGHIỆM THU
- [ ] Copy URL `?category=x&photoId=y` sang tab mới mở đúng ảnh
- [ ] Back/Forward trình duyệt đóng/mở lightbox đúng
- [ ] Không console warning, CLS = 0
- [ ] Tối thiểu 10 commit atomic
