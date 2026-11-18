/**
 * Alumni Hub — Shared Navigation & Keyboard Accessibility Helper
 * Handles mobile menu drawer toggling and Escape-key dismissal for drawers & modals.
 */
(function initAlumniHubNav() {
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('nav-toggle');
    const primaryNav = document.getElementById('primary-nav');

    if (toggleBtn && primaryNav) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = primaryNav.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
      });

      primaryNav.addEventListener('click', (event) => {
        if (event.target.closest('a') && primaryNav.classList.contains('open')) {
          primaryNav.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;

      if (primaryNav && primaryNav.classList.contains('open')) {
        primaryNav.classList.remove('open');
        if (toggleBtn) {
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.focus();
        }
      }

      document.querySelectorAll('.modal-overlay.open, .modal-overlay.active').forEach((modal) => {
        modal.classList.remove('open', 'active');
        document.body.style.overflow = '';
      });
    });
  });
})();
