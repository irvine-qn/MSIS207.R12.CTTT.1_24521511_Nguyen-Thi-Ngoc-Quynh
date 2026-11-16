# TASK_DECOMPOSITION

## SPRINT 1: ROUTER MIGRATION & MASTER-DETAIL VIEWS

### Task 1.1: Performance & Resiliency Architectural Upgrades (Exercise 1.1)

* **Mục tiêu**: Tối ưu hóa hiệu suất load trang và triệt tiêu lỗi layout shift.
* **Chi tiết công việc**:
  * Áp dụng Code-Splitting: Cập nhật các route tĩnh thành import động sử dụng `React.lazy()`.
  * Thiết lập Suspense Boundaries: Bọc các route đã lazy-load bằng `<Suspense fallback={...}>`.
  * Xây dựng component Skeleton trùng khớp kích thước với layout thật để CLS (Cumulative Layout Shift) = 0.
  * Bổ sung chuẩn Accessibility: Thêm `aria-busy="true"` và `aria-live="polite"` vào Skeleton fallback.

### Task 1.2.1: Declarative Syntax Updates & React Router v7 Layout Architecture (Exercises 1.2 & 1.2.1)

* **Mục tiêu**: Nâng cấp cú pháp định tuyến lên chuẩn React Router v7.
* **Chi tiết công việc**:
  * Refactor file `App.jsx`: Xóa bỏ thẻ `<Switch>` cũ, thay bằng `<Routes>`.
  * Cập nhật khai báo `<Route>`: Sử dụng prop `element={<Component />}` thay vì lồng children bên trong.
  * Khởi tạo cấu trúc Nested Route: Xây dựng component `Layout` và sử dụng `<Outlet />` để chia sẻ UI chung.
  * Nâng cấp Navigation: Dùng `<NavLink>` với callback syntax `className={({isActive}) => isActive ? 'active' : ''}`.

### Task 1.2.2: Refactoring for Master-Detail Views via React Router & CSS Grid (Exercise 1.2.2 / 1.3.2)

* **Mục tiêu**: Xây dựng giao diện xem chi tiết có khả năng trích xuất URL và xử lý lỗi 404.
* **Chi tiết công việc**:
  * **Giao diện (PeopleLayout.jsx)**: Áp dụng Responsive CSS Grid với thuộc tính `grid-template-columns: minmax(280px, 1fr) 2fr`.
  * **Logic (PersonDetail.jsx)**: Trích xuất an toàn tham số từ URL thông qua hook `useParams()`.
  * **Rào lỗi 404**: Tìm kiếm thực thể bằng `people.find()`. Khai báo explicit return cho trường hợp không tìm thấy (Hiển thị fallback state có `role="alert"`).
  * **Semantic HTML**: Render chi tiết thuộc tính dữ liệu bằng Definition Lists (`<dl>`, `<dt>`, `<dd>`).

---

## SPRINT 2: SYNCHRONOUS FORM VALIDATION ENGINE

### Task 1.3: Legacy Validation Anti-Patterns & Context Form Engine (Exercise 1.3)

* **Mục tiêu**: Loại bỏ chuỗi thác (waterfalls) `useEffect` liên hoàn và xây dựng cơ chế quản lý form đồng bộ bằng Context.
* **Chi tiết công việc**:
  * **Xóa bỏ Anti-patterns**: Loại bỏ toàn bộ `useEffect` đang dùng để trigger validate form (ngăn lỗi Maximum update depth exceeded).
  * **FormContext.js**: Khởi tạo `createContext()` để tính toán Derived State (lỗi form, trạng thái hợp lệ) trực tiếp ngay trong chu kỳ render (Synchronous Evaluation).
  * **InputField.jsx**: Tích hợp hook `useId()` để tạo ID liên kết. Gắn `aria-invalid={!!error}` và `aria-describedby` vào thẻ input để đáp ứng chuẩn Screen Reader. Cấu trúc lại file bằng cặp `<dl>`, `<dt>`, `<dd>` nếu cần.
  * **SimpleForm.jsx & ShowData.jsx**: Bọc form bằng `<FormContext.Provider>` và xây dựng `<ShowData />` render JSON output dạng Semantic `<dl>` list.

---

## SPRINT 3: FULL-STACK CUSTOM HOOKS & EXPRESS REST API

### Task 1.7.1: Data Fetching & Express Hygiene (Exercise 1.7.1)

* **Mục tiêu**: Đảm bảo an toàn bộ nhớ (memory hygiene) cho hook gọi dữ liệu và xây dựng API backend bảo mật.
* **Chi tiết công việc Client (useForumMessages.js)**:
  * Khởi tạo `AbortController` ngay trong `useEffect`.
  * Đính kèm `{ signal: controller.signal }` vào request `fetch()`.
  * Tích hợp guard logic `if (!controller.signal.aborted)` vào cả ba khối `try`, `catch` và `finally` để chặn cập nhật state khi tab hoặc component đã bị hủy.
  * Thêm cơ chế dọn dẹp bằng `return () => controller.abort()`.
* **Chi tiết công việc Server (Express REST API)**:
  * Cài đặt và thiết lập CORS Middleware (`cors()`).
  * Tạo endpoint `GET /api/messages/:forum` bằng cấu trúc Mongoose 8 (`async/await`, bỏ hoàn toàn callback cũ).
  * Tạo endpoint `POST /api/messages/:forum`. Khởi tạo guard check bắt buộc để validate POST payload đầu vào.
  * Sử dụng `crypto.randomUUID()` tạo mã ID an toàn cho bản ghi mới.
* 