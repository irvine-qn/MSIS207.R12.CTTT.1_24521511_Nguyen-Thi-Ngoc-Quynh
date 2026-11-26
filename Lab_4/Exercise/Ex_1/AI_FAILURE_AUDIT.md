# AI FAILURE AUDIT

**Project:** People Directory, Synchronous Form Engine & Forum REST API

**Phạm vi:** Các lỗi do AI sinh ra trong quá trình làm Ex_1 (Sprint 1 đến Sprint 3), được phát hiện qua review code theo `task_decomposition.md` và `PROJECT_RULE.md`, chạy thử server bằng script và chạy lệnh build, sau đó refactor lại.

## Tổng hợp

| # | Lỗi | Sub-task | Phát hiện bằng | Mức độ |
| - | --- | -------- | -------------- | ------ |
| 1 | `NavLink` dùng `styles.active` thay vì chuỗi `'active'` | 1.2.1 | Review theo task decomposition | Thấp: sai cú pháp đề yêu cầu |
| 2 | Skeleton của `/people` không khớp grid 2 cột | 1.1 | Review theo task decomposition | Trung bình: gây layout shift |
| 3 | Skeleton của `/form` không khớp grid 2 cột | 1.1 | Review toàn bộ code | Trung bình: gây layout shift |
| 4 | Đặt `FormContext.js` trong `components/` | 1.3 | Người dùng tự phát hiện | Thấp: sai vị trí file |
| 5 | CORS mở cho mọi origin khi thiếu `CLIENT_ORIGIN` | 1.7.1 | Review toàn bộ code | Cao: lỗ hổng bảo mật |
| 6 | Lỗi body quá lớn trả về thông báo sai | 1.7.1 | Review toàn bộ code | Thấp: thông báo lỗi sai |
| 7 | Không xử lý lỗi khi cổng server bị chiếm, sau đó dùng sai API `app.listen` của Express 5 | 1.7.1 | Chạy script chiếm cổng | Trung bình: log báo sai trạng thái |
| 8 | Hook vẫn gọi API khi tên forum rỗng | 1.7.1 | Review toàn bộ code | Thấp: request thừa trả về 404 |

# Lỗi 1: NavLink không dùng đúng chuỗi `'active'`

**Mô tả:** Đề yêu cầu `className={({isActive}) => isActive ? 'active' : ''}`. AI dùng class của CSS Modules nên kết quả khác với cú pháp đề yêu cầu.

**Code lỗi:**

```jsx
className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
```

**Refactor:** Trả về đúng chuỗi `'active'`. Trong CSS dùng `:global(.active)` để CSS Modules không đổi tên class này.

```jsx
className={({ isActive }) => (isActive ? 'active' : '')}
```

```css
.nav a:global(.active) {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
```

# Lỗi 2: Skeleton của `/people` không khớp layout thật

**Mô tả:** Route `/people` chỉ dùng chung `<Suspense>` của `Layout`. Khi đang tải, trang hiện skeleton một khối cao 16rem, trong khi trang thật là grid 2 cột. Tải xong thì bố cục nhảy, nghĩa là CLS khác 0.

**Code lỗi:**

```jsx
<Route path="people" element={<PeopleLayout />}>
```

**Refactor:** Thêm `variant="people"` cho `Skeleton`, dùng đúng grid `minmax(280px, 1fr) 2fr` và breakpoint 48rem như `PeopleLayout.module.css`. Bọc riêng route `people` bằng skeleton này.

```jsx
<Route
  path="people"
  element={
    <Suspense fallback={<Skeleton variant="people" />}>
      <PeopleLayout />
    </Suspense>
  }
>
```

# Lỗi 3: Skeleton của `/form` không khớp layout thật

**Mô tả:** Khi thêm route `/form` ở Task 1.3, AI lặp lại đúng lỗi 2. `SimpleForm` là grid 2 cột gồm form và `ShowData`, nhưng fallback lại là skeleton một khối.

**Code lỗi:**

```jsx
<Route path="form" element={<SimpleForm />} />
```

**Refactor:** `SimpleForm` có cùng grid và breakpoint với `PeopleLayout`, nên dùng lại `Skeleton variant="people"`.

```jsx
<Route
  path="form"
  element={
    <Suspense fallback={<Skeleton variant="people" />}>
      <SimpleForm />
    </Suspense>
  }
/>
```

# Lỗi 4: Đặt `FormContext.js` sai thư mục

**Mô tả:** AI đặt `FormContext.js` trong `src/components/` để tránh tạo thêm folder. Nhưng file này là context, không phải component. Người dùng đã tự chuyển file sang `src/context/`, sau đó AI sửa lại các đường dẫn import.

**Code lỗi:**

```js
import { useFormContext } from './FormContext.js'
```

**Refactor:**

```js
import { useFormContext } from '../context/FormContext.js'
```

# Lỗi 5: CORS mở cho mọi origin khi thiếu `CLIENT_ORIGIN`

**Mô tả:** Khi `.env` không có `CLIENT_ORIGIN`, code gọi `cors({ origin: undefined })`. Thư viện `cors` xử lý giá trị rỗng giống như `'*'`, nên mọi trang web đều gọi được API. Điều này vi phạm yêu cầu CORS an toàn trong `PROJECT_RULE.md` mục 8.

**Code lỗi:**

```js
const { MONGODB_URI, CLIENT_ORIGIN, PORT = 3001 } = process.env
app.use(cors({ origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] }))
```

**Refactor:** Kiểm tra biến môi trường trước khi khởi động. Nếu thiếu thì báo lỗi và dừng server, giống cách xử lý `MONGODB_URI`.

```js
if (!CLIENT_ORIGIN) {
  console.error('CLIENT_ORIGIN is not set')
  process.exit(1)
}
```

# Lỗi 6: Lỗi body quá lớn trả về thông báo sai

**Mô tả:** Body lớn hơn 10kb trả về mã `413` nhưng nội dung lại ghi `Internal server error`. Phía client không biết được lý do thật.

**Code lỗi:**

```js
res.status(err.status ?? 500).json({ error: err.status === 400 ? 'Invalid JSON body' : 'Internal server error' })
```

**Refactor:** Nhận diện lỗi JSON hỏng qua `err.type`. Lỗi nào có `err.expose` thì hiện đúng nội dung, các lỗi còn lại vẫn ẩn chi tiết bên trong.

```js
const status = err.status ?? 500
const message = err.type === 'entity.parse.failed' ? 'Invalid JSON body' : err.expose ? err.message : 'Internal server error'
res.status(status).json({ error: message })
```

**Kiểm thử:** JSON hỏng trả về `400 Invalid JSON body`. Body 20kb trả về `413 request entity too large`.

# Lỗi 7: Không xử lý lỗi cổng và dùng sai API của Express 5

**Mô tả:** Ban đầu `app.listen` không bắt lỗi. Khi cổng 3001 bị chiếm, server tắt mà không báo rõ nguyên nhân. Ở lần sửa đầu, AI gắn `.on('error')` theo cách viết của Express 4. Nhưng trong Express 5, callback của `app.listen` được gọi cả khi có lỗi, với lỗi ở tham số đầu tiên. Vì vậy server in ra `Server listening` trước khi báo lỗi cổng.

**Code lỗi:**

```js
app
  .listen(PORT, () => console.log(`Server listening on port ${PORT}`))
  .on('error', async (err) => {
    console.error(err.code === 'EADDRINUSE' ? `Port ${PORT} is already in use` : 'Could not start server', err)
    await mongoose.disconnect()
    process.exit(1)
  })
```

**Kết quả lỗi khi chạy thử:**

```
Server listening on port 3997
Port 3997 is already in use Error: listen EADDRINUSE: address already in use :::3997
```

**Refactor:** Kiểm tra lỗi ngay trong callback theo cách của Express 5.

```js
app.listen(PORT, async (err) => {
  if (err) {
    console.error(err.code === 'EADDRINUSE' ? `Port ${PORT} is already in use` : 'Could not start server', err)
    await mongoose.disconnect()
    process.exit(1)
  }
  console.log(`Server listening on port ${PORT}`)
})
```

**Kiểm thử:** Khi cổng bị chiếm, server chỉ in `Port ... is already in use` và thoát với mã 1. Khi cổng trống, server chạy bình thường.

# Lỗi 8: Hook vẫn gọi API khi tên forum rỗng

**Mô tả:** Khi `forum` là chuỗi rỗng, `useForumMessages` vẫn gọi `/api/messages/` và nhận về 404.

**Refactor:** `useEffect` thoát sớm khi `forum` rỗng. Hook trả về giá trị rỗng ngay trong lúc render, không gọi `setState` bên trong effect.

```js
useEffect(() => {
  if (!forum) {
    return
  }
  const controller = new AbortController()
  ...
}, [forum])

if (!forum) {
  return { messages: [], loading: false, error: null }
}
```
