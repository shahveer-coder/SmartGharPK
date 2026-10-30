/* ==========================================================
   SMART GHAR — Checkout
   ========================================================== */
(function (window, document) {
  'use strict';
  var SG = window.SG;
  var U = SG.utils;
  var sb = SG.sb;
  var coupon = null;

  var form = document.querySelector('[data-checkout-form]');
  if (!form) return;

  /* ---------------- Summary ---------------- */
  function renderSummary() {
    var items = SG.cart.all();
    var wrap = document.querySelector('[data-summary-items]');
    var sub = SG.cart.subtotal();
    var ship = SG.cart.shipping();
    var discount = coupon ? Number(coupon.discount_amount || 0) : 0;
    if (coupon && coupon.free_shipping) ship = 0;
    var total = Math.max(0, sub + ship - discount);

    if (!items.length) {
      wrap.innerHTML = '<div class="cart-empty" style="padding:24px 6px">' +
        '<i class="fa-solid fa-bag-shopping"></i>' +
        '<p style="font-size:.86rem;margin-bottom:14px">Your cart is empty.</p>' +
        '<a class="btn btn--primary btn--sm" href="shop.html">Browse Products</a></div>';
      document.querySelector('[data-place-order]').disabled = true;
    } else {
      wrap.innerHTML = items.map(function (i) {
        return '<div class="summary-line">' +
          '<img src="' + U.esc(U.safeUrl(i.image)) + '" alt="' + U.esc(i.title) + '">' +
          '<div><h4>' + U.esc(i.title) + '</h4><small>' + i.qty + ' × ' + U.money(i.price) + '</small></div>' +
          '<b>' + U.money(i.price * i.qty) + '</b>' +
          '</div>';
      }).join('');
      document.querySelector('[data-place-order]').disabled = false;
    }

    document.querySelector('[data-sum-subtotal]').textContent = U.money(sub);
    document.querySelector('[data-sum-shipping]').textContent = ship === 0 ? 'FREE' : U.money(ship);
    document.querySelector('[data-sum-total]').textContent = U.money(total);

    var dRow = document.querySelector('[data-sum-discount-row]');
    if (coupon && discount > 0) {
      dRow.style.display = 'flex';
      document.querySelector('[data-sum-discount]').textContent = '-' + U.money(discount);
      document.querySelector('[data-sum-coupon]').textContent = '(' + coupon.code + ')';
    } else {
      dRow.style.display = 'none';
    }
    return { sub: sub, ship: ship, discount: discount, total: total };
  }

  /* ---------------- Promo ---------------- */
  var promoForm = document.querySelector('[data-promo-form]');
  var promoMsg = document.querySelector('[data-promo-msg]');
  if (promoForm) {
    promoForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var code = document.querySelector('[data-promo-input]').value.trim().toUpperCase();
      if (!code) return;
      if (!SG.cart.all().length) { SG.toast('Add products to your cart first', 'error'); return; }
      promoMsg.style.display = 'block';
      promoMsg.textContent = 'Checking…';
      try {
        var res = await sb.rpc('validate_coupon', { p_code: code, p_subtotal: SG.cart.subtotal() });
        var data = res.data;
        if (res.error) throw res.error;
        if (!data || !data.valid) {
          coupon = null;
          promoMsg.style.color = '#dc2626';
          promoMsg.textContent = (data && data.message) || 'Invalid coupon code';
          renderSummary();
          SG.toast((data && data.message) || 'Invalid coupon', 'error');
          return;
        }
        coupon = data;
        promoMsg.style.color = 'var(--green-700)';
        promoMsg.textContent = data.discount_amount > 0
          ? '🎉 You saved ' + U.money(data.discount_amount) + ' with ' + data.code
          : '🎉 Free shipping applied with ' + data.code;
        renderSummary();
        SG.toast('Coupon applied!', 'success');
      } catch (err) {
        promoMsg.style.color = '#dc2626';
        promoMsg.textContent = 'Could not validate coupon. Try again.';
        coupon = null;
        renderSummary();
      }
    });
  }

  /* ---------------- Payment method UI ---------------- */
  document.querySelectorAll('.pay-option input[name="payment_method"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      document.querySelectorAll('.pay-option').forEach(function (p) { p.classList.remove('is-selected'); });
      radio.closest('.pay-option').classList.add('is-selected');
      document.querySelectorAll('[data-pay-detail]').forEach(function (d) {
        d.classList.toggle('is-open', d.dataset.payDetail === radio.value);
      });
    });
  });

  /* ---------------- Settings (bank / easypaisa info) ---------------- */
  (async function loadPaySettings() {
    if (!sb) return;
    try {
      var res = await sb.from('settings').select('bank_details,easypaisa').limit(1).maybeSingle();
      var s = res.data;
      if (!s) return;
      var bank = s.bank_details || {};
      var ep = s.easypaisa || {};
      var set = function (sel, val) {
        var el = document.querySelector(sel);
        if (el && val) el.textContent = val;
      };
      set('[data-bank-name]', bank.bank ? bank.bank : null);
      set('[data-bank-title]', bank.title);
      set('[data-bank-account]', bank.account);
      set('[data-easypaisa]', ep.easypaisa);
      set('[data-jazzcash]', ep.jazzcash);
      set('[data-easypaisa-title]', ep.title);
    } catch (e) {}
  })();

  /* ---------------- Validation ---------------- */
  function markError(field, isError) {
    var wrap = field.closest('.field');
    if (wrap) wrap.classList.toggle('has-error', isError);
  }

  function validate() {
    var ok = true;
    var name = form.customer_name;
    var phone = form.phone;
    var email = form.email;
    var address = form.address;
    var city = form.city;
    var province = form.province;

    var nameOk = name.value.trim().length >= 3;
    markError(name, !nameOk); if (!nameOk) ok = false;

    var digits = phone.value.replace(/[^0-9]/g, '');
    var phoneOk = /^(92|0)?3\d{9}$/.test(digits) || /^0?3\d{2}[- ]?\d{7}$/.test(phone.value.trim());
    markError(phone, !phoneOk); if (!phoneOk) ok = false;

    var emailOk = !email.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    markError(email, !emailOk); if (!emailOk) ok = false;

    var addrOk = address.value.trim().length >= 8;
    markError(address, !addrOk); if (!addrOk) ok = false;

    markError(city, !city.value); if (!city.value) ok = false;
    markError(province, !province.value); if (!province.value) ok = false;

    if (!ok) {
      var first = form.querySelector('.field.has-error input, .field.has-error select');
      if (first) {
        first.focus();
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      SG.toast('Please check the highlighted fields', 'error');
    }
    return ok;
  }

  /* clear error on input */
  form.querySelectorAll('input, select').forEach(function (el) {
    el.addEventListener('input', function () { markError(el, false); });
    el.addEventListener('change', function () { markError(el, false); });
  });

  /* ---------------- Submit ---------------- */
  var btn = document.querySelector('[data-place-order]');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!SG.cart.all().length) { SG.toast('Your cart is empty', 'error'); return; }
    if (!validate()) return;

    var summary = renderSummary();
    var items = SG.cart.all().map(function (i) {
      return { product_id: i.id, name: i.title, image: i.image, price: Number(i.price), quantity: Number(i.qty) };
    });

    var payload = {
      customer_name: form.customer_name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      city: form.city.value,
      province: form.province.value,
      postal_code: form.postal_code.value.trim(),
      order_notes: form.order_notes.value.trim(),
      payment_method: (form.querySelector('input[name="payment_method"]:checked') || {}).value || 'COD',
      order_items: items,
      subtotal: summary.sub,
      shipping_fee: summary.ship,
      discount_amount: summary.discount,
      coupon_code: coupon ? coupon.code : null,
      total_amount: summary.total
    };

    btn.disabled = true;
    var original = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Placing your order…';

    try {
      var res = await sb.rpc('place_order', { payload: payload });
      if (res.error) throw res.error;
      var order = res.data;

      var waText = 'Hi Smart Ghar! I just placed an order:\n\n' +
        '🆔 Order ID: ' + order.order_number + '\n' +
        '👤 Name: ' + payload.customer_name + '\n' +
        '📱 Phone: ' + payload.phone + '\n' +
        '📍 Address: ' + payload.address + ', ' + payload.city + '\n' +
        '💰 Total: ' + U.money(order.total_amount) + '\n\n' +
        'Please confirm my order.';

      document.querySelector('[data-order-number]').textContent = order.order_number;
      var waBtn = document.querySelector('[data-success-wa]');
      waBtn.href = U.waLink(waText);
      document.getElementById('orderSuccess').classList.add('is-open');
      document.body.style.overflow = 'hidden';

      SG.cart.clear();
      form.reset();
      coupon = null;
      renderSummary();
      SG.toast('Order ' + order.order_number + ' placed!', 'success', 5000);
    } catch (err) {
      console.error(err);
      var msg = (err && err.message) ? err.message : 'Something went wrong. Please try again or order on WhatsApp.';
      if (/cart is empty/i.test(msg)) msg = 'Your cart is empty.';
      SG.toast(msg, 'error', 5000);
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });

  document.querySelectorAll('[data-success-close]').forEach(function (el) {
    el.addEventListener('click', function () {
      document.getElementById('orderSuccess').classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('sg:cart-changed', renderSummary);
  renderSummary();
})(window, document);
