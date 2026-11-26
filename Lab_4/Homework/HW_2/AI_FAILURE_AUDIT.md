# AI_FAILURE_AUDIT – HW_2

## Loi va ao giac cua AI

| # | Van de | Cach xu ly |
| :-- | :-- | :-- |
| 1 | Callback Mongoose cu `.exec((err, doc) => ...)` | Dung `async/await` voi `try/catch` trong route |
| 2 | Hardcode connection string MongoDB | Doc `process.env.MONGODB_URI`, guard `throw new Error('MONGODB_URI missing')`, them `.env.example` |
| 3 | Luu `score` trong `useState` va cap nhat bang `useEffect` | Tinh `score` bang `history.reduce(...)` trong `useMemo` |
| 4 | Dung `.push()` va `.pop()` truc tiep tren state `history` | Dung `[...prev, action]` va `prev.slice(0, -1)` |
| 5 | Dung bien co `didCancel` khi fetch | Dung `AbortController` va guard `signal.aborted` o try, catch, finally |
| 6 | Lenh shell tao file bang heredoc bi loi parse nen khong tao duoc file client | Tao lai tung file bang cong cu ghi file va kiem tra lai cay thu muc |

## Kiem thu thu cong

Chua chay. Can kiem tra qua DevTools va ghi ket qua vao day.

| Hang muc | Ket qua |
| :-- | :-- |
| Ban phim va pointer swipe duoc | Chua do |
| Undo nhieu lan dung thu tu | Chua do |
| Score dung sau swipe va undo | Chua do |
| Thieu `.env` server bao loi ro rang | Chua do |
