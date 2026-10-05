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

  // Profile hover video (Thorfinn)
  var profileMedia = document.getElementById('profileMedia');
  var profileVideo = document.getElementById('profileVideo');
  if (profileMedia && profileVideo) {
    var playProfile = function () {
      profileMedia.classList.add('playing');
      try {
        var p = profileVideo.play();
        if (p && p.catch) p.catch(function () {});
      } catch (err) {}
    };
    var stopProfile = function () {
      profileMedia.classList.remove('playing');
      try {
        profileVideo.pause();
        profileVideo.currentTime = 0;
      } catch (err) {}
    };
    profileMedia.addEventListener('mouseenter', playProfile);
    profileMedia.addEventListener('mouseleave', stopProfile);
    profileMedia.addEventListener('focus', playProfile);
    profileMedia.addEventListener('blur', stopProfile);
    // Tap on mobile toggles playback
    profileMedia.addEventListener('click', function () {
      if (profileMedia.classList.contains('playing')) stopProfile();
      else playProfile();
    });
  }

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

  // Guided tour — game dialogue style, Jhon talks, cursor drives itself
  (function () {
    var overlay = document.getElementById('tourOverlay');
    var spotlight = document.getElementById('tourSpotlight');
    var cursor = document.getElementById('tourCursor');
    var card = document.getElementById('tourCard');
    var stepEl = document.getElementById('tourStep');
    var titleEl = document.getElementById('tourTitle');
    var textEl = document.getElementById('tourText');
    var dotsEl = document.getElementById('tourDots');
    var btnNext = document.getElementById('tourNext');
    var btnBack = document.getElementById('tourBack');
    var btnSkip = document.getElementById('tourSkip');
    var dontShow = document.getElementById('tourDontShow');
    var tourBtn = document.getElementById('tourBtn');
    if (!overlay || !spotlight || !cursor || !card) return;

    // Jhon speaks every line — short game-style sentences
    var steps = [
      { sel: '.hero-content', title: 'Welcome', text: "Hi I'm Jhon, welcome to my website!" },
      { sel: '#profileMedia', title: 'Photo', text: "That's me! Hover my photo for a clip." },
      { sel: '#about', title: 'About', text: "IT student at Holy Cross of Davao College." },
      { sel: '#experience', title: 'Skills', text: "Websites, UI/UX in Figma, mobile + Firebase." },
      { sel: '#projects', title: 'Projects', text: "My builds — open any Live Demo!" },
      { sel: '#certificates', title: 'Certificates', text: "Click a card to zoom, arrows browse." },
      { sel: '#gallery', title: 'Community', text: "GDG and AWS event photos." },
      { sel: '#contactForm', title: 'Contact', text: "That's the tour! Message me here." }
    ];

    var KEY = 'jc_tour_done_v1';
    var idx = 0;
    var active = false;
    var typeTimer = null;
    var autoTimer = null;
    var TYPE_SPEED = 22;
    var HOLD_TIME = 3200;

    function targetFor(i) {
      return document.querySelector(steps[i].sel);
    }

    function renderDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      steps.forEach(function (_, i) {
        var d = document.createElement('span');
        if (i === idx) d.className = 'on';
        dotsEl.appendChild(d);
      });
    }

    function stopTimers() {
      if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    }

    // Game typewriter — Jhon's line appears letter by letter
    function typeLine(full, done) {
      stopTimers();
      var i = 0;
      textEl.textContent = '';
      textEl.classList.remove('done');
      typeTimer = setInterval(function () {
        i += 1;
        textEl.textContent = full.slice(0, i);
        if (i >= full.length) {
          clearInterval(typeTimer);
          typeTimer = null;
          textEl.classList.add('done');
          if (done) done();
        }
      }, TYPE_SPEED);
    }

    function scheduleAuto() {
      if (autoTimer) clearTimeout(autoTimer);
      autoTimer = setTimeout(function () {
        if (!active) return;
        if (idx >= steps.length - 1) finish();
        else show(idx + 1);
      }, HOLD_TIME);
    }

    var gen = 0;
    var CURSOR_TRAVEL = 850;

    function markSeen() {
      try { localStorage.setItem(KEY, '1'); } catch (err) {}
    }

    function stopTypeOnly() {
      if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
    }

    // Bubble pops next to where the cursor points (never off-screen)
    function placeBubble(cx, cy) {
      var w = 250, h = card.offsetHeight || 200;
      var left = cx + 24;
      if (left + w > window.innerWidth - 12) left = cx - w - 20;
      if (left < 8) left = 8;
      var top = cy + 20;
      if (top + h > window.innerHeight - 12) top = cy - h - 20;
      if (top < 76) top = 76;
      card.style.left = left + 'px';
      card.style.top = top + 'px';
    }

    function show(i) {
      stopTimers();
      var myGen = ++gen;
      idx = Math.max(0, Math.min(i, steps.length - 1));
      var el = targetFor(idx);
      if (!el) {
        if (idx < steps.length - 1) show(idx + 1);
        return;
      }
      // 1. Hide bubble while the white cursor travels on its own
      card.classList.remove('show-bubble');
      document.querySelectorAll('.tour-target').forEach(function (n) { n.classList.remove('tour-target'); });
      el.classList.add('tour-target');
      el.classList.add('show');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      stepEl.textContent = 'Scene ' + (idx + 1) + ' / ' + steps.length;
      if (titleEl) titleEl.textContent = steps[idx].title;
      btnBack.style.display = idx === 0 ? 'none' : '';
      btnNext.innerHTML = idx === steps.length - 1 ? 'Finish ▶' : 'Next ▶';
      renderDots();
      setTimeout(function () {
        if (!active || myGen !== gen) return;
        var rect = el.getBoundingClientRect();
        var pad = 12;
        spotlight.style.left = (rect.left - pad) + 'px';
        spotlight.style.top = (rect.top - pad) + 'px';
        spotlight.style.width = (rect.width + pad * 2) + 'px';
        spotlight.style.height = (rect.height + pad * 2) + 'px';
        // 2. Cursor flies to point at the section
        var cx = Math.min(Math.max(rect.left + rect.width * 0.5, 30), window.innerWidth - 30);
        var cy = Math.min(Math.max(rect.top + 26, 90), window.innerHeight - 40);
        cursor.style.left = (cx - 21) + 'px';
        cursor.style.top = (cy - 21) + 'px';
        setTimeout(function () {
          if (!active || myGen !== gen) return;
          // 3. Click pulse, THEN the small message appears
          cursor.classList.remove('clicking');
          void cursor.offsetWidth;
          cursor.classList.add('clicking');
          placeBubble(cx, cy);
          card.classList.add('show-bubble');
          typeLine(steps[idx].text, scheduleAuto);
        }, CURSOR_TRAVEL);
      }, 600);
    }

    overlay.style.position = 'fixed';
    [spotlight, cursor, card].forEach(function (n) { n.style.position = 'fixed'; });
    // Bubble is positioned by JS next to where the cursor points

    function start(isAuto) {
      active = true;
      if (isAuto) markSeen(); // played once — never auto-repeat, not annoying
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      if (navMenu) { navMenu.classList.remove('active'); }
      // park cursor bottom-left before it flies to scene 1
      cursor.style.left = '24px';
      cursor.style.top = (window.innerHeight - 70) + 'px';
      show(0);
    }
    function finish() {
      gen++;
      stopTimers();
      active = false;
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      card.classList.remove('show-bubble');
      document.querySelectorAll('.tour-target').forEach(function (n) { n.classList.remove('tour-target'); });
      markSeen();
    }

    // Clicking the bubble completes the line instantly (game-style)
    card.addEventListener('click', function (e) {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('label')) return;
      if (typeTimer) {
        // finish typing now, then hold before auto-advance
        var full = steps[idx].text;
        stopTypeOnly();
        if (autoTimer) clearTimeout(autoTimer);
        textEl.textContent = full;
        textEl.classList.add('done');
        scheduleAuto();
      } else {
        if (idx >= steps.length - 1) finish();
        else show(idx + 1);
      }
    });

    if (btnNext) btnNext.addEventListener('click', function (e) {
      e.stopPropagation();
      if (idx >= steps.length - 1) finish();
      else show(idx + 1);
    });
    if (btnBack) btnBack.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    if (btnSkip) btnSkip.addEventListener('click', function (e) { e.stopPropagation(); finish(); });
    document.addEventListener('keydown', function (e) {
      if (!active) return;
      if (e.key === 'Escape') finish();
      else if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (idx >= steps.length - 1) finish();
        else show(idx + 1);
      }
      else if (e.key === 'ArrowLeft') show(idx - 1);
    });
    window.addEventListener('resize', function () { if (active) show(idx); });
    if (tourBtn) tourBtn.addEventListener('click', function () {
      start(false); // manual replay via button only — never automatic again
    });

    // Auto-play exactly once per visitor (first site open only)
    var forceTour = /[?&]tour=1/.test(window.location.search);
    var seen = false;
    try { seen = !!localStorage.getItem(KEY); } catch (err) {}
    if (forceTour) {
      setTimeout(function () { start(false); }, 900);
    } else if (!seen) {
      setTimeout(function () { start(true); }, 900);
    }
    void dontShow;
  })();

  // Footer year + back to top
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  var toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
