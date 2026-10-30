# Yêu cầu của Ex_1:

1. Objective: Build "Developer Card" and "SkillBadge" in React 19 using Vite, synthesizing the Elon Musk Card (Ex 4.4) and User Profile (Ex 4.5).
2. Strict Zero Div-Soup Constraint: ZERO div tags permitted inside DeveloperCard.jsx. Use article, header, hgroup, dl, dt, dd, ul, li, Fragment.
   CSS Modules & 375px Responsive Contract: Replace Slide 18's inline style={{ background: 'd0f0c0' }} with DeveloperCard.module.css and CSS Custom Properties.
3. HTTPS Security & Image Dimensions: Replace Slide 21's insecure http:// avatar with HTTPS, explicit width/height (zero CLS), and fallback initials.
4. Atomic Git Commits (2 Commits):

- Commit 1: 'feat(ex1): implement semantic DeveloperCard and SkillBadge'
- Commit 2: 'style(ex1): add responsive 375px CSS module'.
- Lưu ý: cập nhật ít nhất 10 commits
- Bài tập nộp trước 17h 30/10/2026

---

# idea:

**"ElonHub"** — Một thẻ hồ sơ nhà phát triển (Developer Profile Card) theo phong cách tối giản, hiển thị ảnh đại diện, tên, chức danh, mô tả ngắn, danh sách các thông tin liên hệ/thống kê (qua `dl`,`dt`,`dd`), và bộ kỹ năng (Skills Array qua `ul`,`li` chứa các `SkillBadge`).

---



# FLOW LÀM BÀI

1. Kiểm tra project hiện tại và set up môi trường

- Mở project React bằng VS Code.
- Kiểm tra cấu trúc src/.
- Tìm các component DeveloperCard, SkillBadge cũ.
- Kiểm tra CSS inline và URL hình ảnh HTTP.

2. Xây dựng DeveloperCard và SkillBadge

   - Tạo hai component.
   - Sử dụng React props.
   - Không sử dụng  trong DeveloperCard.
   - Sử dụng Semantic HTML.
3. Xử lý hình ảnh

   - Chuyển URL sang HTTPS.
   - Khai báo width và height.
   - Xử lý fallback initials.
4. Commit feature hoàn chỉnh.
5. Xây dựng CSS Modules

   - Tạo file .module.css.
   - Sử dụng CSS Custom Properties.
   - Hoàn thiện giao diện.
   - Responsive 375px.
6. Commit phần styling.
7. Chạy kiểm tra

   - Chạy ex1-verification-audit.sh.
   - Kiểm tra Accessibility Tree.
   - Kiểm tra Responsive bằng Chrome DevTools.
   - Kiểm tra Git Log.
