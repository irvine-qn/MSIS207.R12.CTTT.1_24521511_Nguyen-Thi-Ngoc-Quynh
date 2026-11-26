# AI_FAILURE_AUDIT – HW_1

## Lighthouse va WCAG 2.2 AA

Chua chay. Can chay Lighthouse (Performance, Accessibility) tren ban build `npm run build && npm run preview` sau khi co du lieu anh that, roi ghi ket qua vao day.

| Hang muc | Ket qua | Ghi chu |
| :-- | :-- | :-- |
| Performance | Chua do | |
| Accessibility | Chua do | |
| CLS | Chua do | |
| Contrast | Chua do | |
| Focus visible | Chua do | |

## Loi va ao giac cua AI

| # | Van de | Cach xu ly |
| :-- | :-- | :-- |
| 1 | `NavLink` cua React Router v7 bo qua query string khi tinh `isActive`, nen khong dung duoc cho bo loc `?category=` | Dung `Link` va tu tinh `aria-current` tu `searchParams` |
| 2 | Khi Back dong dialog, `close()` goi lai `onClose`, co the xoa `photoId` hai lan | `handleClose` thoat som neu URL khong con `photoId` |
| 3 | Dong lightbox bang nut Back khong tra focus ve thumbnail vi `photoId` da mat khoi URL | Luu id anh vua mo trong `useRef` va focus theo id do khi `onClose` chay |
| 4 | StrictMode chay effect hai lan, goi `showModal()` tren dialog dang mo se nem loi | Kiem tra `dialog.open` truoc khi goi `showModal()` hoac `close()` |
