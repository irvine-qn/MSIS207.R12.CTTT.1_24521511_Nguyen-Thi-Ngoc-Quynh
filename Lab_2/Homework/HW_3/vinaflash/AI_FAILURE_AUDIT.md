# AI Failure Mode Audit — VinaFlash

Báo cáo này ghi lại các lỗi do trợ lý AI (Claude Code) gây ra trong quá trình xây dựng VinaFlash, cách phát hiện, nguyên nhân gốc và cách khắc phục. Mỗi lỗi đều xảy ra thật trong lịch sử phát triển dự án.

| # | Lỗi | Mức độ | Phát hiện bởi |
|---|---|---|---|
| 1 | Gọi `Date.now()` trong lúc render gây lỗi hydration | Cao | Next.js dev overlay |
| 2 | Gọi `setState` trực tiếp trong `useEffect` | Trung bình | ESLint |
| 3 | Khởi tạo project sai thư mục | Trung bình | Người dùng |
| 4 | Dùng ảnh ngẫu nhiên từ dịch vụ bên ngoài | Thấp | Người dùng review |
| 5 | Giá sản phẩm do AI tự ước lượng | Thấp | Tự review |

---

## 1. `Date.now()` trong lúc render gây lỗi hydration

**Hiện tượng.** Khi chạy `npm run dev`, Next.js 16 báo 2 lỗi:
- `src/components/FlashSaleTester.tsx`: `useState(() => Date.now())` bị chặn vì gọi API phụ thuộc thời gian khi render trên server.
- Lỗi hydration ở `FlashSaleCard.tsx`: server render `00:04:59:998` nhưng client render `00:05:00:000`.

**Nguyên nhân gốc.** AI viết component đếm ngược như một ứng dụng chỉ chạy phía client. Nó bỏ qua việc Next.js App Router render component `"use client"` 2 lần (server rồi hydrate trên client). Giá trị `Date.now()` khác nhau giữa 2 lần nên HTML không khớp.

**Khắc phục.** Tách `FlashSaleTester` thành vỏ ngoài và `FlashSaleTesterContent`. Vỏ ngoài dùng `useSyncExternalStore` để chỉ render phần đếm ngược sau khi đã ở trên trình duyệt. Server và lần render đầu trên client đều trả về cùng một dòng "Đang tải flash sale...".

**Bài học.** Với mọi giá trị phụ thuộc thời gian hoặc ngẫu nhiên, phải hỏi "giá trị này có giống nhau giữa server và client không?" trước khi đưa vào render. Kiểm tra tĩnh (`tsc`, `eslint`) không bắt được lỗi này; phải chạy app thật.

## 2. `setState` trực tiếp trong `useEffect`

**Hiện tượng.** Phiên bản đầu của logic hết hạn giữ hàng đặt `setItems`/`setLocks` trong thân một `useEffect` phụ thuộc `[now, locks]`. ESLint báo `react-hooks/set-state-in-effect`: gây render dây chuyền.

**Nguyên nhân gốc.** AI dùng mẫu "đồng bộ state bằng effect" đã lỗi thời, trong khi bộ rule React mới của `eslint-config-next` 16 cấm mẫu này.

**Khắc phục.** Ban đầu chuyển logic vào callback của `setInterval`. Sau đó thay hẳn bằng `inventoryStateMachine.ts`: việc hết hạn do engine tự xử lý qua `setTimeout`, React chỉ đọc state qua `useSyncExternalStore`.

**Bài học.** Logic nghiệp vụ (hết hạn, trả kho) nên nằm trong engine độc lập với React, không nằm trong effect.

## 3. Khởi tạo project sai thư mục

**Hiện tượng.** Ở bước đầu tiên, AI tạo thư mục `vinaflash/` ở gốc repo thay vì trong `Lab_2/Homework/HW_3/`. Người dùng phải tự tạo lại project bằng `create-next-app` đúng chỗ, để lại một thư mục thừa trong repo.

**Nguyên nhân gốc.** AI thấy repo có các thư mục `Lab_1`, `Lab_2` nhưng không hỏi vị trí, tự chọn gốc repo, và chỉ nhắc sau khi đã tạo xong.

**Khắc phục.** Xóa thư mục `vinaflash/` thừa ở gốc repo.

**Bài học.** Khi repo có cấu trúc rõ ràng theo bài lab, AI phải hỏi hoặc suy ra vị trí trước khi tạo file, không phải sau.

## 4. Ảnh sản phẩm lấy từ dịch vụ bên ngoài

**Hiện tượng.** `imageUrl` ban đầu trỏ tới `https://picsum.photos/...`: ảnh ngẫu nhiên, không liên quan sản phẩm, cần mạng mới hiện, và đường dẫn bị viết cứng trong từng sản phẩm.

**Nguyên nhân gốc.** AI ưu tiên "chạy được nhanh" thay vì dữ liệu phù hợp với domain.

**Khắc phục.** Vẽ ảnh SVG riêng trong `public/images/products/`, tạo hàm `productImageUrl(slug)` để ghép đường dẫn từ một hằng số thư mục.

## 5. Giá sản phẩm do AI ước lượng

**Hiện tượng.** Giá trong `src/data/mockProducts.ts` (ví dụ iPhone 16 Pro Max 34.990.000 ₫) do AI tự đưa ra, không đối chiếu nguồn bán lẻ nào.

**Nguyên nhân gốc.** AI tạo dữ liệu "trông hợp lý" từ kiến thức huấn luyện, không có dữ liệu giá thời gian thực.

**Khắc phục.** Ghi rõ đây là dữ liệu mô phỏng. Nếu cần giá thật phải đối chiếu với trang bán lẻ tại thời điểm nộp bài.

**Bài học.** Dữ liệu do AI sinh ra có thể sai mà vẫn trông đúng; cần đánh dấu rõ là dữ liệu giả lập.
