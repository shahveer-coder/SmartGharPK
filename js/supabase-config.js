/* ==========================================================
   SMART GHAR — Supabase connection + shared helpers
   Loaded on every page (defer).
   ========================================================== */
(function (window) {
  'use strict';

  /* ---------- Site configuration ---------- */
  var SITE = {
    name: 'Smart Ghar',
    whatsapp: '923182158561',
    whatsappDisplay: '+92 318 2158561',
    email: 'info@smartghar.pk',
    address: 'Karachi, Pakistan',
    freeShipping: 3000,
    shippingFee: 200,
    currency: 'PKR',
    instagram: 'https://instagram.com/smartghar.pk',
    facebook: 'https://facebook.com/smartghar.pk',
    tiktok: 'https://tiktok.com/@smartghar.pk',
    youtube: 'https://youtube.com/@smartghar.pk'
  };

  var SUPABASE_URL = 'https://gkyqzyehaszjqeiggflu.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreXF6eWVoYXN6anFlaWdnZmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTg0NTIsImV4cCI6MjEwODkzNDQ1Mn0._5-4fdnQp5wJ2CAVu1p7EzIpgdRu_LlWu8NakUH4ijw';

  var sb = null;
  try {
    if (window.supabase && window.supabase.createClient) {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'sg-auth' }
      });
    }
  } catch (err) {
    console.error('[SmartGhar] Supabase init failed', err);
  }

  /* ---------- Utilities ---------- */
  var U = {
    /** PKR formatting: 12999 -> "PKR 12,999" */
    money: function (n) {
      var v = Number(n) || 0;
      return 'PKR ' + v.toLocaleString('en-PK', { maximumFractionDigits: 0 });
    },
    /** 12999 -> "12,999" */
    num: function (n) {
      return (Number(n) || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 });
    },
    /** Escape user/database content before inserting into HTML (XSS protection) */
    esc: function (str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
    /** Only allow safe URLs for img src */
    safeUrl: function (url, fallback) {
      var f = fallback || '/images/products/chopper.png';
      if (!url) return f;
      var s = String(url).trim();
      if (/^(https?:\/\/|\/)/i.test(s)) return s;
      return f;
    },
    qs: function (key) {
      return new URLSearchParams(window.location.search).get(key);
    },
    /** 03xx-xxxxxxx / +923xxxxxxxxx -> normalized digits for wa.me */
    phoneDigits: function (phone) {
      var d = String(phone || '').replace(/[^0-9]/g, '');
      if (d.indexOf('92') === 0) return d;
      if (d.charAt(0) === '0') return '92' + d.substring(1);
      return d;
    },
    waLink: function (text, phone) {
      return 'https://wa.me/' + (phone || SITE.whatsapp) + '?text=' + encodeURIComponent(text || '');
    },
    debounce: function (fn, wait) {
      var t;
      return function () {
        var ctx = this, args = arguments;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(ctx, args); }, wait || 250);
      };
    },
    stars: function (rating) {
      var r = Number(rating) || 0;
      var full = Math.floor(r);
      var half = r - full >= 0.5;
      var out = '';
      for (var i = 0; i < full; i++) out += '★';
      if (half) out += '★';
      for (var j = full + (half ? 1 : 0); j < 5; j++) out += '☆';
      return out;
    },
    date: function (iso, opts) {
      if (!iso) return '—';
      try {
        return new Date(iso).toLocaleDateString('en-GB', opts || { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) { return '—'; }
    },
    timeAgo: function (iso) {
      var d = new Date(iso);
      var diff = (Date.now() - d.getTime()) / 1000;
      if (diff < 60) return 'just now';
      if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
      if (diff < 86400) return Math.floor(diff / 3600) + ' hr ago';
      if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
      return U.date(iso);
    }
  };

  /* ---------- Toasts ---------- */
  var toastWrap = null;
  function ensureToastWrap() {
    if (!toastWrap) {
      toastWrap = document.createElement('div');
      toastWrap.className = 'toast-wrap';
      toastWrap.setAttribute('role', 'status');
      toastWrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastWrap);
    }
    return toastWrap;
  }
  function toast(message, type, ms) {
    var wrap = ensureToastWrap();
    var el = document.createElement('div');
    var icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
    var t = type || 'success';
    el.className = 'toast toast--' + t;
    el.innerHTML = '<i class="fa-solid ' + (icons[t] || icons.info) + '"></i><span>' + U.esc(message) + '</span>';
    wrap.appendChild(el);
    var timer = setTimeout(close, ms || 3200);
    function close() {
      clearTimeout(timer);
      el.classList.add('is-leaving');
      setTimeout(function () { el.remove(); }, 320);
    }
    el.addEventListener('click', close);
  }

  /* ---------- Button ripple ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn, .pc-add, .cat-card__link');
    if (!btn) return;
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var span = document.createElement('span');
    span.className = 'ripple-effect';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (e.clientX - rect.left - size / 2) + 'px';
    span.style.top = (e.clientY - rect.top - size / 2) + 'px';
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    btn.appendChild(span);
    setTimeout(function () { span.remove(); }, 680);
  }, { passive: true });

  /* ---------- Image fallback ---------- */
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && !t.dataset.fallbackDone) {
      t.dataset.fallbackDone = '1';
      t.src = '/images/products/chopper.png';
    }
  }, true);

  /* ---------- Page loader ---------- */
  function hidePageLoader() {
    var l = document.querySelector('.page-loader');
    if (l) setTimeout(function () { l.classList.add('is-done'); }, 120);
  }
  if (document.readyState === 'complete') hidePageLoader();
  else window.addEventListener('load', hidePageLoader);
  setTimeout(hidePageLoader, 2200);

  /* ---------- Expose ---------- */
  window.SG = {
    site: SITE,
    sb: sb,
    utils: U,
    toast: toast
  };
})(window);
