/* ==========================================================
   SMART GHAR — Order tracking
   ========================================================== */
(function (window, document) {
  'use strict';
  var SG = window.SG;
  var U = SG.utils;
  var sb = SG.sb;

  var form = document.querySelector('[data-track-form]');
  if (!form) return;
  var input = document.querySelector('[data-track-input]');
  var result = document.querySelector('[data-track-result]');

  var STEPS = [
    { key: 'pending', label: 'Order Placed', desc: 'We have received your order' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Our team confirmed your order' },
    { key: 'packed', label: 'Packed', desc: 'Your parcel is packed and ready' },
    { key: 'shipped', label: 'Shipped', desc: 'Out for delivery to your city' },
    { key: 'delivered', label: 'Delivered', desc: 'Enjoy your Smart Ghar products' }
  ];

  function statusIndex(status) {
    var s = String(status || 'pending').toLowerCase();
    var i = STEPS.findIndex(function (st) { return st.key === s; });
    return i === -1 ? 0 : i;
  }

  function badge(status) {
    var map = {
      pending: ['🟡 Pending', '#fef3c7', '#92400e'],
      confirmed: ['🔵 Confirmed', '#dbeafe', '#1e40af'],
      packed: ['🟣 Packed', '#ede9fe', '#5b21b6'],
      shipped: ['🟠 Shipped', '#ffedd5', '#9a3412'],
      delivered: ['🟢 Delivered', '#dcfce7', '#166534'],
      cancelled: ['🔴 Cancelled', '#fee2e2', '#991b1b']
    };
    var b = map[String(status).toLowerCase()] || map.pending;
    return '<span style="background:' + b[1] + ';color:' + b[2] + ';padding:5px 12px;border-radius:99px;font-size:.74rem;font-weight:700">' + b[0] + '</span>';
  }

  function estimate(order) {
    var base = new Date(order.created_at || Date.now());
    base.setDate(base.getDate() + 4);
    return U.date(base, { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function render(order) {
    var idx = statusIndex(order.status);
    var cancelled = String(order.status).toLowerCase() === 'cancelled';
    var items = Array.isArray(order.order_items) ? order.order_items : [];

    result.innerHTML =
      '<div style="border:1px solid var(--line);border-radius:16px;padding:18px;animation:fadeUp .45s var(--ease) both">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:14px">' +
          '<div><b style="display:block;font-size:1.02rem;color:var(--forest)">' + U.esc(order.order_number) + '</b>' +
          '<small style="color:var(--muted);font-size:.76rem">Placed on ' + U.date(order.created_at) + '</small></div>' + badge(order.status) +
        '</div>' +
        '<div style="display:grid;gap:8px;font-size:.86rem;margin-bottom:16px">' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Customer</span><b>' + U.esc(order.customer_name) + '</b></div>' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Delivering to</span><b>' + U.esc(order.city) + '</b></div>' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Payment</span><b>' + U.esc(order.payment_method) + '</b></div>' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Total</span><b style="color:var(--green-700)">' + U.money(order.total_amount) + '</b></div>' +
          (cancelled ? '' : '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Estimated delivery</span><b>' + estimate(order) + '</b></div>') +
        '</div>' +
        (items.length ?
          '<h4 style="font-family:var(--f-body);font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:10px">Items</h4>' +
          '<div style="display:grid;gap:10px;margin-bottom:18px">' + items.map(function (it) {
            return '<div class="summary-line">' +
              '<img src="' + U.esc(U.safeUrl(it.image)) + '" alt="">' +
              '<div><h4>' + U.esc(it.name) + '</h4><small>Qty: ' + (it.quantity || 1) + '</small></div>' +
              '<b>' + U.money(Number(it.price) * Number(it.quantity || 1)) + '</b></div>';
          }).join('') + '</div>' : '') +
        (cancelled
          ? '<p style="background:#fee2e2;color:#991b1b;border-radius:10px;padding:12px;font-size:.84rem"><i class="fa-solid fa-circle-exclamation"></i> This order was cancelled. Message us on WhatsApp if this looks wrong.</p>'
          : '<div class="steps">' + STEPS.map(function (st, i) {
              var cls = i < idx ? 'done' : (i === idx ? 'done current' : '');
              return '<div class="step-item ' + cls + '">' +
                '<span class="step-dot">' + (i <= idx ? '<i class="fa-solid fa-check"></i>' : (i + 1)) + '</span>' +
                '<div><b>' + st.label + '</b><small>' + st.desc + '</small></div></div>';
            }).join('') + '</div>') +
      '</div>' +
      '<div class="center" style="margin-top:16px">' +
        '<a class="btn btn--wa btn--sm" data-wa-link data-wa-text="Hi Smart Ghar! I have a question about order ' + U.esc(order.order_number) + '."><i class="fa-brands fa-whatsapp"></i> Ask about this order</a>' +
      '</div>';

    var wa = result.querySelector('[data-wa-link]');
    if (wa) {
      wa.href = U.waLink(wa.dataset.waText);
      wa.target = '_blank';
      wa.rel = 'noopener';
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var ref = input.value.trim();
    if (!ref) return;
    result.innerHTML = '<div class="center" style="padding:24px"><span class="spinner spinner--green"></span><p style="font-size:.82rem;color:var(--muted);margin-top:10px">Looking up your order…</p></div>';
    try {
      var res = await sb.rpc('track_order', { p_ref: ref });
      if (res.error) throw res.error;
      if (!res.data) {
        result.innerHTML = '<div class="empty-state" style="padding:24px"><i class="fa-solid fa-box-open"></i>' +
          '<h3 style="font-family:var(--f-body);font-size:1rem;margin-bottom:6px">Order not found</h3>' +
          '<p style="font-size:.84rem">Please check your order ID or the phone number you used at checkout.</p></div>';
        return;
      }
      render(res.data);
    } catch (err) {
      result.innerHTML = '<p style="color:#dc2626;font-size:.86rem">Could not look up this order right now. Please try again or contact us on WhatsApp.</p>';
    }
  });

  /* auto lookup if ?id= or ?phone= provided */
  var preset = U.qs('id') || U.qs('phone');
  if (preset) { input.value = preset; form.dispatchEvent(new Event('submit')); }
})(window, document);
