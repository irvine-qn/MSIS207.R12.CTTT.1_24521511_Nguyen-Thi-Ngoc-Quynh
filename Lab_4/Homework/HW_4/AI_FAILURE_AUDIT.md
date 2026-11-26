# AI FAILURE AUDIT

**Project:** HW_4 Live Defense Challenge Bank (refactor trên bản copy của Ex_1)

**Phạm vi:** Các lỗi và sai lệch của AI trong quá trình làm Challenge 1 đến Challenge 4, được phát hiện qua review theo `TASK_DECOMPOSITION.md` và `PROJECT_RULE.md` và chạy lệnh build, sau đó sửa lại.

## Tổng hợp

| # | Lỗi | Sub-task | Phát hiện bằng | Mức độ |
| - | --- | -------- | -------------- | ------ |
| 1 | Đề yêu cầu sync filter / pagination nhưng Ex_1 không có state nào như vậy | 1.1 | Khảo sát code Ex_1 | Trung bình: dễ bịa chức năng ngoài đề |
| 2 | Copy Ex_1 sang HW_4 làm ghi đè `TASK_DECOMPOSITION.md` | Chuẩn bị | Review lệnh copy | Cao: mất file đề bài của HW_4 |
| 3 | Bảng Form data hiển thị password dạng chữ thường | 2.1 | Review component dùng chung | Cao: lộ dữ liệu nhạy cảm |
| 4 | CSS trang Login dùng token màu không tồn tại kèm mã màu cứng | 4.2 | Review theo project rule | Thấp: vi phạm quy tắc không hardcode |

# Lỗi 1: Không có state để đồng bộ lên URL

**Mô tả:** Task 1.1 yêu cầu liệt kê filter / pagination / channel đang dùng `useState`. Ex_1 không có state nào như vậy. Channel của Forum đã nằm trên URL qua route param `forum/:forumId`. State form và state fetch không thuộc loại nên đưa lên URL. Nếu AI tự chọn một chức năng để thêm vào thì sẽ vi phạm rule không tự ý thêm chức năng.

**Refactor:** Dừng lại để hỏi người dùng. Người dùng chọn thêm ô tìm kiếm `?q=` cho People và phân trang `?page=` cho Forum. Kết quả khảo sát được ghi vào Task 1.1 trong `TASK_DECOMPOSITION.md`.

# Lỗi 2: Copy làm ghi đè file đề bài

**Mô tả:** Ex_1 có file `task_decomposition.md`, còn HW_4 có `TASK_DECOMPOSITION.md`. Windows không phân biệt chữ hoa chữ thường, nên copy nguyên thư mục sẽ ghi đè file đề bài của HW_4 bằng nội dung của Ex_1. `PROJECT_RULE.md` cũng bị trùng tên.

**Refactor:** Loại các file tài liệu của Ex_1 ra khỏi lệnh copy, đồng thời bỏ `node_modules` và `dist`.

```bash
tar --exclude=node_modules --exclude=dist --exclude=PROJECT_RULE.md \
  --exclude=task_decomposition.md --exclude=AI_FAILURE_AUDIT.md \
  -cf - -C Ex_1 . | tar -xf - -C ../Homework/HW_4
```

# Lỗi 3: Lộ password trong bảng Form data

**Mô tả:** `ShowData` in ra mọi field của form engine. Sau khi thêm `password` và `confirmPassword`, mật khẩu hiển thị dạng chữ thường trên màn hình.

**Code lỗi:**

```jsx
<dd>{values[name] || '-'}</dd>
```

**Refactor:** Dựa vào `type` của field để che giá trị.

```jsx
<dd>{type === 'password' && values[name] ? '•'.repeat(values[name].length) : values[name] || '-'}</dd>
```

# Lỗi 4: Màu lỗi trang Login bị hardcode

**Mô tả:** AI dùng token `--color-error` không có trong `index.css`, kèm mã màu cứng làm fallback.

**Code lỗi:**

```css
.error {
  color: var(--color-error, #b00020);
}
```

**Refactor:** Dùng token `--color-danger` đã có sẵn, giống `InputField.module.css`.

```css
.error {
  color: var(--color-danger);
}
```
