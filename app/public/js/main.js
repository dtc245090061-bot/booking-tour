// TourViet — Main JavaScript
document.addEventListener('DOMContentLoaded', () => {

  // ── Mobile nav toggle ──────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('nav-open');
      navToggle.textContent = navLinks.classList.contains('nav-open') ? '✕' : '☰';
    });
  }

  // ── Active nav link highlight ──────────────────
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath ||
        (currentPath.startsWith(link.getAttribute('href')) && link.getAttribute('href') !== '/')) {
      link.style.color = 'var(--primary-light)';
      link.style.background = 'rgba(108,99,255,0.1)';
    }
  });

  // ── Auto-dismiss alerts ────────────────────────
  setTimeout(() => {
    document.querySelectorAll('.alert-success').forEach(el => {
      el.style.transition = 'opacity 0.5s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 500);
    });
  }, 5000);

  // ── Submit button loading state ────────────────
  const bookingForm = document.getElementById('bookingForm');
  const submitBtn = document.getElementById('submitBtn');
  if (bookingForm && submitBtn) {
    bookingForm.addEventListener('submit', () => {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Đang xử lý...';
    });
  }

  // ── Smooth scroll for anchor links ────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Number animation for stats ─────────────────
  const animateNumber = (el, target, duration = 1500) => {
    const start = 0;
    const startTime = performance.now();
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + '+';
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;
        const num = parseInt(text.replace(/\D/g, ''));
        if (!isNaN(num) && num > 0) animateNumber(el, num);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
});
