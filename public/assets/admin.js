// Admin-only: ask before any destructive form submits.
// Loaded from /assets/admin.js (CSP scriptSrc 'self') — inline handlers are
// blocked by scriptSrcAttr 'none', so the confirmation lives here instead.
document.addEventListener("submit", (event) => {
  const form = event.target.closest("form[data-confirm]");
  if (form && !window.confirm(form.dataset.confirm)) {
    event.preventDefault();
  }
});
