# HW2: Drum Kit Engine (Contract-First)

## MANDATORY ARCHITECTURAL DECOUPLING:
### Step 1: Commit HTML data-sound contract before touching JavaScript.
- Xác định các phím trống và âm thanh tương ứng trong HTML.
- Sử dụng thuộc tính data-sound để khai báo loại âm thanh.
- Đảm bảo mỗi phím có định danh rõ ràng và không trùng lặp ngoài ý muốn.
- Kiểm tra hợp đồng HTML trước khi viết JavaScript.
- Commit riêng trước khi bắt đầu phần JavaScript.
Commit: `feat(html): define data-sound contract`

### Step 2: Implement polyphonic Audio playback engine independently.
- Xây dựng bộ phát âm thanh độc lập với giao diện và bàn phím.
- Cho phép nhiều âm thanh phát đồng thời (polyphony).
- Mỗi lần kích hoạt âm thanh cần có thể tạo một lượt phát riêng, tránh việc âm thanh mới làm dừng âm thanh đang phát.
- Xử lý trường hợp thiếu file âm thanh hoặc lỗi phát âm thanh.
- Kiểm tra bằng cách kích hoạt nhiều tiếng trống gần như đồng thời.
Commit: `feat(audio): implement polyphonic playback engine`

### Step 3: Implement keydown listener with event.repeat throttling.
- Đăng ký sự kiện keydown.
- Ánh xạ phím bàn phím máy tính với từng tiếng trống.
- Sử dụng event.repeat để bỏ qua sự kiện lặp khi người dùng giữ phím.
- Chỉ kích hoạt một lượt phát cho một lần nhấn hợp lệ.
- Tách cấu hình ánh xạ phím khỏi logic phát âm thanh.
Commit: `feat(input): handle keyboard drum triggers`

### Step 4: Implement FIFO Beat Recorder (timestamped event queue).
- Tạo hàng đợi sự kiện ghi lại các lần đánh trống.
- Mỗi sự kiện có thông tin về âm thanh và thời điểm kích hoạt.
- Đảm bảo thứ tự sự kiện theo nguyên tắc FIFO (First In, First Out).
- Ghi lại timestamp tại thời điểm sự kiện xảy ra.
- Kiểm tra thứ tự ghi nhận và khả năng phát lại chuỗi sự kiện nếu phạm vi bài yêu cầu.
Commit: `feat(recorder): add timestamped FIFO beat queue`