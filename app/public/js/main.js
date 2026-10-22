// TourViet — Main JavaScript
document.addEventListener('DOMContentLoaded', () => {

  // ── Theme Mode Toggle (Light / Dark) ─────────────
  const themeToggle = document.getElementById('themeToggle');
  const sidebarThemeToggle = document.getElementById('sidebarThemeToggle');

  function updateThemeUI(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tourviet_theme', theme);
    const titleText = theme === 'light' ? 'Chuyển sang chế độ Ban đêm' : 'Chuyển sang chế độ Ban ngày';
    if (themeToggle) themeToggle.title = titleText;
    if (sidebarThemeToggle) sidebarThemeToggle.title = titleText;
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateThemeUI(nextTheme);
  }

  const initialTheme = localStorage.getItem('tourviet_theme') || 'dark';
  updateThemeUI(initialTheme);

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (sidebarThemeToggle) sidebarThemeToggle.addEventListener('click', toggleTheme);

  // ── Sidebar Drawer Toggle ──────────────────────
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarDrawer = document.getElementById('sidebarDrawer');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    if (sidebarDrawer && sidebarOverlay) {
      sidebarDrawer.classList.add('open');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSidebar() {
    if (sidebarDrawer && sidebarOverlay) {
      sidebarDrawer.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // ── Mobile nav toggle ──────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('nav-open');
      navToggle.textContent = navLinks.classList.contains('nav-open') ? 'Đóng' : 'Menu';
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
      submitBtn.textContent = 'Đang xử lý...';
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
        const num = parseInt(text.replace(/\D/g, ''), 10);
        if (!isNaN(num) && num > 0) animateNumber(el, num);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  // ── Searchable Tour Select Dropdown ───────────────
  const tourSelectWrap = document.getElementById('tourSelectWrap');
  const tourSelectTrigger = document.getElementById('tourSelectTrigger');
  const tourSelectDropdown = document.getElementById('tourSelectDropdown');
  const tourSearchInput = document.getElementById('tourSearchInput');
  const tourOptionsList = document.getElementById('tourOptionsList');
  const noToursFound = document.getElementById('noToursFound');
  const scheduleIdInput = document.getElementById('schedule_id');
  const tourSelectText = document.getElementById('tourSelectText');

  const bookingSidebar = document.getElementById('bookingSidebar');
  const summaryImg = document.getElementById('summaryImg');
  const summaryName = document.getElementById('summaryName');
  const summaryDest = document.getElementById('summaryDest');
  const summaryDuration = document.getElementById('summaryDuration');
  const summaryDate = document.getElementById('summaryDate');
  const summarySlots = document.getElementById('summarySlots');
  const summaryPriceText = document.getElementById('summaryPriceText');

  const numPeopleInput = document.getElementById('num_people');
  const totalPriceEl = document.getElementById('totalPrice');
  const unitPriceEl = document.getElementById('unitPriceInput');

  function calculateTotal() {
    if (!numPeopleInput || !totalPriceEl || !unitPriceEl) return;
    const unitPrice = parseFloat(unitPriceEl.value) || 0;
    const count = parseInt(numPeopleInput.value, 10) || 1;
    const total = unitPrice * count;
    totalPriceEl.textContent = total.toLocaleString('vi-VN') + ' ₫';
  }

  if (numPeopleInput) {
    numPeopleInput.addEventListener('input', calculateTotal);
  }

  if (tourSelectWrap && tourSelectTrigger) {
    // Open/close dropdown
    tourSelectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = tourSelectWrap.classList.toggle('open');
      if (isOpen && tourSearchInput) {
        tourSearchInput.value = '';
        filterOptions('');
        setTimeout(() => tourSearchInput.focus(), 50);
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!tourSelectWrap.contains(e.target)) {
        tourSelectWrap.classList.remove('open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        tourSelectWrap.classList.remove('open');
      }
    });

    // Filter options in real-time
    function filterOptions(keyword) {
      const q = keyword.trim().toLowerCase();
      const items = tourOptionsList.querySelectorAll('.select-option-item');
      let visibleCount = 0;

      items.forEach(item => {
        const name = (item.dataset.name || '').toLowerCase();
        const dest = (item.dataset.dest || '').toLowerCase();
        const date = (item.dataset.date || '').toLowerCase();
        const match = !q || name.includes(q) || dest.includes(q) || date.includes(q);

        if (match) {
          item.style.display = 'block';
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });

      if (noToursFound) {
        noToursFound.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    if (tourSearchInput) {
      tourSearchInput.addEventListener('input', (e) => {
        filterOptions(e.target.value);
      });
      // Prevent clicking input from closing dropdown
      tourSearchInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Select option handler
    if (tourOptionsList) {
      tourOptionsList.addEventListener('click', (e) => {
        const optionItem = e.target.closest('.select-option-item');
        if (!optionItem) return;

        const id = optionItem.dataset.id;
        const name = optionItem.dataset.name;
        const dest = optionItem.dataset.dest;
        const price = parseFloat(optionItem.dataset.price) || 0;
        const duration = optionItem.dataset.duration;
        const date = optionItem.dataset.date;
        const slots = optionItem.dataset.slots;
        const image = optionItem.dataset.image;

        // Set form value
        if (scheduleIdInput) scheduleIdInput.value = id;
        if (unitPriceEl) unitPriceEl.value = price;
        if (tourSelectText) {
          tourSelectText.textContent = `${name} — ${dest} — Khởi hành: ${date}`;
        }

        // Active class
        tourOptionsList.querySelectorAll('.select-option-item').forEach(el => el.classList.remove('selected'));
        optionItem.classList.add('selected');

        // Update sidebar
        if (bookingSidebar) {
          bookingSidebar.style.display = '';
        }
        if (summaryImg) {
          summaryImg.src = image;
          summaryImg.alt = name;
        }
        if (summaryName) summaryName.textContent = name;
        if (summaryDest) summaryDest.textContent = dest;
        if (summaryDuration) summaryDuration.textContent = duration;
        if (summaryDate) summaryDate.textContent = date;
        if (summarySlots) summarySlots.textContent = `Còn ${slots} chỗ trống`;
        if (summaryPriceText) summaryPriceText.textContent = price.toLocaleString('vi-VN') + ' ₫';

        calculateTotal();

        // Close dropdown
        tourSelectWrap.classList.remove('open');
      });
    }
  }

  // ── Payment Methods Selector ─────────────────────
  const paymentButtons = document.querySelectorAll('.btn-payment');
  const paymentMethodInput = document.getElementById('paymentMethodInput');
  const descItems = {
    cash: document.getElementById('descCash'),
    transfer: document.getElementById('descTransfer'),
    card: document.getElementById('descCard')
  };

  if (paymentButtons.length > 0) {
    paymentButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const method = btn.dataset.method;
        if (!method) return;

        // Update active class on buttons
        paymentButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update hidden input in booking form
        if (paymentMethodInput) {
          paymentMethodInput.value = method;
        }

        // Toggle corresponding description cards
        Object.keys(descItems).forEach(key => {
          if (descItems[key]) {
            descItems[key].style.display = (key === method) ? 'block' : 'none';
          }
        });
      });
    });
  }
});
