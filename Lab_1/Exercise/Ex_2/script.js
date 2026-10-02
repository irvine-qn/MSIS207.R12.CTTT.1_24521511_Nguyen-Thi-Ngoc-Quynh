document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (!themeToggleBtn) return;

  // 1. Kiểm tra trạng thái đã lưu trong localStorage (Key: 'theme')
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // 2. Lắng nghe sự kiện click để chuyển đổi Theme
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme); // Lưu đúng key 'theme'
  });

  // 3. Hỗ trợ phím Enter/Space cho Button (Accessibility)
  themeToggleBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      themeToggleBtn.click();
    }
  });
});
