
# SAU ĐÂY LÀ CÁC YÊU CẦU PHẢI CỰC KỲ CHÚ Ý TRONG KHI CODE PROJECT:

# 1. Về nội dung code cơ bản

- Không được tự ý xóa thư mục/ files hay dòng code.
- Không được hardcode, đặc biệt là đối với UI, cần phải thông báo tôi về việc phải thay đổi/ thêm bất kỳ hình ảnh gì. Không tự ý gen link ảnh, không được xóa file.
- Phải đọc file `task_decomposition.md` trước khi thực hiện code. Phải làm theo đúng yêu cầu của file .md, không được bịa nội dung.
- Không tự ý thêm chức năng hay comment line khi tôi không yêu cầu.
- Cập nhật từng bước một, không được tự ý commit line của tôi.
- Chia đúng file và thư mục/ vị trí cần thiết của nó. Không được tự ý thêm folder.
- Đặt tên file phải logic, dễ hiểu.
- Không được thêm file trùng nội dung với file đã có sẵn.
- Trường hợp tạo 1 file mới, phải thông báo tôi về việc này, đồng thời phải so sánh với các file cũ/ các file có tên tương tự để đảm bảo nó có tồn tại hay chưa. Nếu nó tồn tại thì không được tạo file mới.
- CỰC KỲ QUAN TRỌNG: CHỈ THỰC HIỆN NỘI DUNG TÔI YÊU CẦU VÀ DỰA VÀO FILE `task_decomposition.md` ĐỂ THỰC HIỆN NÓ. TUYỆT ĐỐI KHÔNG ĐƯỢC HOÀN THÀNH TOÀN BỘ FILE TRONG 1 LẦN.
- Chỉnh sửa lại comment line trong code nếu nó cực kỳ quan trọng: chỉ đặt chữ, không có các ký tự đặc biệt, ghi ngắn gọn và đầy đủ. Đối với các comment line ko cần thiết thì xóa đi.

# 3. Tech Stack & Architectural Contract

Ưu tiên chuẩn Production React 19, Fiber Hooks, Concurrent UI & Full-Stack SPA.

* **Core Stack**: React 19, Vite, React Router v7, ES2024 JavaScript, Scoped CSS Modules, Native HTML5.
* **Backend Core**: Express, Mongoose 8 REST APIs.
* **Strict Dependency Ban**:
  * **CẤM** sử dụng Tailwind CSS, Bootstrap, jQuery, hoặc các CDN CSS/JS bên ngoài.
  * **CẤM** sử dụng các thư viện UI Kit cũ (Material-UI v4, Ant Design v4) hay các package legacy (như `react-media`, `typeface-roboto`).
  * **CẤM** dùng các biến môi trường nhúng trực tiếp (Hardcoded Connection Strings). Bắt buộc dùng `process.env`.

### Danh sách các API và anti-patterns bị CẤM:

| Lĩnh vực              | Bị CẤM (Anti-Patterns)                                                                                                         | BẮT BUỘC sử dụng (Modern Standard)                                                                                                      |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Lifecycle**     | `ReactDOM.render()`, Class Components, `Component.defaultProps`                                                              | `createRoot` với `<StrictMode>`, 100% Pure Functional Components, ES6 Default Parameters.                                              |
| **Routing**       | React Router v5 (`<Switch>`, `<Redirect>`, `exact`, `activeClassName`)                                                   | React Router v7 (`<Routes>`, `<Route>`, `<Outlet>`, cấu trúc mảng đối tượng và callback `className={({isActive}) => ...}`). |
| **State & Forms** | Validation Waterfalls (Sử dụng 5-7 tầng `useEffect` gọi nhau liên hoàn để validate form).                              | Đánh giá đồng bộ trong một chu kỳ render duy nhất bằng Derived State hoặc Context Form Engine.                                   |
| **DOM & UI**      | Viết trực tiếp `innerHTML`, CSS bằng JS thư viện ngoài, `<Suspense>` không có Skeleton thay thế gây Layout Shift. | Component Headless/Native HTML, CSS Grid/Flexbox, bọc `<Suspense>` với fallback `<Skeleton aria-busy="true" />`.                      |
| **Backend**       | Khai báo DB strings cứng, dùng callback của Mongoose 5 (`.exec((err, doc) => ...)`).                                       | `process.env.MONGODB_URI`, Mongoose 8 với `async/await` kết hợp `try/catch`.                                                       |

# 4. SEMANTIC JSX & ACCESSIBILITY (A11Y) CONTRACT

* **Zero Div-Soup Mandate**:
  * Tối đa hóa việc dùng các thẻ Landmark chuẩn W3C: `<main>`, `<section>`, `<article>`, `<header>`, `<nav>`, `<output>`.
  * Hiển thị danh sách dữ liệu chi tiết dạng Key-Value (Master-Detail Views) bằng cặp thẻ `<dl>`, `<dt>`, `<dd>` (VD: JSON Inspector hay Person Detail).
* **Accessible Controlled Forms (React 19 Standard)**:
  * Mọi form control BẮT BUỘC phải được ghép nối với `<label htmlFor={id}>` qua hook `useId()`.
  * Ràng buộc Validation thông báo trực tiếp cho Screen Reader qua thuộc tính `aria-invalid` và `aria-describedby` trỏ tới ID của thông báo lỗi.
* **Media & Code-Splitting Asset Standards**:
  * Import động với `React.lazy` phải luôn được bọc trong `<Suspense fallback={...}>` để CLS = 0.
  * Mọi hình ảnh phải dùng HTTPS, có `alt`, `width`, `height`.
* **Viewport 375px & Layout**:
  * Chuẩn Mobile-First (Viewport Baseline 375px), 100% không cuộn ngang. Dùng Native CSS Grid (`grid-template-columns: minmax(280px, 1fr) 2fr`) và Flexbox. Cấm gán width cứng (ví dụ: `width: 500px`).

# 5. STATE MANAGEMENT, CONTEXT ENGINES & HOOK HYGIENE

* **Synchronous Context Form Engine**:
  * Khi xây dựng Multi-step Forms hoặc form phức tạp, sử dụng `Context.Provider` để truyền global state.
  * **Quy tắc State Dẫn Xuất (Derived State Invariant)**: Tính toán trực tiếp dữ liệu (như errors của form, cờ isValid, điểm số...) ngay trong Render Pass đồng bộ qua `useMemo` hoặc logic trực tiếp.
* **State Immutability (Cập nhật bất biến)**:
  * **CẤM** thay đổi trực tiếp state (`.push()`, `.sort()`). Bắt buộc dùng ES2023 `.toSorted()` và Spread Operator.

# 6. EFFECT LIFECYCLE, MEMORY HYGIENE & ASYNC SAFETY

* **Async Race Condition & AbortController**:
  * Khởi tạo Data Fetching trong `useEffect` BẮT BUỘC phải dùng `AbortController`. Truyền `{ signal: controller.signal }`.
  * **CẤM DÙNG BIẾN CỜ BOOLEAN (Leaky `didCancel` flags)**. Bắt buộc bắt lỗi và cập nhật state thông qua điều kiện guard `if (!controller.signal.aborted)` ở cả ba khối `try`, `catch`, và `finally`.
* **Drift-Free Timers (Không lệch thời gian)**:
  * Tính toán thời gian (SLAs, Countdown) dựa trên absolute clock (`Date.now()`). Đăng ký sự kiện `visibilitychange` để đồng bộ hóa lại thay vì tin tưởng vào `setInterval` thuần túy.

# 7. AI GOVERNANCE & ANTI-MONOLITHIC WORKFLOW

* **Quy trình 4 bước bắt buộc**:
  1. **Functional Slicing**: Phân rã bài toán vào `TASK_DECOMPOSITION.md`.
  2. **Contract-First Definition**: Định nghĩa TypeScript Interfaces/Props, API Contract trước khi sinh code.
  3. **Atomic Generation**: Prompt AI sinh code duy nhất cho **MỘT** sub-task đã cô lập.
  4. **Contract Verification**: Kiểm thử độc lập qua DevTools trước khi commit.
* **Tệp báo cáo bắt buộc (Deliverables)**:
  * `project-rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md` (Ghi log các ảo giác/lỗi của AI như vòng lặp validation, xài API cũ...).

# 8. FULL-STACK VERIFICATION & GIT DISCIPLINE

* **Full-Stack Verification Contract**:
  * Sự đồng nhất giữa Server và Client: Mọi payload gửi lên Express REST API phải được xác thực trước.
  * Backend API bắt buộc xử lý Cross-Origin (CORS) an toàn và không bao giờ để lọt Unhandled Promise Rejections.
* **Atomic Commit Standard**:
  * Mỗi commit là 1 thay đổi đơn lẻ, cô lập phạm vi (Tối thiểu 10 commit/HW). Dùng Conventional Commits (ví dụ: `feat: add React Router v7 layout`, `fix: synchronous form validation context`).

# 9. HW_2 CONTRACT: FULL-STACK INTERACTIVE CARD-SWIPE DECK ('Hen Ho Nhung Khong Yeu' Edition)

* **Phạm vi**: Full-stack. Frontend React 19 + Backend Express + Mongoose 8 + MongoDB.
* **Event Listener kép (Keyboard + Pointer)**:
  * Keyboard: `ArrowLeft` = left, `ArrowRight` = right, `ArrowUp` = up, `Backspace` = undo. Gắn trên container có `tabIndex={0}`.
  * Pointer: dùng Pointer Events (`onPointerDown` / `onPointerUp`), ngưỡng swipe `|dx| > 50`. **CẤM** dùng riêng mouse/touch events hay thư viện gesture.
  * Phải guard `startPos === null` trước khi tính `dx`.
* **LIFO Undo Stack**:
  * `history` là mảng bất biến. Push bằng spread `[...prev, action]`, pop bằng `prev.slice(0, -1)`. **CẤM** `.push()` / `.pop()` trực tiếp trên state.
  * Undo phải khôi phục đúng lá bài vừa swipe gần nhất.
* **Asymmetric Score (Derived State)**:
  * Điểm tính bằng `history.reduce(...)` ngay trong render (hoặc `useMemo`). **CẤM** lưu `score` vào `useState` hay cập nhật qua `useEffect`.
  * Bảng trọng số (LIKE +10, còn lại -5, v.v.) đặt thành hằng số, không rải số cứng trong JSX.
* **Backend Mongoose 8**:
  * Guard `if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing')`. Có `.env.example`, KHÔNG commit `.env`.
  * `mongoose.connect(uri)` không kèm flag deprecated (`useNewUrlParser`, `useUnifiedTopology`).
  * `GET /api/profiles` dùng `.find().lean()`; `POST /api/swipe` dùng `Swipe.create()` trong `try/catch`, trả 201/400.
  * Validate payload POST ở cả client và server (validation parity). CORS chỉ cho origin `http://localhost:5173`.
* **Fetch phía client**: dùng `AbortController` + guard `signal.aborted` (mục 6).
* **A11y**: thẻ bài là `<article>`, nút like/dislike/undo có `aria-label`, điểm hiển thị trong `<output aria-live="polite">`.
