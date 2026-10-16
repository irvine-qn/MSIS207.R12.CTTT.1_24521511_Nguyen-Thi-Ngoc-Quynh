# Task Decomposition — Mini-React VNode & Mounting Engine

## 1. Tổng quan dự án

**Tên bài tập:** Building Mini-React VNode & Mounting Engine  
**Mục tiêu:** Tự xây dựng một phiên bản React thu nhỏ, gồm hàm tạo Virtual Node (VNode) và hàm chuyển VNode thành DOM thật trên trình duyệt.

### Phạm vi chính
- `createElement(type, props, ...children)`: tạo đối tượng VNode.
- `renderToDOM(vnode)`: chuyển VNode thành DOM thật.
- Kiểm tra kiểu dữ liệu đầu vào (strict typeguard).
- Dùng HTML semantic, tránh `div` không cần thiết.
- Chống XSS khi xử lý nội dung văn bản.
- Kiểm tra cây DOM bằng DevTools.
- Tách công việc thành các commit theo yêu cầu.

## 2. Khái niệm cần hiểu

- **VNode:** đối tượng JavaScript mô tả một phần tử giao diện; chưa phải DOM thật.
- **DOM:** cây node thật mà trình duyệt sử dụng để hiển thị trang.
- **Mounting:** quá trình chuyển VNode thành node DOM và gắn node vào trang.
- **Semantic HTML:** chọn thẻ theo đúng ý nghĩa, ví dụ `main`, `header`, `section`, `button`.
- **XSS:** lỗ hổng xảy ra khi nội dung không đáng tin cậy bị diễn giải thành mã HTML/JavaScript có thể thực thi.

## 3. Các milestone

### M1 — Implement `createElement()` factory

**Mục tiêu:** Tạo được cấu trúc VNode từ `type`, `props` và `children`.

**Công việc**
- [ ] Tạo file `mini-react.js`.
- [ ] Xác định cấu trúc VNode thống nhất, ví dụ `{ type, props, children }`.
- [ ] Viết `createElement(type, props, ...children)`.
- [ ] Chuẩn hóa trường hợp `props` không được truyền vào.
- [ ] Hỗ trợ text children, VNode children và nhiều children.
- [ ] Xác định cách xử lý children không hợp lệ theo yêu cầu bài tập.
- [ ] Thêm kiểm tra kiểu dữ liệu (typeguard) cho `type`, `props` và children.
- [ ] Kiểm thử VNode trả về bằng các ví dụ đơn giản.

**Tiêu chí hoàn thành**
- VNode có cấu trúc nhất quán.
- Có thể tạo một thẻ đơn, thẻ có text và cây có nhiều phần tử con.
- Dữ liệu đầu vào không hợp lệ được xử lý rõ ràng, không âm thầm tạo kết quả sai.

**Git commit:** `feat(core): implement createElement factory`

### M2 — Implement `renderToDOM()`

**Mục tiêu:** Chuyển VNode thành DOM thật và gắn vào trang.

**Công việc**
- [ ] Viết hàm `renderToDOM(vnode)`.
- [ ] Xử lý text node bằng API DOM an toàn.
- [ ] Tạo element bằng `document.createElement()`.
- [ ] Duyệt và render đệ quy các children.
- [ ] Gắn các node con vào node cha đúng thứ tự.
- [ ] Xử lý props/attributes cần thiết theo phạm vi bài tập.
- [ ] Xử lý trường hợp VNode hoặc child không hợp lệ.
- [ ] Kiểm thử render cây có `main`, `header`, `h1`, `p` và `button`.

**Tiêu chí hoàn thành**
- Cây VNode được chuyển thành DOM đúng thứ tự và cấu trúc.
- Có thể mount giao diện vào phần tử gốc, ví dụ `#app`.
- Không tạo wrapper `div` dư thừa nếu VNode không yêu cầu.
- Nội dung văn bản và children được hiển thị chính xác.

**Git commit:** `feat(core): implement renderToDOM`

### M3 — Semantic HTML & zero div-soup audit

**Mục tiêu:** Đảm bảo cấu trúc HTML có ý nghĩa và không lạm dụng `div`.

**Công việc**
- [ ] Dùng các thẻ semantic phù hợp như `main`, `header`, `section`.
- [ ] Dùng `button` cho thao tác bấm, không dùng thẻ không phù hợp thay thế.
- [ ] Loại bỏ wrapper không cần thiết.
- [ ] Mở DevTools → Elements để kiểm tra cây DOM.
- [ ] Đối chiếu cây DOM với cây VNode ban đầu.

**Tiêu chí hoàn thành**
- DOM phản ánh đúng cấu trúc VNode.
- Không có `div` thừa chỉ để bọc các phần tử.
- Các phần tử tương tác dùng đúng loại thẻ HTML.

### M4 — Strict typeguard & XSS security audit

**Mục tiêu:** Xử lý dữ liệu đầu vào có kiểm soát và tránh diễn giải text thành HTML thực thi.

**Công việc**
- [ ] Kiểm tra `type` và `props` trước khi dùng.
- [ ] Xác định hành vi cho children có kiểu không được hỗ trợ.
- [ ] Dùng `document.createTextNode()` hoặc `textContent` cho text.
- [ ] Không đưa chuỗi không đáng tin cậy vào `innerHTML`.
- [ ] Kiểm tra chuỗi `<script>alert(1)</script>` được hiển thị như văn bản, không được thực thi.
- [ ] Kiểm tra cách gán props/attributes để tránh tạo đường thực thi mã ngoài ý muốn.

**Tiêu chí hoàn thành**
- Chuỗi thử nghiệm được xử lý như text thuần.
- Không có mã JavaScript nào được thực thi từ chuỗi child thử nghiệm.
- Dữ liệu sai kiểu được từ chối hoặc xử lý theo quy tắc đã định nghĩa.

### M5 — Verification tests & DevTools audit

**Mục tiêu:** Xác nhận các chức năng hoạt động đúng bằng test và kiểm tra trực tiếp.

**Công việc**
- [ ] Tạo/chạy test theo ví dụ `test-runner.js` được cung cấp.
- [ ] Kiểm tra VNode tạo bởi `createElement()`.
- [ ] Kiểm tra `renderToDOM()` mount được giao diện vào `#app`.
- [ ] Kiểm tra `root.querySelector('button')` tìm được nút.
- [ ] Kiểm tra thứ tự và cấu trúc các node trong Elements panel.
- [ ] Kiểm tra thử nghiệm XSS.
- [ ] Sửa lỗi và chạy lại toàn bộ test.

**Tiêu chí hoàn thành**
- Test tạo VNode thành công.
- Test mount tìm được button thành công.
- DOM không có node thừa ngoài cấu trúc dự kiến.
- Kiểm tra XSS đạt yêu cầu.

## 4. Gợi ý cấu trúc file

```text
mini-react-project/
├── index.html
├── mini-react.js
├── test-runner.js
└── TASK_DECOMPOSITION.md
```

Điều chỉnh cấu trúc này theo các file starter mà giảng viên cung cấp; không tạo file trùng nếu dự án đã có sẵn.

## 5. Thứ tự thực hiện đề xuất

1. Đọc kỹ starter code và test runner.
2. Hoàn thành M1 và chạy test cho `createElement()`.
3. Commit M1.
4. Hoàn thành M2 và chạy test cho `renderToDOM()`.
5. Commit M2.
6. Thực hiện semantic HTML, typeguard và kiểm tra XSS.
7. Kiểm tra DOM trong DevTools, chạy lại toàn bộ test.
8. Ghi nhận kết quả kiểm thử và chụp ảnh minh chứng nếu giảng viên yêu cầu.

## 6. Checklist nghiệm thu cuối cùng

- [ ] `createElement()` hoạt động đúng.
- [ ] `renderToDOM()` hoạt động đúng.
- [ ] Xử lý được text và nhiều children.
- [ ] Có kiểm tra kiểu dữ liệu đầu vào.
- [ ] Dùng semantic HTML, không có `div-soup`.
- [ ] Chuỗi XSS được hiển thị như text và không thực thi.
- [ ] DevTools cho thấy DOM đúng với VNode.
- [ ] Test runner chạy thành công.
- [ ] Có commit `feat(core): implement createElement factory`.
- [ ] Có commit `feat(core): implement renderToDOM`.

## 7. Lưu ý

- Đây là bản Mini-React phục vụ bài tập, không phải bản triển khai đầy đủ React.
- Chỉ hỗ trợ các kiểu node, props và event được xác định trong đề hoặc test runner; không tự mở rộng phạm vi khi chưa cần.
- Không dùng `innerHTML` cho text đầu vào không đáng tin cậy.
- Nếu đề hoặc test runner có quy định cấu trúc VNode cụ thể, hãy ưu tiên quy định đó thay vì ví dụ cấu trúc trong tài liệu này.
