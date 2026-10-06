// Portfolio interactions — clean, dependency-light
(function () {
  'use strict';

  var menuToggle = document.getElementById('menuToggle');
  var navMenu = document.getElementById('navMenu');
  var navbar = document.getElementById('navbar');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function () {
      var open = navMenu.classList.toggle('active');
      menuToggle.classList.toggle('active', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('nav')) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  }

  if (navbar) {
    var onScroll = function () {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Reveal on scroll
  var faders = document.querySelectorAll('.fade');
  if ('IntersectionObserver' in window && faders.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    faders.forEach(function (el) { observer.observe(el); });
  } else {
    faders.forEach(function (el) { el.classList.add('show'); });
  }

  // Active nav highlighting
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('#navMenu a[href^="#"]');
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = '#' + entry.target.id;
          navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // Image modal with arrow navigation (certificates + gallery)
  var modal = document.getElementById('modal');
  var modalImg = document.getElementById('modalImg');
  var modalCaption = document.getElementById('modalCaption');
  var modalCounter = document.getElementById('modalCounter');
  var modalPrev = document.getElementById('modalPrev');
  var modalNext = document.getElementById('modalNext');
  var closeBtn = document.getElementById('close');

  var certBtns = Array.prototype.slice.call(document.querySelectorAll('.cert-media'));
  var galleryImgs = Array.prototype.slice.call(document.querySelectorAll('.gallery-card img'));

  var certItems = certBtns.map(function (btn) {
    var img = btn.querySelector('img');
    var card = btn.closest('.cert-card');
    var title = card && card.querySelector('h3') ? card.querySelector('h3').textContent : '';
    return {
      src: btn.getAttribute('data-full') || (img && img.src) || '',
      alt: (img && img.alt) || title || 'Certificate',
      caption: title
    };
  });

  var galleryItems = galleryImgs.map(function (img) {
    var fig = img.closest('.gallery-card');
    var cap = fig && fig.querySelector('figcaption') ? fig.querySelector('figcaption').textContent : '';
    return { src: img.src, alt: img.alt || 'Gallery photo', caption: cap };
  });

  var currentList = [];
  var currentIndex = 0;

  function renderModal() {
    if (!currentList.length || !modalImg) return;
    var item = currentList[(currentIndex + currentList.length) % currentList.length];
    modalImg.src = item.src;
    modalImg.alt = item.alt;
    if (modalCaption) modalCaption.textContent = item.caption || item.alt || '';
    if (modalCounter) modalCounter.textContent = (currentIndex + 1) + ' / ' + currentList.length;
    var hideNav = currentList.length < 2;
    if (modalPrev) modalPrev.style.display = hideNav ? 'none' : '';
    if (modalNext) modalNext.style.display = hideNav ? 'none' : '';
  }

  function openModalList(list, index) {
    if (!modal || !list.length) return;
    currentList = list;
    currentIndex = index || 0;
    renderModal();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function stepModal(n) {
    if (!currentList.length) return;
    currentIndex = (currentIndex + n + currentList.length) % currentList.length;
    renderModal();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modalImg) modalImg.src = '';
    currentList = [];
    currentIndex = 0;
  }

  certBtns.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      openModalList(certItems, i);
    });
  });
  galleryImgs.forEach(function (img, i) {
    img.addEventListener('click', function () {
      openModalList(galleryItems, i);
    });
  });
  if (modalPrev) modalPrev.addEventListener('click', function (e) { e.stopPropagation(); stepModal(-1); });
  if (modalNext) modalNext.addEventListener('click', function (e) { e.stopPropagation(); stepModal(1); });
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!modal || !modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft') stepModal(-1);
    else if (e.key === 'ArrowRight') stepModal(1);
  });

  // Touch swipe for mobile
  (function () {
    if (!modal) return;
    var startX = null;
    modal.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) startX = e.touches[0].clientX;
    }, { passive: true });
    modal.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) stepModal(dx > 0 ? -1 : 1);
      startX = null;
    }, { passive: true });
  })();

  // Gallery carousel buttons
  var track = document.querySelector('.gallery-scroll');
  var prev = document.querySelector('.gallery-nav.prev');
  var next = document.querySelector('.gallery-nav.next');
  if (track && prev && next) {
    var step = 340;
    prev.addEventListener('click', function () {
      track.scrollBy({ left: -step, behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: step, behavior: 'smooth' });
    });
  }

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle (dark / light, persisted)
  var themeToggle = document.getElementById('themeToggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('jc_theme', theme); } catch (err) {}
    if (themeToggle) {
      var icon = themeToggle.querySelector('i');
      var light = theme === 'light';
      if (icon) icon.className = light ? 'fas fa-sun' : 'fas fa-moon';
      themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    }
    if (themeMeta) themeMeta.setAttribute('content', light ? '#F3F5F8' : '#0B0F19');
  }
  var savedTheme = 'dark';
  try { savedTheme = localStorage.getItem('jc_theme') || 'dark'; } catch (err) {}
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Contact form via EmailJS
  var EMAILJS_PUBLIC_KEY = '51C_cA0zsEDwxIdB0';
  var EMAILJS_SERVICE_ID = 'service_ekzhbgs';
  var EMAILJS_TEMPLATE_ID = 'template_x86e87p';

  if (window.emailjs) {
    try { window.emailjs.init(EMAILJS_PUBLIC_KEY); } catch (err) { /* noop */ }
  }

  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  var sendBtn = document.getElementById('sendBtn');
  var clearBtn = document.getElementById('contactClear');

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'form-status' + (type ? ' ' + type : '');
  }

  if (clearBtn && form) {
    clearBtn.addEventListener('click', function () {
      form.reset();
      setStatus('', '');
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim();
      var message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        setStatus('Please fill in all fields.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus('Please enter a valid email address.', 'error');
        return;
      }
      if (typeof window.emailjs === 'undefined') {
        setStatus('Message service is unavailable right now. Please email jc15ayuda@gmail.com directly.', 'error');
        return;
      }

      var original = sendBtn ? sendBtn.textContent : '';
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending…';
      }
      setStatus('Sending your message…', '');

      var timedOut = false;
      var timeoutId = setTimeout(function () {
        timedOut = true;
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.textContent = original;
        }
        setStatus('Taking longer than expected. Please check your connection and try again.', 'error');
      }, 15000);

      window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: name,
        from_email: email,
        message: message
      }).then(function () {
        if (timedOut) return;
        clearTimeout(timeoutId);
        setStatus('Message sent — thank you! I will get back to you soon.', 'success');
        form.reset();
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.textContent = original;
        }
      }).catch(function () {
        if (timedOut) return;
        clearTimeout(timeoutId);
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.textContent = original;
        }
        setStatus('Something went wrong. Please try again or email jc15ayuda@gmail.com.', 'error');
      });
    });
  }
})();
