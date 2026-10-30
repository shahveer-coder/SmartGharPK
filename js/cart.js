/* ==========================================================
   SMART GHAR — Cart + wishlist (localStorage)
   ========================================================== */
(function (window, document) {
  'use strict';
  var U = window.SG.utils;
  var SITE = window.SG.site;
  var CART_KEY = 'sg_cart_v1';
  var WISH_KEY = 'sg_wishlist_v1';

  /* ---------------- State ---------------- */
  var items = [];
  var wish = [];

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function load() {
    items = read(CART_KEY, []).filter(function (i) {
      return i && i.id && Number(i.price) >= 0 && Number(i.qty) > 0;
    });
    wish = read(WISH_KEY, []);
  }

  function persist() {
    write(CART_KEY, items);
    document.dispatchEvent(new CustomEvent('sg:cart-changed', { detail: { items: items } }));
  }

  /* ---------------- Public cart API ---------------- */
  var Cart = {
    all: function () { return items.slice(); },
    count: function () {
      return items.reduce(function (sum, i) { return sum + Number(i.qty); }, 0);
    },
    subtotal: function () {
      return items.reduce(function (sum, i) { return sum + Number(i.price) * Number(i.qty); }, 0);
    },
    shipping: function () {
      var sub = Cart.subtotal();
      if (!items.length) return 0;
      return sub >= SITE.freeShipping ? 0 : SITE.shippingFee;
    },
    total: function () { return Cart.subtotal() + Cart.shipping(); },

    add: function (product, qty, opts) {
      if (!product || !product.id) return;
      var q = Math.max(1, Number(qty) || 1);
      var existing = items.find(function (i) { return i.id === product.id; });
      var stock = Number(product.stock_quantity);
      var max = isNaN(stock) ? 999 : Math.max(1, stock);

      if (existing) {
        existing.qty = Math.min(max, Number(existing.qty) + q);
      } else {
        items.push({
          id: product.id,
          title: product.title,
          price: Number(product.sale_price != null ? product.sale_price : product.original_price),
          original_price: Number(product.original_price),
          image: product.image_url,
          qty: Math.min(max, q),
          stock: isNaN(stock) ? null : stock
        });
      }
      persist();
      renderBadge(true);
      renderDrawer();
      if (!opts || opts.toast !== false) {
        window.SG.toast(product.title + ' added to cart', 'success');
      }
      if (!opts || opts.open !== false) Drawer.open();
    },

    remove: function (id) {
      items = items.filter(function (i) { return i.id !== id; });
      persist(); renderBadge(); renderDrawer();
    },

    setQty: function (id, qty) {
      var it = items.find(function (i) { return i.id === id; });
      if (!it) return;
      var q = Number(qty);
      if (q <= 0) return Cart.remove(id);
      it.qty = Math.min(it.stock || 999, q);
      persist(); renderBadge(); renderDrawer();
    },

    clear: function () { items = []; persist(); renderBadge(); renderDrawer(); },

    /* -------- wishlist -------- */
    isWished: function (id) { return wish.indexOf(id) !== -1; },
    toggleWish: function (id, title) {
      var idx = wish.indexOf(id);
      if (idx === -1) { wish.push(id); window.SG.toast((title || 'Product') + ' saved to wishlist', 'success'); }
      else { wish.splice(idx, 1); window.SG.toast('Removed from wishlist', 'info'); }
      write(WISH_KEY, wish);
      document.dispatchEvent(new CustomEvent('sg:wish-changed', { detail: { id: id } }));
      return idx === -1;
    },
    wishlist: function () { return wish.slice(); }
  };

  /* ---------------- Badge ---------------- */
  function renderBadge(animate) {
    var count = Cart.count();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.classList.toggle('is-empty', count === 0);
      if (animate && count > 0) {
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
      }
    });
    if (animate) {
      document.querySelectorAll('[data-cart-icon]').forEach(function (icon) {
        icon.classList.remove('is-bouncing');
        void icon.offsetWidth;
        icon.classList.add('is-bouncing');
      });
    }
  }

  /* ---------------- Drawer ---------------- */
  var drawerEl = null;

  function buildDrawer() {
    drawerEl = document.createElement('div');
    drawerEl.className = 'cart-drawer';
    drawerEl.setAttribute('aria-hidden', 'true');
    drawerEl.innerHTML =
      '<div class="cart-drawer__backdrop" data-cart-close></div>' +
      '<aside class="cart-drawer__panel" role="dialog" aria-modal="true" aria-label="Shopping cart">' +
        '<div class="cart-drawer__head">' +
          '<h3><i class="fa-solid fa-bag-shopping"></i> Your Cart <span class="muted" data-cart-title-count></span></h3>' +
          '<button class="icon-btn" data-cart-close aria-label="Close cart"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
        '<div class="cart-drawer__body" data-cart-body></div>' +
        '<div class="cart-drawer__foot">' + footerHtml() + '</div>' +
      '</aside>';
    document.body.appendChild(drawerEl);

    drawerEl.addEventListener('click', function (e) {
      if (e.target.closest('[data-cart-close]')) Drawer.close();
    });
    drawerEl.addEventListener('click', onDrawerClick);
    drawerEl.addEventListener('change', onDrawerChange);
  }

  function footerHtml() {
    var sub = Cart.subtotal();
    var ship = Cart.shipping();
    var remaining = Math.max(0, SITE.freeShipping - sub);
    return (
      '<div class="cart-summary">' +
        '<div><span>Subtotal</span><b>' + U.money(sub) + '</b></div>' +
        '<div><span>Shipping</span><b>' + (ship === 0 ? (sub ? 'FREE' : U.money(0)) : U.money(ship)) + '</b></div>' +
        '<div class="total"><span>Total</span><span>' + U.money(sub + ship) + '</span></div>' +
      '</div>' +
      (sub > 0 && remaining > 0
        ? '<div class="free-ship-note"><i class="fa-solid fa-truck-fast"></i> Add ' + U.money(remaining) + ' more for FREE delivery</div>'
        : (sub > 0 ? '<div class="free-ship-note"><i class="fa-solid fa-circle-check"></i> You unlocked FREE delivery!</div>' : '')) +
      '<a class="btn btn--primary btn--block" href="checkout.html" style="margin-top:12px">Proceed to Checkout <i class="fa-solid fa-arrow-right"></i></a>' +
      '<button class="btn btn--outline btn--block btn--sm" data-cart-close style="margin-top:8px">Continue Shopping</button>'
    );
  }

  function renderDrawer() {
    if (!drawerEl) return;
    var body = drawerEl.querySelector('[data-cart-body]');
    var count = Cart.count();
    drawerEl.querySelector('[data-cart-title-count]').textContent = count ? '(' + count + ')' : '';

    if (!items.length) {
      body.innerHTML =
        '<div class="cart-empty">' +
          '<i class="fa-solid fa-bag-shopping"></i>' +
          '<h4 style="font-family:var(--f-body);color:var(--forest);margin-bottom:6px">Your cart is empty</h4>' +
          '<p style="font-size:.85rem;margin-bottom:16px">Smart gadgets are waiting for you.</p>' +
          '<a href="shop.html" class="btn btn--primary btn--sm">Start Shopping</a>' +
        '</div>';
    } else {
      body.innerHTML = items.map(function (i) {
        return (
          '<div class="cart-line" data-id="' + U.esc(i.id) + '">' +
            '<a href="product-detail.html?id=' + encodeURIComponent(i.id) + '">' +
              '<img src="' + U.esc(U.safeUrl(i.image)) + '" alt="' + U.esc(i.title) + '" loading="lazy">' +
            '</a>' +
            '<div>' +
              '<h4><a href="product-detail.html?id=' + encodeURIComponent(i.id) + '">' + U.esc(i.title) + '</a></h4>' +
              '<span class="price">' + U.money(i.price) + '</span>' +
              '<div class="qty" data-qty-wrap>' +
                '<button data-dec aria-label="Decrease quantity"><i class="fa-solid fa-minus"></i></button>' +
                '<span>' + i.qty + '</span>' +
                '<button data-inc aria-label="Increase quantity"><i class="fa-solid fa-plus"></i></button>' +
              '</div>' +
            '</div>' +
            '<div style="text-align:right">' +
              '<b style="font-size:.85rem">' + U.money(Number(i.price) * Number(i.qty)) + '</b>' +
              '<div><button class="cart-line__remove" data-remove aria-label="Remove item"><i class="fa-regular fa-trash-can"></i> Remove</button></div>' +
            '</div>' +
          '</div>'
        );
      }).join('');
    }
    drawerEl.querySelector('.cart-drawer__foot').innerHTML = footerHtml();
  }

  function onDrawerClick(e) {
    var line = e.target.closest('.cart-line');
    if (!line) return;
    var id = line.dataset.id;
    if (e.target.closest('[data-remove]')) { Cart.remove(id); return; }
    if (e.target.closest('[data-inc]')) {
      var cur = items.find(function (i) { return i.id === id; });
      if (cur) Cart.setQty(id, Number(cur.qty) + 1);
    }
    if (e.target.closest('[data-dec]')) {
      var cur2 = items.find(function (i) { return i.id === id; });
      if (cur2) Cart.setQty(id, Number(cur2.qty) - 1);
    }
  }
  function onDrawerChange() {}

  var Drawer = {
    open: function () {
      if (!drawerEl) buildDrawer();
      renderDrawer();
      drawerEl.classList.add('is-open');
      drawerEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    },
    close: function () {
      if (!drawerEl) return;
      drawerEl.classList.remove('is-open');
      drawerEl.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },
    toggle: function () {
      if (drawerEl && drawerEl.classList.contains('is-open')) Drawer.close();
      else Drawer.open();
    }
  };

  /* ---------------- Init ---------------- */
  function init() {
    load();
    buildDrawer();
    renderBadge();
    renderDrawer();
    // Announce the restored cart so views rendered during parsing (e.g. the
    // checkout summary) can refresh with the real localStorage contents.
    document.dispatchEvent(new CustomEvent('sg:cart-changed', { detail: { items: items } }));

    // global delegated add-to-cart
    document.addEventListener('click', function (e) {
      var addBtn = e.target.closest('[data-add-to-cart]');
      if (addBtn) {
        e.preventDefault();
        var data = window.__sgProducts && window.__sgProducts[addBtn.dataset.addToCart];
        if (data) Cart.add(data, Number(addBtn.dataset.qty) || 1);
        return;
      }
      var wishBtn = e.target.closest('[data-wish]');
      if (wishBtn) {
        e.preventDefault();
        var on = Cart.toggleWish(wishBtn.dataset.wish, wishBtn.dataset.wishTitle);
        wishBtn.classList.toggle('is-active', on);
        var icon = wishBtn.querySelector('i');
        if (icon) icon.className = on ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        return;
      }
      var openCart = e.target.closest('[data-open-cart]');
      if (openCart) { e.preventDefault(); Drawer.open(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') Drawer.close();
    });

    document.addEventListener('sg:wish-changed', function (e) {
      document.querySelectorAll('[data-wish="' + e.detail.id + '"]').forEach(function (b) {
        var on = Cart.isWished(e.detail.id);
        b.classList.toggle('is-active', on);
        var icon = b.querySelector('i');
        if (icon) icon.className = on ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  Cart.openDrawer = Drawer.open;
  Cart.closeDrawer = Drawer.close;
  Cart.renderBadge = renderBadge;
  window.SG.cart = Cart;
})(window, document);
