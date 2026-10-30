/* ==========================================================
   SMART GHAR — Admin panel logic
   ========================================================== */
(function (window, document) {
  'use strict';
  var SG = window.SG;
  var U = SG.utils;
  var sb = SG.sb;

  var state = {
    orders: [],
    products: [],
    customers: [],
    categories: [],
    coupons: [],
    settings: null,
    section: 'dashboard',
    charts: {}
  };

  /* ---------------- Boot guard ---------------- */
  async function boot() {
    if (!sb) { document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif">Supabase failed to load. Check your connection.</p>'; return; }

    var session = await sb.auth.getSession();
    if (!session || !session.data || !session.data.session) {
      window.location.replace('admin-login.html');
      return;
    }
    var user = session.data.session.user;
    document.querySelectorAll('[data-admin-email]').forEach(function (el) { el.textContent = (user.email || 'A').charAt(0).toUpperCase(); });
    document.querySelectorAll('[data-admin-emailtext]').forEach(function (el) { el.textContent = user.email || '—'; });

    bindChrome();
    await loadAll();
    routeFromHash();
    window.addEventListener('hashchange', routeFromHash);
  }

  /* ---------------- Chrome / navigation ---------------- */
  function bindChrome() {
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var sec = a.dataset.nav;
        window.location.hash = sec === 'dashboard' ? '' : sec;
        showSection(sec);
        closeSidebar();
      });
    });
    document.addEventListener('click', function (e) {
      var g = e.target.closest('[data-goto]');
      if (g) { window.location.hash = g.dataset.goto; showSection(g.dataset.goto); }
    });
    document.querySelector('[data-sidebar-open]').addEventListener('click', openSidebar);
    document.querySelectorAll('[data-sidebar-close]').forEach(function (el) { el.addEventListener('click', closeSidebar); });

    document.querySelector('[data-logout]').addEventListener('click', async function (e) {
      e.preventDefault();
      await sb.auth.signOut();
      window.location.href = 'admin-login.html';
    });
    document.querySelector('[data-refresh]').addEventListener('click', function () {
      SG.toast('Refreshing data…', 'info');
      loadAll();
    });

    // modal close handlers
    document.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        el.closest('.admin-modal').classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.admin-modal.is-open').forEach(function (m) { m.classList.remove('is-open'); });
        document.body.style.overflow = '';
      }
    });
  }

  function openSidebar() {
    document.getElementById('adminSidebar').classList.add('is-open');
    document.querySelector('.sidebar__scrim').classList.add('is-open');
  }
  function closeSidebar() {
    document.getElementById('adminSidebar').classList.remove('is-open');
    document.querySelector('.sidebar__scrim').classList.remove('is-open');
  }

  var TITLES = {
    dashboard: ['Dashboard', 'Store overview'],
    orders: ['Orders', 'Manage and fulfil customer orders'],
    products: ['Products', 'Add, edit and manage your catalogue'],
    customers: ['Customers', 'Everyone who ordered from you'],
    categories: ['Categories', 'Organise your store'],
    coupons: ['Coupons', 'Discount codes and offers'],
    analytics: ['Analytics', 'Performance insights'],
    settings: ['Settings', 'Store, shipping, payment and admin']
  };

  function showSection(name) {
    if (!TITLES[name]) name = 'dashboard';
    state.section = name;
    document.querySelectorAll('.admin-section').forEach(function (s) {
      s.classList.toggle('is-active', s.dataset.section === name);
    });
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      a.classList.toggle('is-active', a.dataset.nav === name);
    });
    var t = TITLES[name];
    document.querySelector('[data-page-title]').textContent = t[0];
    document.querySelector('[data-page-sub]').textContent = t[1];
    if (name === 'analytics') renderAnalytics();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function routeFromHash() {
    var h = (window.location.hash || '').replace('#', '');
    showSection(TITLES[h] ? h : 'dashboard');
  }

  /* ---------------- Load ---------------- */
  async function loadAll() {
    try {
      var results = await Promise.all([
        sb.from('orders').select('*').order('created_at', { ascending: false }).limit(500),
        sb.from('products').select('*').order('created_at', { ascending: false }),
        sb.from('customers').select('*').order('last_order_at', { ascending: false, nullsFirst: false }).limit(500),
        sb.from('categories').select('*').order('name'),
        sb.from('coupons').select('*').order('created_at', { ascending: false }),
        sb.from('settings').select('*').limit(1).maybeSingle()
      ]);
      state.orders = results[0].data || [];
      state.products = results[1].data || [];
      state.customers = results[2].data || [];
      state.categories = results[3].data || [];
      state.coupons = results[4].data || [];
      state.settings = results[5].data || null;
    } catch (err) {
      console.error(err);
      SG.toast('Could not load some admin data.', 'error');
    }
    renderDashboard();
    renderOrders();
    renderProducts();
    renderCustomers();
    renderCategories();
    renderCoupons();
    renderSettings();
  }

  /* ---------------- Helpers ---------------- */
  function el(sel) { return document.querySelector(sel); }
  /** Safe form-control lookup (avoids relying on named-property access) */
  function ctrl(form, name) {
    return form ? form.querySelector('[name="' + name + '"]') : null;
  }
  function val(form, name) { var c = ctrl(form, name); return c ? c.value : ''; }
  function checked(form, name) { var c = ctrl(form, name); return c ? !!c.checked : false; }
  function statusChip(s) {
    var labels = { pending: '🟡 Pending', confirmed: '🔵 Confirmed', packed: '🟣 Packed', shipped: '🟠 Shipped', delivered: '🟢 Delivered', cancelled: '🔴 Cancelled' };
    return '<span class="status-chip st-' + U.esc(s) + '">' + (labels[s] || s) + '</span>';
  }
  function waCustomerLink(o, status) {
    var name = (o.customer_name || 'there').split(' ')[0];
    var msg = 'Hi ' + name + '! This is Smart Ghar. Your order ' + o.order_number + ' has been ' + (status || o.status) + '. Thank you for shopping with us!';
    return U.waLink(msg, U.phoneDigits(o.phone));
  }
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    var m = document.getElementById(id);
    if (m) m.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function isToday(iso) {
    var d = new Date(iso), n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  }

  /* ---------------- Dashboard ---------------- */
  function renderDashboard() {
    var orders = state.orders;
    var valid = orders.filter(function (o) { return o.status !== 'cancelled'; });
    var todayRevenue = valid.filter(function (o) { return isToday(o.created_at); }).reduce(function (s, o) { return s + Number(o.total_amount); }, 0);
    var todayOrders = orders.filter(function (o) { return isToday(o.created_at); }).length;
    var pending = orders.filter(function (o) { return o.status === 'pending'; }).length;
    var monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    var monthRevenue = valid.filter(function (o) { return new Date(o.created_at) >= monthStart; }).reduce(function (s, o) { return s + Number(o.total_amount); }, 0);

    el('[data-stat="today-revenue"]').textContent = U.money(todayRevenue);
    el('[data-stat="today-orders"]').textContent = todayOrders;
    el('[data-stat="pending"]').textContent = pending;
    el('[data-stat="month-revenue"]').textContent = U.money(monthRevenue);
    document.querySelectorAll('[data-pill-orders]').forEach(function (p) { p.textContent = pending || orders.length; });

    /* 7 day chart */
    var days = [], values = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var key = d.toDateString();
      days.push(d.toLocaleDateString('en-GB', { weekday: 'short' }));
      values.push(valid.filter(function (o) { return new Date(o.created_at).toDateString() === key; })
        .reduce(function (s, o) { return s + Number(o.total_amount); }, 0));
    }
    drawBar(el('[data-chart="bar7"]'), days, values);

    /* pie by category */
    var catMap = {};
    valid.forEach(function (o) {
      (o.order_items || []).forEach(function (it) {
        var p = state.products.find(function (x) { return x.title === it.name; });
        var c = p ? p.category : 'Other';
        catMap[c] = (catMap[c] || 0) + Number(it.price) * Number(it.quantity || 1);
      });
    });
    drawPie(el('[data-chart="pieCat"]'), Object.keys(catMap).map(function (k) { return { label: k, value: catMap[k] }; }));

    /* monthly revenue line */
    var months = [], mvals = [];
    for (var m = 5; m >= 0; m--) {
      var md = new Date(); md.setDate(1); md.setMonth(md.getMonth() - m);
      months.push(md.toLocaleDateString('en-GB', { month: 'short' }));
      mvals.push(valid.filter(function (o) {
        var od = new Date(o.created_at);
        return od.getMonth() === md.getMonth() && od.getFullYear() === md.getFullYear();
      }).reduce(function (s, o) { return s + Number(o.total_amount); }, 0));
    }
    drawLine(el('[data-chart="lineMonth"]'), months, mvals);

    /* top products */
    var sold = {};
    valid.forEach(function (o) {
      (o.order_items || []).forEach(function (it) {
        sold[it.name] = sold[it.name] || { qty: 0, revenue: 0, image: it.image };
        sold[it.name].qty += Number(it.quantity || 1);
        sold[it.name].revenue += Number(it.price) * Number(it.quantity || 1);
      });
    });
    var top = Object.keys(sold).map(function (k) { return { name: k, qty: sold[k].qty, revenue: sold[k].revenue, image: sold[k].image }; })
      .sort(function (a, b) { return b.qty - a.qty; }).slice(0, 5);
    el('[data-top-products]').innerHTML = top.length ? top.map(function (t) {
      return '<div class="q-item"><img src="' + U.esc(U.safeUrl(t.image)) + '" alt=""><div><b style="display:block;font-size:.8rem">' + U.esc(t.name) + '</b><small style="color:var(--muted)">' + t.qty + ' sold</small></div><b>' + U.money(t.revenue) + '</b></div>';
    }).join('') : '<div class="empty-mini">No sales yet</div>';

    /* low stock */
    var low = state.products.filter(function (p) { return Number(p.stock_quantity) < 10; })
      .sort(function (a, b) { return Number(a.stock_quantity) - Number(b.stock_quantity); }).slice(0, 5);
    el('[data-low-stock]').innerHTML = low.length ? low.map(function (p) {
      return '<div class="q-item"><img src="' + U.esc(U.safeUrl(p.image_url)) + '" alt=""><div><b style="display:block;font-size:.8rem">' + U.esc(p.title) + '</b><small style="color:var(--muted)">' + p.category + '</small></div><span class="status-chip ' + (Number(p.stock_quantity) <= 0 ? 'st-cancelled' : 'st-pending') + '">' + p.stock_quantity + ' left</span></div>';
    }).join('') : '<div class="empty-mini">All products well stocked</div>';

    /* recent orders */
    var recent = orders.slice(0, 5);
    var tbl = el('[data-recent-orders]');
    tbl.querySelector('tbody').innerHTML = recent.length ? recent.map(function (o) {
      return '<tr><td><b>' + U.esc(o.order_number) + '</b></td><td>' + U.esc(o.customer_name) + '</td><td>' + U.esc(o.city) + '</td>' +
        '<td>' + U.money(o.total_amount) + '</td><td>' + statusChip(o.status) + '</td><td>' + U.date(o.created_at, { day: 'numeric', month: 'short' }) + '</td>' +
        '<td><button class="icon-action" data-view-order="' + U.esc(o.id) + '"><i class="fa-solid fa-eye"></i></button></td></tr>';
    }).join('') : '<tr><td colspan="7" class="empty-mini">No orders yet</td></tr>';
  }

  /* ---------------- Orders ---------------- */
  function filteredOrders() {
    var q = (el('[data-order-search]').value || '').toLowerCase().trim();
    var st = el('[data-order-status]').value;
    var city = el('[data-order-city]').value;
    return state.orders.filter(function (o) {
      if (st && o.status !== st) return false;
      if (city && o.city !== city) return false;
      if (q) {
        var hay = (o.order_number + ' ' + o.customer_name + ' ' + o.phone + ' ' + o.city).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderOrders() {
    var cities = Array.from(new Set(state.orders.map(function (o) { return o.city; }).filter(Boolean))).sort();
    var citySel = el('[data-order-city]');
    var current = citySel.value;
    citySel.innerHTML = '<option value="">All cities</option>' + cities.map(function (c) {
      return '<option' + (c === current ? ' selected' : '') + '>' + U.esc(c) + '</option>';
    }).join('');

    var list = filteredOrders();
    var tbl = el('[data-orders-table]');
    tbl.querySelector('tbody').innerHTML = list.length ? list.map(function (o) {
      var items = (o.order_items || []).reduce(function (s, i) { return s + Number(i.quantity || 1); }, 0);
      return '<tr>' +
        '<td><b>' + U.esc(o.order_number) + '</b></td>' +
        '<td>' + U.esc(o.customer_name) + '</td>' +
        '<td>' + U.esc(o.phone) + '</td>' +
        '<td>' + U.esc(o.city) + '</td>' +
        '<td>' + items + '</td>' +
        '<td><b>' + U.money(o.total_amount) + '</b></td>' +
        '<td>' + U.esc(o.payment_method || 'COD') + '</td>' +
        '<td>' + statusChip(o.status) + '</td>' +
        '<td style="white-space:nowrap">' + U.date(o.created_at, { day: 'numeric', month: 'short' }) + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="icon-action" data-view-order="' + U.esc(o.id) + '" title="View"><i class="fa-solid fa-eye"></i></button>' +
          '<a class="icon-action" href="tel:' + U.esc(o.phone) + '" title="Call"><i class="fa-solid fa-phone"></i></a>' +
          '<a class="icon-action wa" href="' + waCustomerLink(o) + '" target="_blank" rel="noopener" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>' +
          '<button class="icon-action danger" data-delete-order="' + U.esc(o.id) + '" title="Delete"><i class="fa-regular fa-trash-can"></i></button>' +
        '</div></td></tr>';
    }).join('') : '<tr><td colspan="10" class="empty-mini">No orders match this filter</td></tr>';
  }

  document.querySelector('[data-order-search]').addEventListener('input', U.debounce(renderOrders, 200));
  document.querySelector('[data-order-status]').addEventListener('change', renderOrders);
  document.querySelector('[data-order-city]').addEventListener('change', renderOrders);

  document.addEventListener('click', function (e) {
    var view = e.target.closest('[data-view-order]');
    if (view) return showOrder(view.dataset.viewOrder);

    var del = e.target.closest('[data-delete-order]');
    if (del) {
      var o = state.orders.find(function (x) { return x.id === del.dataset.deleteOrder; });
      confirmAction('Delete order ' + (o ? o.order_number : '') + '? This cannot be undone.', async function () {
        var res = await sb.from('orders').delete().eq('id', del.dataset.deleteOrder);
        if (res.error) { SG.toast('Could not delete order', 'error'); return; }
        SG.toast('Order deleted', 'success');
        loadAll();
      });
    }

    var editProd = e.target.closest('[data-edit-product]');
    if (editProd) return openProductModal(editProd.dataset.editProduct);

    var delProd = e.target.closest('[data-delete-product]');
    if (delProd) {
      confirmAction('Delete this product permanently?', async function () {
        var res = await sb.from('products').delete().eq('id', delProd.dataset.deleteProduct);
        if (res.error) { SG.toast('Could not delete product', 'error'); return; }
        SG.toast('Product deleted', 'success');
        loadAll();
      });
    }

    var toggleFeature = e.target.closest('[data-toggle-feature]');
    if (toggleFeature) {
      var p = state.products.find(function (x) { return x.id === toggleFeature.dataset.toggleFeature; });
      sb.from('products').update({ is_featured: !p.is_featured }).eq('id', p.id).then(function () {
        SG.toast('Product updated', 'success');
        loadAll();
      });
    }

    var toggleActive = e.target.closest('[data-toggle-active]');
    if (toggleActive) {
      var p2 = state.products.find(function (x) { return x.id === toggleActive.dataset.toggleActive; });
      sb.from('products').update({ is_active: !p2.is_active }).eq('id', p2.id).then(function () {
        SG.toast('Product updated', 'success');
        loadAll();
      });
    }

    var viewCust = e.target.closest('[data-view-customer]');
    if (viewCust) return showCustomer(viewCust.dataset.viewCustomer);

    var editCat = e.target.closest('[data-edit-category]');
    if (editCat) return openCategoryModal(editCat.dataset.editCategory);

    var delCat = e.target.closest('[data-delete-category]');
    if (delCat) {
      confirmAction('Delete this category? Products will keep their category name.', async function () {
        var res = await sb.from('categories').delete().eq('id', delCat.dataset.deleteCategory);
        if (res.error) { SG.toast('Could not delete category', 'error'); return; }
        SG.toast('Category deleted', 'success'); loadAll();
      });
    }

    var delCoupon = e.target.closest('[data-delete-coupon]');
    if (delCoupon) {
      confirmAction('Delete this coupon?', async function () {
        var res = await sb.from('coupons').delete().eq('id', delCoupon.dataset.deleteCoupon);
        if (res.error) { SG.toast('Could not delete coupon', 'error'); return; }
        SG.toast('Coupon deleted', 'success'); loadAll();
      });
    }

    var toggleCoupon = e.target.closest('[data-toggle-coupon]');
    if (toggleCoupon) {
      var c = state.coupons.find(function (x) { return x.id === toggleCoupon.dataset.toggleCoupon; });
      sb.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id).then(function () { loadAll(); });
    }
  });

  function showOrder(id) {
    var o = state.orders.find(function (x) { return x.id === id; });
    if (!o) return;
    var items = o.order_items || [];
    var body = el('[data-order-detail]');
    body.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">' +
        '<div><b style="font-size:1.05rem;color:var(--forest)">' + U.esc(o.order_number) + '</b>' +
        '<div style="font-size:.76rem;color:var(--muted)">' + U.date(o.created_at, { day: 'numeric', month: 'long', year: 'numeric' }) + ' • ' + U.timeAgo(o.created_at) + '</div></div>' +
        statusChip(o.status) +
      '</div>' +
      '<dl class="kv">' +
        '<dt>Customer</dt><dd>' + U.esc(o.customer_name) + '</dd>' +
        '<dt>Phone</dt><dd>' + U.esc(o.phone) + '</dd>' +
        (o.email ? '<dt>Email</dt><dd>' + U.esc(o.email) + '</dd>' : '') +
        '<dt>Address</dt><dd>' + U.esc(o.address) + ', ' + U.esc(o.city) + ', ' + U.esc(o.province) + (o.postal_code ? ' ' + U.esc(o.postal_code) : '') + '</dd>' +
        '<dt>Payment</dt><dd>' + U.esc(o.payment_method) + '</dd>' +
        (o.order_notes ? '<dt>Notes</dt><dd>' + U.esc(o.order_notes) + '</dd>' : '') +
        (o.coupon_code ? '<dt>Coupon</dt><dd>' + U.esc(o.coupon_code) + '</dd>' : '') +
      '</dl>' +
      '<h4 style="font-family:var(--f-body);font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:8px">Items</h4>' +
      '<div class="order-items">' + items.map(function (it) {
        return '<div class="o-item"><img src="' + U.esc(U.safeUrl(it.image)) + '" alt="">' +
          '<div><b style="display:block;font-size:.82rem">' + U.esc(it.name) + '</b><small style="color:var(--muted)">' + it.quantity + ' × ' + U.money(it.price) + '</small></div>' +
          '<b>' + U.money(Number(it.price) * Number(it.quantity || 1)) + '</b></div>';
      }).join('') + '</div>' +
      '<div style="margin-top:14px;border-top:1px dashed var(--line);padding-top:12px;display:grid;gap:6px;font-size:.84rem">' +
        '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Subtotal</span><b>' + U.money(o.subtotal) + '</b></div>' +
        '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Shipping</span><b>' + U.money(o.shipping_fee) + '</b></div>' +
        (Number(o.discount_amount) ? '<div style="display:flex;justify-content:space-between;color:var(--green-700)"><span>Discount</span><b>-' + U.money(o.discount_amount) + '</b></div>' : '') +
        '<div style="display:flex;justify-content:space-between;font-size:1rem"><span>Total</span><b style="color:var(--forest)">' + U.money(o.total_amount) + '</b></div>' +
      '</div>' +
      '<div class="timeline" style="margin-top:16px"><div>Order placed — ' + U.date(o.created_at) + '</div>' +
        (o.updated_at && o.updated_at !== o.created_at ? '<div>Last updated — ' + U.date(o.updated_at) + '</div>' : '') + '</div>';

    var actions = el('[data-order-actions]');
    actions.innerHTML =
      '<select class="select-mini" data-order-status-select>' +
        ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map(function (s) {
          return '<option value="' + s + '"' + (o.status === s ? ' selected' : '') + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>';
        }).join('') +
      '</select>' +
      '<a class="btn btn--outline btn--sm" href="tel:' + U.esc(o.phone) + '"><i class="fa-solid fa-phone"></i> Call</a>' +
      '<a class="btn btn--wa btn--sm" href="' + waCustomerLink(o) + '" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>' +
      '<button class="btn btn--primary btn--sm" data-save-status="' + U.esc(o.id) + '"><i class="fa-solid fa-check"></i> Save status</button>';

    actions.querySelector('[data-save-status]').addEventListener('click', async function () {
      var status = actions.querySelector('[data-order-status-select]').value;
      var res = await sb.from('orders').update({ status: status }).eq('id', o.id);
      if (res.error) { SG.toast('Could not update status', 'error'); return; }
      SG.toast('Order marked as ' + status, 'success');
      closeModal('orderModal');
      loadAll();
    });

    openModal('orderModal');
  }

  /* ---------------- Products ---------------- */
  function renderProducts() {
    var catSel = el('[data-product-cat]');
    var currentCat = catSel.value;
    catSel.innerHTML = '<option value="">All categories</option>' + state.categories.map(function (c) {
      return '<option' + (c.name === currentCat ? ' selected' : '') + '>' + U.esc(c.name) + '</option>';
    }).join('');

    var q = (el('[data-product-search]').value || '').toLowerCase().trim();
    var cat = catSel.value;
    var stock = el('[data-product-stock]').value;

    var list = state.products.filter(function (p) {
      if (cat && p.category !== cat) return false;
      if (stock === 'in' && Number(p.stock_quantity) <= 0) return false;
      if (stock === 'out' && Number(p.stock_quantity) > 0) return false;
      if (stock === 'low' && Number(p.stock_quantity) >= 10) return false;
      if (q && (p.title + ' ' + p.category).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });

    var tbl = el('[data-products-table]');
    tbl.querySelector('tbody').innerHTML = list.length ? list.map(function (p) {
      return '<tr>' +
        '<td><img class="thumb" src="' + U.esc(U.safeUrl(p.image_url)) + '" alt=""></td>' +
        '<td><b>' + U.esc(p.title) + '</b><div style="font-size:.72rem;color:var(--muted)">' + U.money(p.sale_price != null ? p.sale_price : p.original_price) + ' <s style="opacity:.6">' + U.money(p.original_price) + '</s></div></td>' +
        '<td>' + U.esc(p.category) + '</td>' +
        '<td>' + (p.discount_percent || 0) + '%</td>' +
        '<td><span class="status-chip ' + (Number(p.stock_quantity) < 10 ? 'st-pending' : 'st-delivered') + '">' + p.stock_quantity + '</span></td>' +
        '<td>' + (p.is_active ? '<span class="status-chip st-delivered">Active</span>' : '<span class="status-chip st-cancelled">Draft</span>') + '</td>' +
        '<td><button class="icon-action" data-toggle-feature="' + U.esc(p.id) + '" title="Toggle featured" style="color:' + (p.is_featured ? '#f59e0b' : 'var(--muted)') + '"><i class="' + (p.is_featured ? 'fa-solid' : 'fa-regular') + ' fa-star"></i></button></td>' +
        '<td><div class="row-actions">' +
          '<button class="icon-action" data-edit-product="' + U.esc(p.id) + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="icon-action" data-toggle-active="' + U.esc(p.id) + '" title="Toggle active"><i class="fa-solid fa-power-off"></i></button>' +
          '<button class="icon-action danger" data-delete-product="' + U.esc(p.id) + '" title="Delete"><i class="fa-regular fa-trash-can"></i></button>' +
        '</div></td></tr>';
    }).join('') : '<tr><td colspan="8" class="empty-mini">No products found</td></tr>';
  }

  document.querySelector('[data-product-search]').addEventListener('input', U.debounce(renderProducts, 200));
  document.querySelector('[data-product-cat]').addEventListener('change', renderProducts);
  document.querySelector('[data-product-stock]').addEventListener('change', renderProducts);

  function openProductModal(id) {
    var form = document.querySelector('[data-product-form]');
    form.reset();
    var sel = form.querySelector('[data-category-select]');
    sel.innerHTML = state.categories.map(function (c) { return '<option>' + U.esc(c.name) + '</option>'; }).join('');

    var p = id ? state.products.find(function (x) { return x.id === id; }) : null;
    el('[data-product-modal-title]').textContent = p ? 'Edit product' : 'Add product';
    form.dataset.id = id || '';

    var put = function (name, v) { var c = ctrl(form, name); if (c) c.value = v; };
    if (p) {
      put('title', p.title || '');
      put('category', p.category || '');
      put('stock_quantity', p.stock_quantity || 0);
      put('original_price', p.original_price || '');
      put('sale_price', p.sale_price != null ? p.sale_price : '');
      put('rating', p.rating || 4.5);
      put('review_count', p.review_count || 0);
      put('short_description', p.short_description || '');
      put('full_description', p.full_description || '');
      put('image_url', p.image_url || '');
      put('image_gallery', (p.image_gallery || []).join(', '));
      put('key_features', (p.key_features || []).join('\n'));
      if (ctrl(form, 'is_featured')) ctrl(form, 'is_featured').checked = !!p.is_featured;
      if (ctrl(form, 'is_active')) ctrl(form, 'is_active').checked = !!p.is_active;
      var tags = p.tags || [];
      if (ctrl(form, 'tag_hot_deal')) ctrl(form, 'tag_hot_deal').checked = tags.indexOf('hot_deal') !== -1;
      if (ctrl(form, 'tag_new')) ctrl(form, 'tag_new').checked = tags.indexOf('new') !== -1;
      if (ctrl(form, 'tag_best_seller')) ctrl(form, 'tag_best_seller').checked = tags.indexOf('best_seller') !== -1;
      if (ctrl(form, 'tag_limited')) ctrl(form, 'tag_limited').checked = tags.indexOf('limited') !== -1;
    } else {
      if (ctrl(form, 'is_active')) ctrl(form, 'is_active').checked = true;
      put('rating', 4.5);
      put('stock_quantity', 10);
    }
    openModal('productModal');
  }

  document.querySelector('[data-add-product]').addEventListener('click', function () { openProductModal(null); });

  document.querySelector('[data-product-form]').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target;
    var tags = [];
    ['hot_deal', 'new', 'best_seller', 'limited'].forEach(function (t) {
      if (checked(f, 'tag_' + t)) tags.push(t);
    });
    var payload = {
      title: val(f, 'title').trim(),
      category: val(f, 'category'),
      stock_quantity: Number(val(f, 'stock_quantity')) || 0,
      original_price: Number(val(f, 'original_price')) || 0,
      sale_price: val(f, 'sale_price') ? Number(val(f, 'sale_price')) : null,
      rating: Math.min(5, Number(val(f, 'rating')) || 4.5),
      review_count: Number(val(f, 'review_count')) || 0,
      short_description: val(f, 'short_description').trim(),
      full_description: val(f, 'full_description').trim(),
      image_url: val(f, 'image_url').trim(),
      image_gallery: val(f, 'image_gallery').split(',').map(function (x) { return x.trim(); }).filter(Boolean),
      key_features: val(f, 'key_features').split('\n').map(function (x) { return x.trim(); }).filter(Boolean),
      tags: tags,
      is_featured: checked(f, 'is_featured'),
      is_active: checked(f, 'is_active')
    };
    if (!payload.title || !payload.image_url) { SG.toast('Title and image URL are required', 'error'); return; }

    var btn = f.querySelector('button[type="submit"]');
    btn.disabled = true;
    var res = f.dataset.id
      ? await sb.from('products').update(payload).eq('id', f.dataset.id)
      : await sb.from('products').insert(payload);
    btn.disabled = false;

    if (res.error) { SG.toast('Save failed: ' + res.error.message, 'error'); return; }
    SG.toast(f.dataset.id ? 'Product updated' : 'Product added', 'success');
    closeModal('productModal');
    loadAll();
  });

  /* ---------------- Customers ---------------- */
  function renderCustomers() {
    var q = (el('[data-customer-search]').value || '').toLowerCase().trim();
    var filter = el('[data-customer-filter]').value;
    var monthAgo = Date.now() - 30 * 864e5;

    var list = state.customers.filter(function (c) {
      if (q && ((c.name || '') + ' ' + (c.phone || '') + ' ' + (c.city || '')).toLowerCase().indexOf(q) === -1) return false;
      if (filter === 'vip' && !(c.is_vip || Number(c.total_orders) >= 5)) return false;
      if (filter === 'new' && new Date(c.created_at).getTime() < monthAgo) return false;
      return true;
    });

    var tbl = el('[data-customers-table]');
    tbl.querySelector('tbody').innerHTML = list.length ? list.map(function (c) {
      return '<tr>' +
        '<td><b>' + U.esc(c.name || '—') + '</b>' + (c.is_vip ? ' <span class="tag-vip">VIP</span>' : '') + '</td>' +
        '<td>' + U.esc(c.phone || '—') + '</td>' +
        '<td>' + U.esc(c.email || '—') + '</td>' +
        '<td>' + U.esc(c.city || '—') + '</td>' +
        '<td>' + (c.total_orders || 0) + '</td>' +
        '<td>' + U.money(c.total_spent || 0) + '</td>' +
        '<td>' + U.date(c.last_order_at || c.created_at, { day: 'numeric', month: 'short' }) + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="icon-action" data-view-customer="' + U.esc(c.id) + '" title="View"><i class="fa-solid fa-eye"></i></button>' +
          '<a class="icon-action" href="tel:' + U.esc(c.phone) + '" title="Call"><i class="fa-solid fa-phone"></i></a>' +
          '<a class="icon-action wa" href="' + U.waLink('Hi ' + (c.name || 'there') + '! This is Smart Ghar.', U.phoneDigits(c.phone)) + '" target="_blank" rel="noopener" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>' +
        '</div></td></tr>';
    }).join('') : '<tr><td colspan="8" class="empty-mini">No customers yet — they appear automatically after the first order.</td></tr>';
  }
  document.querySelector('[data-customer-search]').addEventListener('input', U.debounce(renderCustomers, 200));
  document.querySelector('[data-customer-filter]').addEventListener('change', renderCustomers);

  function showCustomer(id) {
    var c = state.customers.find(function (x) { return x.id === id; });
    if (!c) return;
    var orders = state.orders.filter(function (o) { return U.phoneDigits(o.phone) === U.phoneDigits(c.phone); });
    el('[data-customer-detail]').innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">' +
        '<span class="avatar" style="width:52px;height:52px">' + U.esc((c.name || 'C').charAt(0)) + '</span>' +
        '<div><b style="font-size:1rem">' + U.esc(c.name || '—') + '</b>' + (c.is_vip ? ' <span class="tag-vip">VIP</span>' : '') +
        '<div style="font-size:.78rem;color:var(--muted)">' + U.esc(c.phone || '') + ' • ' + U.esc(c.city || '') + '</div></div>' +
      '</div>' +
      '<dl class="kv">' +
        '<dt>Email</dt><dd>' + U.esc(c.email || '—') + '</dd>' +
        '<dt>Address</dt><dd>' + U.esc(c.address || '—') + '</dd>' +
        '<dt>Total orders</dt><dd>' + (c.total_orders || 0) + '</dd>' +
        '<dt>Total spent</dt><dd>' + U.money(c.total_spent || 0) + '</dd>' +
        '<dt>Customer since</dt><dd>' + U.date(c.created_at) + '</dd>' +
      '</dl>' +
      '<h4 style="font-family:var(--f-body);font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:8px">Order history</h4>' +
      (orders.length ? '<div class="quick-list">' + orders.map(function (o) {
        return '<div class="q-item" style="grid-template-columns:1fr auto"><div><b style="font-size:.82rem">' + U.esc(o.order_number) + '</b>' +
          '<small style="display:block;color:var(--muted)">' + U.date(o.created_at) + '</small></div>' +
          '<div style="text-align:right"><b>' + U.money(o.total_amount) + '</b><div>' + statusChip(o.status) + '</div></div></div>';
      }).join('') + '</div>' : '<div class="empty-mini">No orders found</div>') +
      '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">' +
        '<a class="btn btn--outline btn--sm" href="tel:' + U.esc(c.phone) + '"><i class="fa-solid fa-phone"></i> Call</a>' +
        '<a class="btn btn--wa btn--sm" href="' + U.waLink('Hi ' + (c.name || 'there') + '! This is Smart Ghar.', U.phoneDigits(c.phone)) + '" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>' +
      '</div>';
    openModal('customerModal');
  }

  /* ---------------- Categories ---------------- */
  function renderCategories() {
    var tbl = el('[data-categories-table]');
    tbl.querySelector('thead') && tbl.querySelector('thead').remove();
    var head = '<thead><tr><th>Image</th><th>Name</th><th>Slug</th><th>Icon</th><th>Products</th><th>Status</th><th>Actions</th></tr></thead>';
    tbl.innerHTML = head + '<tbody>' + (state.categories.length ? state.categories.map(function (c) {
      var count = state.products.filter(function (p) { return p.category === c.name; }).length;
      return '<tr>' +
        '<td><img class="thumb" src="' + U.esc(U.safeUrl(c.image_url, '/images/products/cat-kitchen.png')) + '" alt=""></td>' +
        '<td><b>' + U.esc(c.name) + '</b></td>' +
        '<td style="color:var(--muted)">' + U.esc(c.slug) + '</td>' +
        '<td style="font-size:1.1rem">' + U.esc(c.icon || '🛍️') + '</td>' +
        '<td>' + count + '</td>' +
        '<td>' + (c.is_active ? '<span class="status-chip st-delivered">Active</span>' : '<span class="status-chip st-cancelled">Hidden</span>') + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="icon-action" data-edit-category="' + U.esc(c.id) + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="icon-action danger" data-delete-category="' + U.esc(c.id) + '" title="Delete"><i class="fa-regular fa-trash-can"></i></button>' +
        '</div></td></tr>';
    }).join('') : '<tr><td colspan="7" class="empty-mini">No categories yet</td></tr>') + '</tbody>';
  }

  function openCategoryModal(id) {
    var form = document.querySelector('[data-category-form]');
    form.reset();
    var c = id ? state.categories.find(function (x) { return x.id === id; }) : null;
    el('[data-cat-modal-title]').textContent = c ? 'Edit category' : 'Add category';
    form.dataset.id = id || '';
    var put = function (name, v) { var el2 = ctrl(form, name); if (el2) el2.value = v; };
    if (c) {
      put('name', c.name);
      put('slug', c.slug);
      put('icon', c.icon || '🛍️');
      put('image_url', c.image_url || '');
      put('description', c.description || '');
      if (ctrl(form, 'is_active')) ctrl(form, 'is_active').checked = c.is_active !== false;
    } else if (ctrl(form, 'is_active')) {
      ctrl(form, 'is_active').checked = true;
    }
    openModal('categoryModal');
  }
  document.querySelector('[data-add-category]').addEventListener('click', function () { openCategoryModal(null); });
  document.querySelector('[data-category-form] form, form[data-category-form]').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target;
    var payload = {
      name: val(f, 'name').trim(),
      slug: val(f, 'slug').trim().toLowerCase().replace(/\s+/g, '-'),
      icon: val(f, 'icon'),
      image_url: val(f, 'image_url').trim() || null,
      description: val(f, 'description').trim(),
      is_active: checked(f, 'is_active')
    };
    if (!payload.name || !payload.slug) { SG.toast('Name and slug are required', 'error'); return; }
    var res = f.dataset.id
      ? await sb.from('categories').update(payload).eq('id', f.dataset.id)
      : await sb.from('categories').insert(payload);
    if (res.error) { SG.toast('Save failed: ' + res.error.message, 'error'); return; }
    SG.toast('Category saved', 'success');
    closeModal('categoryModal');
    loadAll();
  });

  /* ---------------- Coupons ---------------- */
  function renderCoupons() {
    var tbl = el('[data-coupons-table]');
    var head = '<thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Validity</th><th>Used</th><th>Status</th><th>Actions</th></tr></thead>';
    tbl.innerHTML = head + '<tbody>' + (state.coupons.length ? state.coupons.map(function (c) {
      var disc = c.discount_type === 'percentage' ? c.discount_value + '% off'
        : c.discount_type === 'fixed' ? U.money(c.discount_value) + ' off' : 'Free shipping';
      return '<tr>' +
        '<td><b style="letter-spacing:.06em">' + U.esc(c.code) + '</b></td>' +
        '<td>' + disc + (c.max_discount_cap ? '<div style="font-size:.7rem;color:var(--muted)">cap ' + U.money(c.max_discount_cap) + '</div>' : '') + '</td>' +
        '<td>' + U.money(c.min_order_amount || 0) + '</td>' +
        '<td style="font-size:.76rem;color:var(--muted)">' + (c.valid_from ? U.date(c.valid_from, { day: 'numeric', month: 'short' }) : '—') + ' → ' + (c.valid_till ? U.date(c.valid_till, { day: 'numeric', month: 'short' }) : '∞') + '</td>' +
        '<td>' + (c.usage_count || 0) + (c.usage_limit ? ' / ' + c.usage_limit : '') + '</td>' +
        '<td><button class="status-chip ' + (c.is_active ? 'st-delivered' : 'st-cancelled') + '" data-toggle-coupon="' + U.esc(c.id) + '">' + (c.is_active ? 'Active' : 'Inactive') + '</button></td>' +
        '<td><button class="icon-action danger" data-delete-coupon="' + U.esc(c.id) + '"><i class="fa-regular fa-trash-can"></i></button></td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="7" class="empty-mini">No coupons yet</td></tr>') + '</tbody>';
  }

  document.querySelector('[data-coupon-form]').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target;
    var type = val(f, 'discount_type');
    var payload = {
      code: val(f, 'code').trim().toUpperCase(),
      discount_type: type,
      discount_value: type === 'free_shipping' ? 0 : Number(val(f, 'discount_value')) || 0,
      min_order_amount: Number(val(f, 'min_order_amount')) || 0,
      max_discount_cap: val(f, 'max_discount_cap') ? Number(val(f, 'max_discount_cap')) : null,
      usage_limit: val(f, 'usage_limit') ? Number(val(f, 'usage_limit')) : null,
      valid_from: val(f, 'valid_from') || null,
      valid_till: val(f, 'valid_till') || null,
      is_active: checked(f, 'is_active')
    };
    if (!payload.code) { SG.toast('Coupon code is required', 'error'); return; }
    var res = await sb.from('coupons').insert(payload);
    if (res.error) { SG.toast('Could not create coupon: ' + res.error.message, 'error'); return; }
    SG.toast('Coupon ' + payload.code + ' created', 'success');
    f.reset();
    if (ctrl(f, 'is_active')) ctrl(f, 'is_active').checked = true;
    loadAll();
  });

  /* ---------------- Analytics ---------------- */
  function renderAnalytics() {
    var days = Number(el('[data-analytics-range]').value) || 30;
    var since = Date.now() - days * 864e5;
    var orders = state.orders.filter(function (o) { return new Date(o.created_at).getTime() >= since; });
    var valid = orders.filter(function (o) { return o.status !== 'cancelled'; });
    var revenue = valid.reduce(function (s, o) { return s + Number(o.total_amount); }, 0);
    var aov = valid.length ? revenue / valid.length : 0;
    var delivered = orders.filter(function (o) { return o.status === 'delivered'; }).length;
    var conv = orders.length ? Math.round((delivered / orders.length) * 100) : 0;

    el('[data-an="revenue"]').textContent = U.money(revenue);
    el('[data-an="orders"]').textContent = orders.length;
    el('[data-an="aov"]').textContent = U.money(Math.round(aov));
    el('[data-an="conversion"]').textContent = conv + '%';

    /* by city */
    var cityMap = {};
    valid.forEach(function (o) { cityMap[o.city] = (cityMap[o.city] || 0) + Number(o.total_amount); });
    drawPie(el('[data-chart="pieCity"]'), Object.keys(cityMap).map(function (k) { return { label: k, value: cityMap[k] }; }));

    /* by category */
    var catMap = {};
    valid.forEach(function (o) {
      (o.order_items || []).forEach(function (it) {
        var p = state.products.find(function (x) { return x.title === it.name; });
        var c = p ? p.category : 'Other';
        catMap[c] = (catMap[c] || 0) + Number(it.price) * Number(it.quantity || 1);
      });
    });
    drawPie(el('[data-chart="pieCat2"]'), Object.keys(catMap).map(function (k) { return { label: k, value: catMap[k] }; }));

    /* peak hours */
    var hours = new Array(24).fill(0);
    orders.forEach(function (o) { hours[new Date(o.created_at).getHours()]++; });
    var hourLabels = [], hourVals = [];
    for (var h = 0; h < 24; h += 3) {
      hourLabels.push(h + ':00');
      hourVals.push(hours[h] + hours[h + 1] + hours[h + 2]);
    }
    drawBar(el('[data-chart="barHours"]'), hourLabels, hourVals);

    /* new customers over time */
    var buckets = days <= 30 ? 6 : 6;
    var labels = [], vals = [];
    for (var i = buckets - 1; i >= 0; i--) {
      var end = Date.now() - (i * days / buckets) * 864e5;
      var start = end - (days / buckets) * 864e5;
      labels.push(new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
      vals.push(state.customers.filter(function (c) {
        var t = new Date(c.created_at).getTime();
        return t >= start && t <= end;
      }).length);
    }
    drawLine(el('[data-chart="lineCustomers"]'), labels, vals);

    /* top products */
    var sold = {};
    valid.forEach(function (o) {
      (o.order_items || []).forEach(function (it) {
        sold[it.name] = sold[it.name] || { qty: 0, revenue: 0, image: it.image };
        sold[it.name].qty += Number(it.quantity || 1);
        sold[it.name].revenue += Number(it.price) * Number(it.quantity || 1);
      });
    });
    var top = Object.keys(sold).map(function (k) { return { name: k, qty: sold[k].qty, revenue: sold[k].revenue, image: sold[k].image }; })
      .sort(function (a, b) { return b.revenue - a.revenue; }).slice(0, 8);
    el('[data-top-products-full]').innerHTML = top.length ? top.map(function (t, i) {
      return '<div class="q-item"><img src="' + U.esc(U.safeUrl(t.image)) + '" alt=""><div><b style="display:block;font-size:.8rem">' + (i + 1) + '. ' + U.esc(t.name) + '</b><small style="color:var(--muted)">' + t.qty + ' units sold</small></div><b>' + U.money(t.revenue) + '</b></div>';
    }).join('') : '<div class="empty-mini">No sales in this period</div>';
  }
  document.querySelector('[data-analytics-range]').addEventListener('change', renderAnalytics);

  /* ---------------- Settings ---------------- */
  function renderSettings() {
    var f = document.querySelector('[data-settings-form]');
    var s = state.settings;
    if (!f || !s) return;
    var set = function (name, v) { var c = ctrl(f, name); if (c && v !== null && v !== undefined) c.value = v; };
    set('store_name', s.store_name);
    set('logo_url', s.logo_url);
    set('announcement_text', s.announcement_text);
    set('free_shipping_threshold', s.free_shipping_threshold);
    set('shipping_fee', s.shipping_fee);
    set('whatsapp_number', s.whatsapp_number);
    set('support_email', s.support_email);
    set('business_address', s.business_address);
    var soc = s.social_links || {};
    set('instagram', soc.instagram); set('facebook', soc.facebook); set('tiktok', soc.tiktok); set('youtube', soc.youtube);
    var bank = s.bank_details || {};
    set('bank_name', bank.bank); set('bank_title', bank.title); set('bank_account', bank.account);
    var ep = s.easypaisa || {};
    set('easypaisa', ep.easypaisa); set('jazzcash', ep.jazzcash);
    if (ctrl(f, 'store_status')) ctrl(f, 'store_status').checked = s.store_status !== false;
    if (ctrl(f, 'cod_enabled')) ctrl(f, 'cod_enabled').checked = s.cod_enabled !== false;
  }

  document.querySelector('[data-settings-form]').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target;
    var payload = {
      store_status: checked(f, 'store_status'),
      store_name: val(f, 'store_name').trim(),
      logo_url: val(f, 'logo_url').trim(),
      announcement_text: val(f, 'announcement_text').trim(),
      free_shipping_threshold: Number(val(f, 'free_shipping_threshold')) || 3000,
      shipping_fee: Number(val(f, 'shipping_fee')) || 200,
      whatsapp_number: val(f, 'whatsapp_number').replace(/[^0-9]/g, ''),
      support_email: val(f, 'support_email').trim(),
      business_address: val(f, 'business_address').trim(),
      social_links: { instagram: val(f, 'instagram').trim(), facebook: val(f, 'facebook').trim(), tiktok: val(f, 'tiktok').trim(), youtube: val(f, 'youtube').trim() },
      bank_details: { bank: val(f, 'bank_name').trim(), title: val(f, 'bank_title').trim(), account: val(f, 'bank_account').trim() },
      easypaisa: { easypaisa: val(f, 'easypaisa').trim(), jazzcash: val(f, 'jazzcash').trim(), title: val(f, 'bank_title').trim() },
      cod_enabled: checked(f, 'cod_enabled')
    };
    var res;
    if (state.settings && state.settings.id) {
      res = await sb.from('settings').update(payload).eq('id', state.settings.id);
    } else {
      res = await sb.from('settings').insert(payload);
    }
    if (res.error) { SG.toast('Could not save settings: ' + res.error.message, 'error'); return; }
    SG.toast('Settings saved', 'success');
    var s = await sb.from('settings').select('*').limit(1).maybeSingle();
    state.settings = s.data;
  });

  document.querySelector('[data-password-form]').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target;
    var pw = val(f, 'password');
    if (pw.length < 6) { SG.toast('Password must be at least 6 characters', 'error'); return; }
    if (pw !== val(f, 'confirm')) { SG.toast('Passwords do not match', 'error'); return; }
    var res = await sb.auth.updateUser({ password: pw });
    if (res.error) { SG.toast('Could not update password: ' + res.error.message, 'error'); return; }
    f.reset();
    SG.toast('Password updated successfully', 'success');
  });

  /* ---------------- CSV export ---------------- */
  function downloadCsv(filename, rows) {
    var csv = rows.map(function (r) {
      return r.map(function (cell) {
        var s = String(cell === null || cell === undefined ? '' : cell).replace(/"/g, '""');
        return '"' + s + '"';
      }).join(',');
    }).join('\r\n');
    var blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  document.querySelector('[data-export-orders]').addEventListener('click', function () {
    var list = filteredOrders();
    var rows = [['Order #', 'Date', 'Customer', 'Phone', 'City', 'Province', 'Address', 'Items', 'Subtotal', 'Shipping', 'Discount', 'Total', 'Payment', 'Status', 'Notes']];
    list.forEach(function (o) {
      rows.push([o.order_number, o.created_at, o.customer_name, o.phone, o.city, o.province, o.address,
        (o.order_items || []).map(function (i) { return i.name + ' x' + i.quantity; }).join(' | '),
        o.subtotal, o.shipping_fee, o.discount_amount, o.total_amount, o.payment_method, o.status, o.order_notes || '']);
    });
    downloadCsv('smart-ghar-orders-' + new Date().toISOString().slice(0, 10) + '.csv', rows);
    SG.toast('Orders exported', 'success');
  });

  document.querySelector('[data-export-customers]').addEventListener('click', function () {
    var rows = [['Name', 'Phone', 'Email', 'City', 'Orders', 'Total Spent', 'VIP']];
    state.customers.forEach(function (c) {
      rows.push([c.name, c.phone, c.email, c.city, c.total_orders, c.total_spent, c.is_vip ? 'Yes' : 'No']);
    });
    downloadCsv('smart-ghar-customers-' + new Date().toISOString().slice(0, 10) + '.csv', rows);
    SG.toast('Customers exported', 'success');
  });

  /* ---------------- Confirm dialog ---------------- */
  var confirmCb = null;
  function confirmAction(text, cb) {
    el('[data-confirm-text]').textContent = text;
    confirmCb = cb;
    openModal('confirmModal');
  }
  document.querySelector('[data-confirm-yes]').addEventListener('click', async function () {
    closeModal('confirmModal');
    if (typeof confirmCb === 'function') await confirmCb();
    confirmCb = null;
  });

  /* ---------------- Charts (vanilla canvas) ---------------- */
  function setupCanvas(canvas) {
    if (!canvas) return null;
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var w = rect.width || canvas.parentElement.clientWidth || 400;
    var h = rect.height || 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return null; // canvas unsupported — skip chart instead of breaking the page
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function niceMax(v) {
    if (v <= 0) return 1000;
    var pow = Math.pow(10, Math.floor(Math.log10(v)));
    return Math.ceil(v / pow) * pow;
  }

  function drawBar(canvas, labels, values) {
    var c = setupCanvas(canvas);
    if (!c) return;
    var ctx = c.ctx, w = c.w, h = c.h;
    var padL = 46, padB = 26, padT = 14, padR = 10;
    var max = niceMax(Math.max.apply(null, values.concat([0])));
    var plotW = w - padL - padR, plotH = h - padT - padB;

    ctx.font = '10px Poppins, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#eef2f0';
    ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var y = padT + plotH - (plotH * i / 4);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillText(shortNum(max * i / 4), 4, y + 3);
    }

    var gap = 10;
    var bw = Math.max(6, (plotW - gap * (values.length - 1)) / Math.max(1, values.length));
    values.forEach(function (v, i) {
      var bh = max ? (v / max) * plotH : 0;
      var x = padL + i * (bw + gap);
      var y = padT + plotH - bh;
      var grad = ctx.createLinearGradient(0, y, 0, padT + plotH);
      grad.addColorStop(0, '#22c55e');
      grad.addColorStop(1, '#bbf7d0');
      ctx.fillStyle = grad;
      roundRect(ctx, x, y, bw, Math.max(2, bh), 5);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      var label = labels[i] || '';
      var tw = ctx.measureText(label).width;
      ctx.fillText(label, x + bw / 2 - tw / 2, h - 8);
    });
  }

  function drawLine(canvas, labels, values) {
    var c = setupCanvas(canvas);
    if (!c) return;
    var ctx = c.ctx, w = c.w, h = c.h;
    var padL = 46, padB = 26, padT = 14, padR = 12;
    var max = niceMax(Math.max.apply(null, values.concat([0])));
    var plotW = w - padL - padR, plotH = h - padT - padB;

    ctx.font = '10px Poppins, sans-serif';
    ctx.strokeStyle = '#eef2f0';
    ctx.fillStyle = '#94a3b8';
    for (var i = 0; i <= 4; i++) {
      var y = padT + plotH - (plotH * i / 4);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillText(shortNum(max * i / 4), 4, y + 3);
    }

    var stepX = values.length > 1 ? plotW / (values.length - 1) : plotW;
    var pts = values.map(function (v, i) {
      return { x: padL + i * stepX, y: padT + plotH - (max ? (v / max) * plotH : 0) };
    });

    var grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, 'rgba(34,197,94,.28)');
    grad.addColorStop(1, 'rgba(34,197,94,0)');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, padT + plotH);
    pts.forEach(function (p) { ctx.lineTo(p.x, p.y); });
    ctx.lineTo(pts[pts.length - 1].x, padT + plotH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    pts.forEach(function (p, i) { i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    pts.forEach(function (p, i) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      var label = labels[i] || '';
      var tw = ctx.measureText(label).width;
      ctx.fillText(label, p.x - tw / 2, h - 8);
    });
  }

  var PALETTE = ['#22c55e', '#14532d', '#84cc16', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

  function drawPie(canvas, data) {
    var c = setupCanvas(canvas);
    if (!c) return;
    var ctx = c.ctx, w = c.w, h = c.h;
    var items = (data || []).filter(function (d) { return d.value > 0; });
    if (!items.length) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Poppins, sans-serif';
      ctx.fillText('No data yet', w / 2 - 32, h / 2);
      return;
    }
    var total = items.reduce(function (s, d) { return s + d.value; }, 0);
    var radius = Math.min(w * 0.30, h * 0.40);
    var cx = Math.min(w * 0.30, radius + 12);
    var cy = h / 2;
    var start = -Math.PI / 2;

    items.forEach(function (d, i) {
      var angle = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      start += angle;
    });

    /* legend */
    var lx = cx + radius + Math.max(14, w * 0.06);
    var ly = Math.max(16, cy - items.length * 9);
    ctx.font = '10.5px Poppins, sans-serif';
    items.slice(0, 6).forEach(function (d, i) {
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.beginPath();
      ctx.arc(lx + 5, ly + i * 18, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#475569';
      var pct = Math.round((d.value / total) * 100);
      ctx.fillText((d.label || '').substring(0, 14) + ' • ' + pct + '%', lx + 16, ly + i * 18 + 3.5);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function shortNum(n) {
    n = Math.round(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return String(n);
  }

  /* redraw charts on resize */
  window.addEventListener('resize', U.debounce(function () {
    if (state.section === 'dashboard') renderDashboard();
    if (state.section === 'analytics') renderAnalytics();
  }, 250));

  /* ---------------- Go ---------------- */
  boot();
})(window, document);
