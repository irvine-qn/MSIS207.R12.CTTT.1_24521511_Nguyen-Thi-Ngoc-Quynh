# AI_FAILURE_AUDIT – HW_3

## Post-mortem kien truc

| # | Van de AI de xuat | Rui ro | Cach xu ly | Cach kiem chung |
| :-- | :-- | :-- | :-- | :-- |
| 1 | Import `Switch`, `exact` cua React Router v5 | Khong ton tai trong v7, app crash | Dung `createBrowserRouter` voi mang route, `<Outlet />`, `NavLink` callback `isActive` | `vite build` pass, grep khong con `Switch`/`exact` |
| 2 | Validate form bang `useEffect` + `setErrors` | Render thua, loi hien tre 1 nhip, de vong lap effect | `errors = useMemo(() => validateAppeal(values), [values])`, `isValid` tinh truc tiep trong render | grep khong co `useEffect` ngoai `src/hooks` |
| 3 | Viet rule validate rieng cho client va server | Hai noi lech nhau, payload qua client nhung server tu choi | Mot file `shared/appealRules.js` import o ca hai phia | POST payload sai tra 400 voi cung thong diep loi o client |
| 4 | Dem lui bang `setRemaining(r => r - 1000)` | Tab an bi throttle, dong ho bi lech | `remaining = Math.max(0, deadline - Date.now())` moi tick, resync khi `visibilitychange` visible | Mo phong nhay `Date.now()` 5 phut, `remaining` dung 5 phut |
| 5 | Quen cleanup listener `visibilitychange` | Ro ri bo nho khi doi route | Cleanup tra ve ca `clearInterval` va `removeEventListener` | Doc lai `useAppealSlaTimer.js` |
| 6 | Luu matrix vao `useState` va dong bo bang effect | State trung lap, de stale | `useMemo(() => computeMatrix(dossier), [dossier])`, `computeMatrix` la ham thuan | Test node: 2 vi pham cho ket qua dung, `null` tra mang rong |
| 7 | Dung bien co `didCancel` khi fetch | Race condition khi doi player nhanh | `AbortController`, guard `signal.aborted` o try, catch, finally | Doc lai `useDossier.js` |
| 8 | Hardcode `CLIENT_ORIGIN` trong server | Sai khi deploy | Doc tu `process.env.CLIENT_ORIGIN`, guard khi thieu | Header CORS tra dung origin |
| 9 | Server chi validate format, khong kiem tra han | Gui duoc khang cao da het han bang curl | Server kiem tra `Date.now() > appealDeadline` tra 400 | curl voi deadline qua khu tra 400 |
| 10 | Lenh shell heredoc qua dai bi loi parse | Khong tao duoc file component | Ghi tung file bang cong cu ghi file | Kiem tra lai cay thu muc va build |

## Kiem thu API (MongoDB tam qua Docker)

| Hang muc | Ket qua |
| :-- | :-- |
| GET dossier ton tai | 200 |
| GET dossier sai id | 404 |
| POST body rong | 400, du loi 4 truong |
| POST evidenceUrl `http://` | 400 |
| POST playerID khong ton tai | 400 |
| POST hop le | 201 |
| POST JSON hong | 400 `Invalid JSON body` |
| POST khi het han | 400 |
| CORS | `Access-Control-Allow-Origin` dung origin |

## Kiem thu thu cong tren trinh duyet

Chua chay. Can kiem tra qua DevTools va ghi ket qua vao day.

| Hang muc | Ket qua |
| :-- | :-- |
| `/dossier/<id sai>` hien 404 `role="alert"` | Chua do |
| An tab vai phut roi quay lai, countdown dung | Chua do |
| Form khoa khi het han | Chua do |
| Viewport 375px khong cuon ngang | Chua do |
