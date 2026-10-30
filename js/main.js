/* ==========================================================
   SMART GHAR — Global site behaviours (nav, search, scroll FX)
   ========================================================== */
(function (window, document) {
  'use strict';
  var SG = window.SG;
  var U = SG.utils;
  var SITE = SG.site;

  /* ---------------- Mobile menu ---------------- */
  function initMobileMenu() {
    var menu = document.querySelector('.mobile-menu');
    var burger = document.querySelector('.burger');
    if (!menu || !burger) return;

    function close() {
      menu.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    function toggle() {
      var open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', toggle);
    menu.querySelectorAll('[data-menu-close], a').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---------------- Search overlay ---------------- */
  function initSearch() {
    var overlay = document.querySelector('.search-overlay');
    if (!overlay) return;
    var input = overlay.querySelector('input[type="search"], input[type="text"]');
    var results = overlay.querySelector('.search-results');
    var cache = null;

    function open() {
      overlay.classList.add('is-open');
      setTimeout(function () { input.focus(); }, 80);
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      if (results) results.innerHTML = '';
      input.value = '';
    }
    document.querySelectorAll('[data-open-search]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('[data-search-close]')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); }
    });

    var run = U.debounce(async function () {
      var q = input.value.trim();
      if (!q || q.length < 2) { results.innerHTML = ''; return; }
      results.innerHTML = '<div style="padding:14px;text-align:center"><span class="spinner spinner--green"></span></div>';
      try {
        if (!cache && SG.sb) {
          var res = await SG.sb.from('products').select('id,title,sale_price,image_url').eq('is_active', true).limit(200);
          cache = res.data || [];
        }
        var list = (cache || []).filter(function (p) {
          return p.title.toLowerCase().indexOf(q.toLowerCase()) !== -1;
        }).slice(0, 6);
        if (!list.length) {
          results.innerHTML = '<p style="padding:14px;color:var(--muted);font-size:.86rem">No products matched “' + U.esc(q) + '”.</p>';
          return;
        }
        results.innerHTML = list.map(function (p) {
          return '<a href="product-detail.html?id=' + encodeURIComponent(p.id) + '">' +
            '<img src="' + U.esc(U.safeUrl(p.image_url)) + '" alt="">' +
            '<span><b>' + U.esc(p.title) + '</b><small>' + U.money(p.sale_price) + '</small></span></a>';
        }).join('') +
        '<a href="shop.html?q=' + encodeURIComponent(q) + '" style="justify-content:center;color:var(--green-700);font-weight:600;font-size:.84rem">See all results <i class="fa-solid fa-arrow-right" style="margin-left:6px"></i></a>';
      } catch (err) {
        results.innerHTML = '<p style="padding:14px;color:var(--muted)">Search is unavailable right now.</p>';
      }
    }, 220);

    input.addEventListener('input', run);
    overlay.querySelector('form') && overlay.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value.trim()) window.location.href = 'shop.html?q=' + encodeURIComponent(input.value.trim());
    });
  }

  /* ---------------- Header / scroll FX ---------------- */
  function initScrollFx() {
    var header = document.querySelector('.header');
    var toTop = document.querySelector('.to-top');
    var bar = document.querySelector('.scroll-progress');

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (header) header.classList.toggle('is-stuck', y > 20);
      if (toTop) toTop.classList.toggle('is-visible', y > 400);
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toTop) toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Announcement ---------------- */
  function initAnnounce() {
    var bar = document.querySelector('.announce');
    if (!bar) return;
    var close = bar.querySelector('.announce__close');
    try {
      if (localStorage.getItem('sg_announce_closed') === '1' && window.innerWidth < 768) bar.classList.add('is-hidden');
    } catch (e) {}
    if (close) close.addEventListener('click', function () {
      bar.classList.add('is-hidden');
      try { localStorage.setItem('sg_announce_closed', '1'); } catch (e) {}
    });
  }

  /* ---------------- Active nav link ---------------- */
  function initActiveNav() {
    var file = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a, .bottom-nav a, .mobile-menu__links a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('?')[0];
      if (href === file || (file === '' && href === 'index.html')) a.classList.add('is-active');
    });
  }

  /* ---------------- Settings from Supabase ---------------- */
  async function loadSettings() {
    if (!SG.sb) return;
    try {
      var res = await SG.sb.from('settings').select('*').limit(1).maybeSingle();
      var s = res.data;
      if (!s) return;
      if (s.whatsapp_number) {
        SITE.whatsapp = String(s.whatsapp_number).replace(/[^0-9]/g, '');
        document.querySelectorAll('[data-wa-link]').forEach(function (a) {
          var text = a.dataset.waText || 'Hi Smart Ghar! I need help with my order.';
          a.href = U.waLink(text);
          a.target = '_blank';
          a.rel = 'noopener';
        });
      }
      if (s.free_shipping_threshold) SITE.freeShipping = Number(s.free_shipping_threshold);
      if (s.shipping_fee) SITE.shippingFee = Number(s.shipping_fee);
      if (s.announcement_text) {
        document.querySelectorAll('[data-announce-text]').forEach(function (el) {
          el.textContent = s.announcement_text;
        });
      }
      document.querySelectorAll('[data-wa-display]').forEach(function (el) {
        el.textContent = s.whatsapp_number ? '+' + String(s.whatsapp_number).replace(/^(\d{2})(\d{3})(\d{7})$/, '$1 $2 $3') : SITE.whatsappDisplay;
      });
      document.querySelectorAll('[data-store-email]').forEach(function (el) { if (s.support_email) el.textContent = s.support_email; });
    } catch (err) {
      /* settings are non-critical */
    }
  }

  /* ---------------- Newsletter ---------------- */
  function initNewsletter() {
    document.querySelectorAll('form[data-newsletter]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        if (!input || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) {
          SG.toast('Please enter a valid email address', 'error');
          return;
        }
        try {
          var list = JSON.parse(localStorage.getItem('sg_newsletter') || '[]');
          if (list.indexOf(input.value.trim()) === -1) list.push(input.value.trim());
          localStorage.setItem('sg_newsletter', JSON.stringify(list));
        } catch (err) {}
        form.reset();
        SG.toast('Subscribed! Watch your inbox for offers.', 'success');
      });
    });
  }

  /* ---------------- Coupon copy ---------------- */
  function initCouponCopy() {
    document.querySelectorAll('[data-coupon]').forEach(function (el) {
      el.addEventListener('click', function () {
        var code = el.dataset.coupon;
        var done = function () { SG.toast('Coupon ' + code + ' copied!', 'success'); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(done).catch(function () { SG.toast('Code: ' + code, 'info'); });
        } else {
          SG.toast('Code: ' + code, 'info');
        }
      });
    });
  }

  /* ---------------- Countdown ---------------- */
  function initCountdown() {
    var wrap = document.querySelector('[data-countdown]');
    if (!wrap) return;
    var end = new Date();
    end.setHours(23, 59, 59, 999);
    function tick() {
      var diff = Math.max(0, end - new Date());
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      var pad = function (n) { return String(n).padStart(2, '0'); };
      var hEl = wrap.querySelector('[data-cd="h"]');
      var mEl = wrap.querySelector('[data-cd="m"]');
      var sEl = wrap.querySelector('[data-cd="s"]');
      if (hEl) hEl.textContent = pad(h);
      if (mEl) mEl.textContent = pad(m);
      if (sEl) sEl.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- WhatsApp links ---------------- */
  function initWaLinks() {
    document.querySelectorAll('[data-wa-link]').forEach(function (a) {
      var text = a.dataset.waText || 'Hi Smart Ghar! I need help with my order.';
      a.href = U.waLink(text);
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------------- Footer year ---------------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------------- AOS ---------------- */
  function initAos() {
    if (!window.AOS) return;
    window.AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    initMobileMenu();
    initSearch();
    initScrollFx();
    initAnnounce();
    initActiveNav();
    initNewsletter();
    initCouponCopy();
    initCountdown();
    initWaLinks();
    initYear();
    initAos();
    loadSettings();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
