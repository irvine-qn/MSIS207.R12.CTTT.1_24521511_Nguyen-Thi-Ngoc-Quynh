# Lỗi 1: Countdown sai thời gian hoặc không xử lý đúng múi giờ

- Mô tả: Bộ đếm có thể chạy lệch nếu chỉ giảm số giây theo từng nhịp, đặc biệt khi tab chạy nền. Trường `datetime-local` không kèm thông tin múi giờ; thời gian không tồn tại trong khoảng chuyển giờ mùa hè cũng có thể bị trình duyệt tự dịch sang thời điểm khác.
- Phương pháp chẩn đoán: So sánh thời gian còn lại hiển thị với chênh lệch giữa thời điểm bắt đầu sự kiện và `Date.now()`. Thử chọn thời điểm trong quá khứ, ngày giờ không hợp lệ, và giờ địa phương nằm trong khoảng chuyển DST; kiểm tra lại countdown sau khi chuyển tab nền rồi quay lại.
- Hướng giải quyết: Diễn giải thời gian đã chọn theo múi giờ trên thiết bị, đối chiếu các thành phần ngày giờ để từ chối thời điểm không hợp lệ, rồi chuyển thành timestamp ISO có múi giờ. Tính lại thời gian còn lại từ timestamp và đồng hồ hiện tại ở mỗi nhịp; đồng bộ lại khi tab hiển thị trở lại.

# Lỗi 2: Form hiển thị sai trạng thái hoặc không báo kết quả tạo event

- Mô tả: Form có thể báo gửi thành công khi API trả về thất bại, hoặc không cho người dùng biết yêu cầu đang xử lý/thất bại. Event gửi thành công cũng cần được đưa vào bảng cùng countdown để người dùng xác nhận kết quả.
- Phương pháp chẩn đoán: Kiểm tra các nhánh khi gửi form với phản hồi thành công, phản hồi `{ success: false }` và Promise bị từ chối. Quan sát trạng thái `Idle`, `Submitting`, `Success`, `Error`; xác nhận event chỉ được thêm vào bảng khi gửi thành công và có thông báo phù hợp cho cả thành công lẫn thất bại.
- Hướng giải quyết: Chuyển trạng thái theo luồng `Idle → Submitting → Success/Error`; chỉ xác nhận thành công khi phản hồi có `success === true`. Khi thành công, thêm thông tin event và countdown vào bảng, hiện popup xác nhận và cho phép nhập event tiếp theo. Khi thất bại, hiện popup lỗi và cung cấp khả năng thử gửi lại.

# Lỗi 3: Gửi lặp yêu cầu hoặc xử lý không an toàn dữ liệu người dùng

- Mô tả: Nhấn nút gửi liên tục có thể tạo yêu cầu trùng lặp. Dữ liệu thiếu hoặc sai định dạng có thể được gửi lên; nội dung giống HTML/JavaScript có nguy cơ bị thực thi nếu được chèn vào giao diện bằng `innerHTML`.
- Phương pháp chẩn đoán: Nhấn Submit nhiều lần khi yêu cầu đang xử lý và kiểm tra số lần gọi hàm gửi. Thử tiêu đề rỗng/quá ngắn, ngày giờ không hợp lệ hoặc đã qua, nội dung vượt giới hạn, ký tự điều khiển và chuỗi như `<img src=x onerror=alert(1)>`; kiểm tra dữ liệu có bị thực thi hay không.
- Hướng giải quyết: Dùng cờ `requestInFlight` và trạng thái `Submitting` để bỏ qua lần gửi trùng, đồng thời khóa các trường và nút gửi trong lúc xử lý. Chuẩn hóa dữ liệu, loại bỏ ký tự điều khiển và kiểm tra tiêu đề, mô tả, thời gian trước khi gửi. Hiển thị dữ liệu người dùng bằng `textContent` và tạo phần tử giao diện bằng DOM API thay vì chèn nội dung nhập vào bằng `innerHTML`.
