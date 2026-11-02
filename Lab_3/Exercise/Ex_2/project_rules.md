# sau đây là các yêu cầu bạn phải cực kỳ chú ý trong khi code project:

# 1. Về nội dung code cơ bản

- Không được tự ý xóa thư mục/ files hay dòng code.
- Không được hardcode, đặc biệt là đối với UI, cần phải thông báo tôi về việc phải thay đổi/ thêm bất kỳ hình ảnh gì. không tự ý gen link ảnh, không được xóa file.
- Phải đọc file task_decomposition.md trước khi thực hiện code. phải làm theo đúng yêu cầu của file .md. không được bịa nội dung
- không tự ý thêm chức năng hay comment line khi tôi không yêu cầu
- Cập nhật từng bước một, không được tự ý commit line của tôi
- chia đúng file và thư mục/ vị trí cần thiết của nó. không được tự ý thêm folder
- Đặt tên file phải logic, dễ hiểu
- không được thêm file trùng nội dung với file đã có sẵn
- Trường hợp tạo 1 file mới, phải thông báo tôi về việc này, đồng thời phải so sánh với các file cũ/ các file có tên tương tự để đảm bảo nó có tồn tại hay chưa. Nếu nó tồn tại thì không được tạo file mới.
  CỰC KỲ QUAN TRỌNG: CHỈ THỰC HIỆN NỘI DUNG TÔI YÊU CẦU VÀ DỰA VÀO FILE task_decomposition.md ĐỂ THỰC HIỆN NÓ. TUYỆT ĐỐI KHÔNG ĐƯỢC HOÀN THÀNH TOÀN BỘ FILE task_decomposition.md TRONG 1 LẦN.
- chỉnh sửa lại cmt line trong code nếu nó cực kỳ quan trọng: chỉ đặt chữ, không có các ký tự đặc biệt, ghi ngắn gọn và đầy đủ. Đối với các cmt line ko cần thiết thì xóa đi.

# 2. Các yếu tố UI:

- File màu phải nằm trong nhóm color palette sau:

  #9FA0FF

  #D5E8E6

  #FFF3E3

  #FF7171

# 3. Tech stack

Ưu tiên chuẩn Production React 19, Fiber Hooks & Concurrent UI

* **Core Stack**: React 19, Vite, Modern ES2024 JavaScript, Scoped CSS Modules, Standard HTML5.
* **Strict Dependency Ban**:
  * **CẤM** sử dụng Tailwind CSS, Bootstrap, jQuery, hoặc các CDN CSS/JS bên ngoài.
  * **CẤM** sử dụng các thư viện UI Kit cũ (như Ant Design v4 hay các gói CSS gây phình bundle).

### Danh sách các API và anti-patterns bị CẤM:

**React Lifecycle & Mounting**:

| cấm                                                                                    | bắt buộc sử dụng                                                                                      |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `ReactDOM.render()`                                                                   | Dùng `createRoot` từ `'react-dom/client'` bọc trong `<StrictMode>` để phát hiện memory leak. |
| Class Components (`class extends React.Component`)                                    | Dùng 100% Pure Functional Components                                                                     |
| `Component.defaultProps` trên Functional Components (đã bị khai tử từ React 19) | Dùng ES6 Default Parameter Destructuring (`function Button({ text = 'Submit' })`)                      |
| `import * as React from 'react'`                                                      | Chỉ import trực tiếp các hook cần thiết (`import { useState, useEffect, useId } from 'react'`)    |
| Khởi tạo side-effects (timer, fetch) trong `constructor()`.                         |                                                                                                           |

**Scoping & Variable Declarations**:

* TUYỆT ĐỐI CẤM khai báo bằng `var` và tạo biến toàn cục ẩn. Mặc định dùng `const`, chỉ dùng `let` khi thực sự có hành vi gán lại giá trị.

**DOM, Security & Events**:

| cấm                                                                                                                                                                         | bắt buộc sử dụng                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Phím gõ cũ `keypress` hoặc `event.keyCode`                                                                                                                           | Dùng chuẩn W3C `event.key` hoặc `event.code` (`KeyW`, `KeyA`,...) để không bị lỗi với bộ gõ Tiếng Việt (UniKey). |
| Ghi trực tiếp `innerHTML` với dữ liệu chưa được xử lý (Nguy cơ Cross-Site Scripting - XSS). Dùng `textContent` hoặc cơ chế escaping tự động của JSX. |                                                                                                                                       |
| Dùng `window.alert()` gây ngắt main thread. Bắt buộc dùng UI Alert Accessible (`<output role="status">` hoặc `role="alert"`)                                    |                                                                                                                                       |

**Reconciliation Keys**: CẤM dùng mảng Index làm `key` (`key={index}`). Bắt buộc dùng ID ổn định, duy nhất của thực thể (`key={item.id}`)

# 4. SEMANTIC JSX & ACCESSIBILITY (A11Y) CONTRACT

* **Zero Div-Soup Mandate**:

  * Tối đa hóa việc dùng các thẻ Landmark chuẩn W3C: `<main>`, `<section>`, `<article>`, `<header>`, `<hgroup>`, `<figure>`, `<output>`.
  * Hiển thị danh sách dữ liệu dạng khóa-giá trị (Key-Value) bằng cặp thẻ `<dl>`, `<dt>`, `<dd>`. **CẤM** dùng nhiều thẻ `<h1>` liên tiếp cho thông tin người dùng/thực thể.
  * Nhóm các thẻ con bằng React `<Fragment>` (`<>...</>` hoặc `<Fragment key={...}>`) thay vì dùng thẻ wrapper `<div>` không cần thiết.
* **Accessible Controlled Forms (React 19 Standard)**:

  * Mọi form control (`<input>`, `<select>`) bắt buộc phải được ghép nối với `<label htmlFor={id}>` tương ứng bằng cách dùng hook `useId()`.
  * Khi đọc giá trị từ input số (`type="number"`), **BẮT BUỘC** đọc qua `e.target.valueAsNumber` (kèm bẫy `Number.isNaN`) để tránh ép kiểu chuỗi sai logic (`'35' + 1 == '351'`).
* **Media Asset Standards**:

  * Mọi hình ảnh phải dùng giao thức HTTPS, cung cấp đầy đủ `alt`, `width`, và `height` chính xác để triệt tiêu lỗi đè/nhảy khung hình (**CLS = 0.00**).

# 5. STATE MANAGEMENT, DERIVED STATE & HOOK HYGIENE

* **Pure Mathematical UI**: $UI = f(props, state)$. Component phải đóng vai trò là một hàm thuần túy (Pure Function).
* **State Immutability (Cập nhật bất biến)**:

  * **CẤM** thay đổi trực tiếp state (như `.push()`, `.sort()`) làm hỏng cơ chế so sánh `Object.is()` của React 19.
  * Bắt buộc tạo reference mới qua Spread Operator (`[...prev]`, `{...prev}`).
  * Khi loại bỏ phần tử dùng `.filter()`. Khi sắp xếp mảng, bắt buộc dùng hàm bất biến ES2023 `.toSorted()` (thay vì `.sort()`).
* **Derived State Invariant (Quy tắc State Dẫn Xuất)**:

  * CẤM tạo state dư thừa và đồng bộ dữ liệu tìm kiếm/lọc/sắp xếp qua `useEffect` (gây hiện tượng Cascading Double-Render).
  * Bắt buộc phải tính toán trực tiếp dữ liệu hiển thị (Derived State) ngay trong luồng Render (Render Body) chỉ trong 1 pass duy nhất.
* **CSS Styling Engine**:

  * **CẤM** viết inline styles trực tiếp (`style={{ ... }}`).
  * Bắt buộc đóng gói giao diện theo cơ chế **CSS Modules** (`*.module.css`) kết hợp với CSS Custom Properties tại `:root`.

# 6. EFFECT LIFECYCLE, MEMORY HYGIENE & ASYNC SAFETY

* **Deterministic Effect Cleanup**:

  * Mọi side-effect trong `useEffect` (Timer, Event Listener, AudioContext) **BẮT BUỘC** phải trả về một hàm cleanup dọn dẹp tài nguyên khi unmount hoặc re-render.
* **Async Race Condition & AbortController**:

  * Mọi tác vụ `fetch()` dữ liệu bất đồng bộ trong `useEffect` phải khởi tạo `AbortController`, truyền `{ signal: controller.signal }` vào fetch và gọi `controller.abort()` trong hàm cleanup return.
  * Khi bắt lỗi `catch(err)`, bắt buộc kiểm tra `if (err.name === 'AbortError') return;` để tránh bắn trạng thái lỗi giả khi người dùng chuyển đổi UI nhanh.
* **Drift-Free Timers (Không lệch thời gian)**:

  * Với các tính năng đếm ngược (như Airdrop, Flash Sale), **CẤM** dùng `setInterval(s => s - 1, 1000)` thuần.
  * BẮT BUỘC tính thời gian còn lại dựa trên mốc thời gian thực `Math.max(0, targetEpochMs - Date.now())` và đăng ký sự kiện `visibilitychange` để đồng bộ lại khi người dùng mở lại tab background.

# 7. AI GOVERNANCE & ANTI-MONOLITHIC WORKFLOW

* **Ban on One-Shot Prompting**:

  * Cấm ném toàn bộ đề bài assignment vào AI để sinh code 1-shot. Hành vi này bị phạt **0 điểm** cho phần Git & AI Audit.
* **Quy trình 4 bước bắt buộc**:

  1. **Functional Slicing**: Phân rã bài toán thành các sub-task nhỏ trong `TASK_DECOMPOSITION.md`.
  2. **Contract-First Definition**: Định nghĩa TypeScript Interfaces / Component Props & State Machine contract trước khi sinh code.
  3. **Atomic Generation**: Prompt AI sinh code duy nhất cho **MỘT** sub-task đã cô lập.
  4. **Contract Verification**: Kiểm thử độc lập bằng Chrome DevTools / React Profiler trước khi commit.
* **Tệp báo cáo bắt buộc (Deliverables)**:

  * `project-rules.md`: Tệp quy tắc hiện tại ở thư mục gốc repo.
  * `TASK_DECOMPOSITION.md`: Bảng phân rã công việc (WBS).
  * `AI_FAILURE_AUDIT.md`: Báo cáo tối thiểu **3 lỗi do AI sinh ra** (như Stale Closures, Redundant Effects, Drift Timers, Memory Leaks) kèm bằng chứng DevTools và mã nguồn refactor thủ công (Chiếm 15% tổng số điểm).

# 6. GIT DISCIPLINE & LIVE DEFENSE PROTOCOL

* **Atomic Commit Standard**:

  * Mỗi commit đại diện cho một thay đổi đơn lẻ, kiểm thử được (Tối thiểu **10 atomic commits** cho mỗi bài Lab/HW).
  * Đặt tên commit chuẩn Conventional Commits (ví dụ: `feat(ex1): implement semantic DeveloperCard`, `fix(a11y): pair input with label using useId`).
