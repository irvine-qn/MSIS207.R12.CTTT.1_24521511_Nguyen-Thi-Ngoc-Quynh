# Homework 1: PRODUCTION PORTF

## M1: WCAG 2.2 AA audit -> Commit 'fix(a11y): contrast & landmarks'
- Commit xuyên suốt quá trình làm M1
Cập nhật skeleton portfolio không bao gồm css hay javascript
- Design và điều chỉnh lại UI 
- Chỉnh sửa các chức năng của file javascript nếu có
- Check constrast của nội dung
- Phân tách landmark nội dung phù hợp
- Kiểm tra các vấn đề về accessibility
- Sửa lỗi landmard và contrast
- Chốt lại hoàn thiện M1 bằng commit: 
`fix(ally): constrast & landmarks`


## M2: Focus trap audit -> Commit 'fix(nav): keyboard trap prevention'
- Dùng bàn phím để di chuyển qua các nút, liên kết và ô nhập liệu.
- Kiểm tra modal, menu dropdown và các thành phần điều hướng.
- Kiểm tra khả năng thoát khỏi khu vực bằng Tab, Shift + Tab hoặc phím Escape khi phù hợp.
- Sửa lỗi quản lý focus, nhưng vẫn giữ hành vi focus trap hợp lý bên trong modal khi cần.
- Chốt lại hoàn thiện M2 task bằng commit:
`fix(nav): keyboard trap prevention`

## M3: Strict CSP & zero inline handlers (onclick=... is strictly banned)
- Xác định và loại bỏ inline event handlers.
- Tách logic xử lý sự kiện ra khỏi HTML.
- Thiết lập CSP phù hợp.
- Kiểm tra website sau khi áp dụng CSP để phát hiện chức năng bị chặn.
- Cấm sử dụng `onclick = ...`
- Chốt lại hoàn thiện M3 task bằng commit (nếu có thay đổi):
`fix(M3): finish strict csp and zero inline handlers on M3`

## M4: Lighthouse 100 audit score -> Commit 'perf: optimize assets'
- Chạy Lighthouse và ghi nhận kết quả.
- Xác định các nguyên nhân làm giảm điểm.
- Tối ưu assets và các vấn đề liên quan.
- Chạy lại Lighthouse để kiểm tra kết quả.
- Chốt lại hoàn thiện M4 task bằng commit:
`perf: optimize assets`

# PENALTY: Monolithic PRs or one-shot AI code = 0 pts for architecture.
