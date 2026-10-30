/* ==========================================================
   SMART GHAR — Storefront logic
   Product fetching, cards, shop filters, product detail, home
   ========================================================== */
(function (window, document) {
  'use strict';
  var SG = window.SG;
  var U = SG.utils;
  var sb = SG.sb;

  window.__sgProducts = window.__sgProducts || {};

  /* ---------------- Product card ---------------- */
  function badges(p) {
    var tags = Array.isArray(p.tags) ? p.tags : [];
    var out = '';
    if (tags.indexOf('new') !== -1) out += '<span class="badge badge--new">New</span>';
    else if (p.discount_percent > 0) out += '<span class="badge badge--sale">Sale</span>';
    if (tags.indexOf('limited') !== -1) out += '<span class="badge badge--limited">Limited</span>';
    else if (tags.indexOf('best_seller') !== -1) out += '<span class="badge badge--best">Best Seller</span>';
    return out ? '<div class="pc-badges">' + out + '</div>' : '';
  }

  function cardHtml(p, idx) {
    window.__sgProducts[p.id] = p;
    var wish = SG.cart && SG.cart.isWished(p.id);
    var price = p.sale_price != null ? p.sale_price : p.original_price;
    var delay = Math.min((idx || 0) * 100, 600);
    var url = 'product-detail.html?id=' + encodeURIComponent(p.id);
    return (
      '<article class="product-card reveal-now" style="animation-delay:' + delay + 'ms">' +
        '<div class="pc-media">' +
          '<a href="' + url + '" aria-label="' + U.esc(p.title) + '">' +
            '<img src="' + U.esc(U.safeUrl(p.image_url)) + '" alt="' + U.esc(p.title) + '" loading="lazy" width="600" height="600">' +
          '</a>' +
          badges(p) +
          '<button class="pc-wish' + (wish ? ' is-active' : '') + '" data-wish="' + U.esc(p.id) + '" data-wish-title="' + U.esc(p.title) + '" aria-label="Add to wishlist">' +
            '<i class="' + (wish ? 'fa-solid' : 'fa-regular') + ' fa-heart"></i>' +
          '</button>' +
          '<button class="pc-quick" data-quick="' + U.esc(p.id) + '"><i class="fa-solid fa-eye"></i> Quick View</button>' +
        '</div>' +
        '<div class="pc-body">' +
          '<span class="pc-cat">' + U.esc(p.category) + '</span>' +
          '<h3 class="pc-title"><a href="' + url + '">' + U.esc(p.title) + '</a></h3>' +
          '<div class="pc-rating"><span class="stars">' + U.stars(p.rating) + '</span><span>(' + (p.review_count || 0) + ')</span></div>' +
          '<div class="pc-price">' +
            '<span class="now">' + U.money(price) + '</span>' +
            (p.sale_price && p.sale_price < p.original_price ? '<s>' + U.money(p.original_price) + '</s><span class="pc-off">' + p.discount_percent + '% OFF</span>' : '') +
          '</div>' +
          (Number(p.stock_quantity) <= 0
            ? '<div class="pc-stock"><i class="fa-solid fa-circle-exclamation"></i> Out of stock</div>'
            : '') +
          '<button class="pc-add" data-add-to-cart="' + U.esc(p.id) + '"' + (Number(p.stock_quantity) <= 0 ? ' disabled' : '') + '>' +
            '<i class="fa-solid fa-bag-shopping"></i> Add to Cart</button>' +
        '</div>' +
      '</article>'
    );
  }

  function skeletons(n) {
    var out = '';
    for (var i = 0; i < n; i++) {
      out += '<div class="sk-card"><div class="skeleton aspect"></div><div class="sk-body">' +
        '<div class="skeleton" style="height:10px;width:40%"></div>' +
        '<div class="skeleton" style="height:14px;width:90%"></div>' +
        '<div class="skeleton" style="height:14px;width:65%"></div>' +
        '<div class="skeleton" style="height:18px;width:55%"></div>' +
        '<div class="skeleton" style="height:40px;border-radius:10px"></div>' +
        '</div></div>';
    }
    return out;
  }

  async function fetchProducts(opts) {
    opts = opts || {};
    if (!sb) throw new Error('offline');
    var q = sb.from('products').select('*').eq('is_active', true);
    if (opts.featured) q = q.eq('is_featured', true);
    if (opts.category) q = q.eq('category', opts.category);
    if (opts.tag) q = q.contains('tags', [opts.tag]);
    if (opts.search) q = q.or('title.ilike.%' + opts.search + '%,short_description.ilike.%' + opts.search + '%');
    var sort = opts.sort || 'newest';
    if (sort === 'price-low') q = q.order('sale_price', { ascending: true, nullsFirst: false });
    else if (sort === 'price-high') q = q.order('sale_price', { ascending: false, nullsFirst: false });
    else if (sort === 'rating') q = q.order('rating', { ascending: false });
    else if (sort === 'best') q = q.order('review_count', { ascending: false });
    else q = q.order('created_at', { ascending: false });
    q = q.limit(opts.limit || 60);
    var res = await q;
    if (res.error) throw res.error;
    return res.data || [];
  }

  function errorState(el, msg) {
    if (!el) return;
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">' +
      '<i class="fa-solid fa-cloud-arrow-down"></i>' +
      '<h3 style="font-family:var(--f-body);font-size:1rem;margin-bottom:6px">Could not load products</h3>' +
      '<p style="font-size:.86rem;max-width:340px;margin:0 auto 16px">' + U.esc(msg || 'Please check your internet connection and try again.') + '</p>' +
      '<button class="btn btn--outline btn--sm" onclick="location.reload()"><i class="fa-solid fa-rotate-right"></i> Retry</button>' +
      '</div>';
  }

  /* ---------------- Quick view ---------------- */
  function initQuickView() {
    var modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'quickView';
    modal.innerHTML = '<div class="modal__backdrop" data-qv-close></div><div class="modal__card modal__card--wide" data-qv-body></div>';
    document.body.appendChild(modal);

    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-qv-close]')) close();
      var add = e.target.closest('[data-qv-add]');
      if (add) {
        var p = window.__sgProducts[add.dataset.qvAdd];
        if (p) SG.cart.add(p, 1);
      }
    });
    document.addEventListener('click', async function (e) {
      var trigger = e.target.closest('[data-quick]');
      if (!trigger) return;
      e.preventDefault();
      var id = trigger.dataset.quick;
      var p = window.__sgProducts[id];
      var body = modal.querySelector('[data-qv-body]');
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (!p) {
        body.innerHTML = '<div style="padding:30px;text-align:center"><span class="spinner spinner--green"></span></div>';
        var res = await sb.from('products').select('*').eq('id', id).maybeSingle();
        p = res.data;
        if (p) window.__sgProducts[p.id] = p;
      }
      if (!p) { body.innerHTML = '<p style="padding:24px">Product not found.</p>'; return; }
      var price = p.sale_price != null ? p.sale_price : p.original_price;
      body.innerHTML =
        '<button class="icon-btn" data-qv-close aria-label="Close" style="position:absolute;top:10px;right:10px"><i class="fa-solid fa-xmark"></i></button>' +
        '<div style="display:grid;gap:18px" class="qv-grid">' +
          '<div style="border-radius:14px;overflow:hidden;background:var(--cream)"><img src="' + U.esc(U.safeUrl(p.image_url)) + '" alt="' + U.esc(p.title) + '"></div>' +
          '<div>' +
            '<span class="pc-cat">' + U.esc(p.category) + '</span>' +
            '<h3 class="h3" style="font-size:1.3rem;margin:6px 0 8px">' + U.esc(p.title) + '</h3>' +
            '<div class="pc-rating" style="margin-bottom:10px"><span class="stars">' + U.stars(p.rating) + '</span><span>(' + (p.review_count || 0) + ' reviews)</span></div>' +
            '<div class="pc-price" style="margin-bottom:12px"><span class="now" style="font-size:1.4rem">' + U.money(price) + '</span>' +
              (p.sale_price && p.sale_price < p.original_price ? '<s>' + U.money(p.original_price) + '</s><span class="pc-off">' + p.discount_percent + '% OFF</span>' : '') + '</div>' +
            '<p style="font-size:.88rem;color:var(--muted);margin-bottom:16px">' + U.esc(p.short_description || '') + '</p>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
              '<button class="btn btn--primary" data-qv-add="' + U.esc(p.id) + '"><i class="fa-solid fa-bag-shopping"></i> Add to Cart</button>' +
              '<a class="btn btn--outline" href="product-detail.html?id=' + encodeURIComponent(p.id) + '">View Details</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<style>@media(min-width:640px){.qv-grid{grid-template-columns:240px 1fr!important;align-items:start}}</style>';
    });
  }

  /* ---------------- Home page ---------------- */
  async function initHome() {
    var grid = document.querySelector('[data-featured-grid]');
    var best = document.querySelector('[data-bestsellers]');
    var catWrap = document.querySelector('[data-categories]');
    var reviewWrap = document.querySelector('[data-reviews]');

    if (grid) grid.innerHTML = skeletons(8);
    if (best) best.innerHTML = skeletons(6).replace(/sk-card/g, 'sk-card');
    if (catWrap) catWrap.innerHTML = '<div class="skeleton" style="height:190px;border-radius:16px"></div>'.repeat(4);

    try {
      if (grid) {
        var featured = await fetchProducts({ featured: true, limit: 8 });
        if (featured.length < 8) {
          var extra = await fetchProducts({ limit: 8 });
          var ids = featured.map(function (p) { return p.id; });
          extra.forEach(function (p) { if (featured.length < 8 && ids.indexOf(p.id) === -1) featured.push(p); });
        }
        grid.innerHTML = featured.slice(0, 8).map(cardHtml).join('') ||
          '<p style="grid-column:1/-1;text-align:center;color:var(--muted)">No products yet.</p>';
      }
      if (best) {
        var sellers = await fetchProducts({ sort: 'best', limit: 8 });
        best.innerHTML = sellers.map(cardHtml).join('');
      }
      if (catWrap) {
        var res = await sb.from('categories').select('*').eq('is_active', true).order('name');
        var counts = {};
        (await sb.from('products').select('category').eq('is_active', true)).data.forEach(function (r) {
          counts[r.category] = (counts[r.category] || 0) + 1;
        });
        catWrap.innerHTML = (res.data || []).map(function (c, i) {
          return '<a class="cat-card" href="category.html?c=' + encodeURIComponent(c.slug) + '" data-aos="zoom-in" data-aos-delay="' + (i * 100) + '">' +
            '<img src="' + U.esc(U.safeUrl(c.image_url, '/images/products/cat-kitchen.png')) + '" alt="' + U.esc(c.name) + '" loading="lazy">' +
            '<div class="cat-card__body">' +
              '<span class="cat-card__icon">' + U.esc(c.icon || '🛍️') + '</span>' +
              '<h3>' + U.esc(c.name) + '</h3>' +
              '<span class="cat-card__meta">' + (counts[c.name] || c.product_count || 0) + ' products</span><br>' +
              '<span class="cat-card__link">Shop Now <i class="fa-solid fa-arrow-right"></i></span>' +
            '</div></a>';
        }).join('');
      }
      if (reviewWrap) {
        var rv = await sb.from('reviews')
          .select('customer_name,rating,review_text,created_at,products(title)')
          .eq('is_approved', true).order('created_at', { ascending: false }).limit(6);
        var cities = ['Karachi', 'Lahore', 'Islamabad', 'Multan', 'Rawalpindi', 'Faisalabad'];
        reviewWrap.innerHTML = (rv.data || []).map(function (r, i) {
          var initials = (r.customer_name || 'C').split(' ').map(function (s) { return s.charAt(0); }).join('').slice(0, 2).toUpperCase();
          return '<article class="review-card" data-aos="flip-left" data-aos-delay="' + (i * 100) + '">' +
            '<span class="quote">”</span>' +
            '<div class="review-card__top">' +
              '<span class="avatar">' + U.esc(initials) + '</span>' +
              '<div><b>' + U.esc(r.customer_name) + '</b><small>' + cities[i % cities.length] + ' • ' + U.timeAgo(r.created_at) + '</small></div>' +
            '</div>' +
            '<div class="stars" style="margin-bottom:8px">' + U.stars(r.rating) + '</div>' +
            '<p>“' + U.esc(r.review_text) + '”</p>' +
            '<span class="verified"><i class="fa-solid fa-circle-check"></i> Verified Purchase</span>' +
            (r.products ? '<span class="review-card__product">Purchased: <a href="shop.html?q=' + encodeURIComponent(r.products.title) + '">' + U.esc(r.products.title) + '</a></span>' : '') +
          '</article>';
        }).join('');
      }
      initCarousel();
    } catch (err) {
      console.error(err);
      errorState(grid, 'We could not reach the store database.');
    }
  }

  /* ---------------- Carousel ---------------- */
  function initCarousel() {
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
      var track = root.querySelector('.carousel__track');
      if (!track) return;
      var prev = root.querySelector('[data-carousel-prev]');
      var next = root.querySelector('[data-carousel-next]');
      var dotsWrap = root.querySelector('.carousel__dots');
      var auto = root.dataset.autoplay === 'true';
      var timer = null;
      var pages = 0;
      var page = 0;

      function metrics() {
        var card = track.firstElementChild;
        if (!card) return { step: 240, per: 1 };
        var gap = parseFloat(getComputedStyle(track).columnGap) || 12;
        var step = card.getBoundingClientRect().width + gap;
        return { step: step, per: Math.max(1, Math.round(track.clientWidth / step)) };
      }
      function buildDots() {
        if (!dotsWrap) return;
        var m = metrics();
        pages = Math.max(1, Math.ceil(track.children.length / m.per));
        dotsWrap.innerHTML = '';
        for (var i = 0; i < pages; i++) {
          var b = document.createElement('button');
          b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
          if (i === 0) b.classList.add('is-active');
          (function (idx) {
            b.addEventListener('click', function () { go(idx); });
          })(i);
          dotsWrap.appendChild(b);
        }
      }
      function go(idx) {
        var m = metrics();
        page = Math.max(0, Math.min(pages - 1, idx));
        track.scrollTo({ left: page * m.step * m.per, behavior: 'smooth' });
        if (dotsWrap) {
          Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
            d.classList.toggle('is-active', i === page);
          });
        }
      }
      function nextSlide() { go(page + 1 >= pages ? 0 : page + 1); }
      function prevSlide() { go(page - 1 < 0 ? pages - 1 : page - 1); }

      if (next) next.addEventListener('click', nextSlide);
      if (prev) prev.addEventListener('click', prevSlide);

      track.addEventListener('scroll', U.debounce(function () {
        var m = metrics();
        page = Math.round(track.scrollLeft / (m.step * m.per));
        if (dotsWrap) Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
          d.classList.toggle('is-active', i === page);
        });
      }, 120), { passive: true });

      buildDots();
      window.addEventListener('resize', U.debounce(buildDots, 200));

      if (auto) {
        start();
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        track.addEventListener('touchstart', stop, { passive: true });
      }
      function start() {
        stop();
        timer = setInterval(nextSlide, 5000);
      }
      function stop() { if (timer) clearInterval(timer); }
    });
  }

  /* ---------------- Shop page ---------------- */
  async function initShop() {
    var grid = document.querySelector('[data-shop-grid]');
    if (!grid) return;

    var state = {
      all: [],
      filtered: [],
      page: 1,
      perPage: 12,
      view: 'grid',
      sort: 'newest',
      q: U.qs('q') || '',
      cats: U.qs('c') ? [U.qs('c')] : [],
      priceMin: 0,
      priceMax: 20000,
      discount: 0,
      stock: 'all',
      rating: 0
    };

    grid.innerHTML = skeletons(8);

    try {
      state.all = await fetchProducts({ limit: 300 });
    } catch (err) {
      errorState(grid, 'Could not load the catalogue.');
      return;
    }

    var prices = state.all.map(function (p) { return Number(p.sale_price || p.original_price); });
    state.priceMax = Math.max.apply(null, prices.concat([5000]));
    var maxRounded = Math.ceil(state.priceMax / 500) * 500;
    state.priceMax = maxRounded;

    var searchInput = document.querySelector('[data-shop-search]');
    if (searchInput && state.q) searchInput.value = state.q;

    var minInput = document.querySelector('[data-price-min]');
    var maxInput = document.querySelector('[data-price-max]');
    if (minInput) minInput.value = 0;
    if (maxInput) maxInput.value = maxRounded;

    function readFilters() {
      state.q = (searchInput && searchInput.value.trim()) || '';
      if (minInput) state.priceMin = Number(minInput.value) || 0;
      if (maxInput) state.priceMax = Number(maxInput.value) || maxRounded;

      var checkedCats = document.querySelectorAll('[data-filter-cat]:checked');
      state.cats = Array.prototype.map.call(checkedCats, function (c) { return c.value; });

      var d = document.querySelector('[data-filter-discount]:checked');
      state.discount = d ? Number(d.value) : 0;

      var s = document.querySelector('[data-filter-stock]:checked');
      state.stock = s ? s.value : 'all';

      var r = document.querySelector('[data-filter-rating]:checked');
      state.rating = r ? Number(r.value) : 0;

      var sortSel = document.querySelector('[data-shop-sort]');
      state.sort = sortSel ? sortSel.value : 'newest';
    }

    function apply() {
      readFilters();
      var list = state.all.slice();

      if (state.q) {
        var q = state.q.toLowerCase();
        list = list.filter(function (p) {
          return (p.title + ' ' + (p.short_description || '') + ' ' + p.category).toLowerCase().indexOf(q) !== -1;
        });
      }
      if (state.cats.length) list = list.filter(function (p) {
        return state.cats.some(function (c) { return c.toLowerCase() === String(p.category).toLowerCase(); }) ||
               state.cats.some(function (c) { return c.toLowerCase() === String(p.category).toLowerCase().replace(/\s+/g, '-'); });
      });
      list = list.filter(function (p) {
        var price = Number(p.sale_price != null ? p.sale_price : p.original_price);
        return price >= state.priceMin && price <= state.priceMax;
      });
      if (state.discount > 0) list = list.filter(function (p) { return Number(p.discount_percent) >= state.discount; });
      if (state.stock === 'in') list = list.filter(function (p) { return Number(p.stock_quantity) > 0; });
      if (state.stock === 'out') list = list.filter(function (p) { return Number(p.stock_quantity) <= 0; });
      if (state.rating > 0) list = list.filter(function (p) { return Number(p.rating) >= state.rating; });

      list.sort(function (a, b) {
        var pa = Number(a.sale_price != null ? a.sale_price : a.original_price);
        var pb = Number(b.sale_price != null ? b.sale_price : b.original_price);
        switch (state.sort) {
          case 'price-low': return pa - pb;
          case 'price-high': return pb - pa;
          case 'rating': return Number(b.rating) - Number(a.rating);
          case 'best': return Number(b.review_count) - Number(a.review_count);
          default: return new Date(b.created_at) - new Date(a.created_at);
        }
      });

      state.filtered = list;
      state.page = 1;
      render();
    }

    function render() {
      var total = state.filtered.length;
      var start = (state.page - 1) * state.perPage;
      var pageItems = state.filtered.slice(start, start + state.perPage);

      grid.className = 'product-grid' + (state.view === 'list' ? ' list-view' : '');
      grid.innerHTML = pageItems.length
        ? pageItems.map(cardHtml).join('')
        : '<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-magnifying-glass"></i><h3 style="font-family:var(--f-body);font-size:1rem;margin-bottom:6px">No products found</h3><p style="font-size:.86rem">Try changing filters or search terms.</p><button class="btn btn--outline btn--sm" data-clear-filters style="margin-top:14px">Clear all filters</button></div>';

      var counter = document.querySelector('[data-result-count]');
      if (counter) {
        counter.textContent = total
          ? 'Showing ' + (start + 1) + '–' + Math.min(start + state.perPage, total) + ' of ' + total + ' products'
          : 'No products match your filters';
      }

      var pager = document.querySelector('[data-pagination]');
      if (pager) {
        var pages = Math.ceil(total / state.perPage);
        pager.innerHTML = '';
        if (pages > 1) {
          var prev = document.createElement('button');
          prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
          prev.disabled = state.page === 1;
          prev.addEventListener('click', function () { state.page--; render(); scrollToGrid(); });
          pager.appendChild(prev);
          for (var i = 1; i <= pages; i++) {
            (function (n) {
              var b = document.createElement('button');
              b.textContent = n;
              if (n === state.page) b.classList.add('is-active');
              b.addEventListener('click', function () { state.page = n; render(); scrollToGrid(); });
              pager.appendChild(b);
            })(i);
          }
          var next = document.createElement('button');
          next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
          next.disabled = state.page === pages;
          next.addEventListener('click', function () { state.page++; render(); scrollToGrid(); });
          pager.appendChild(next);
        }
      }
    }

    function scrollToGrid() {
      var top = grid.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }

    /* category checkbox list */
    var catList = document.querySelector('[data-cat-filters]');
    if (catList) {
      var counts = {};
      state.all.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
      catList.innerHTML = Object.keys(counts).sort().map(function (c) {
        var slug = c.toLowerCase().replace(/\s+/g, '-');
        var checked = state.cats.some(function (x) { return x === slug || x === c; });
        return '<label class="check"><input type="checkbox" data-filter-cat value="' + U.esc(c) + '"' + (checked ? ' checked' : '') + '> ' + U.esc(c) +
          '<span class="count">' + counts[c] + '</span></label>';
      }).join('');
    }

    /* events */
    document.addEventListener('change', function (e) {
      if (e.target.closest('[data-filter-cat],[data-filter-discount],[data-filter-stock],[data-filter-rating],[data-shop-sort],[data-price-min],[data-price-max]')) apply();
    });
    if (searchInput) searchInput.addEventListener('input', U.debounce(apply, 220));

    var clearBtns = document.querySelectorAll('[data-clear-filters]');
    clearBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-filter-cat],[data-filter-discount],[data-filter-stock],[data-filter-rating]').forEach(function (i) { i.checked = false; });
        if (searchInput) searchInput.value = '';
        if (minInput) minInput.value = 0;
        if (maxInput) maxInput.value = maxRounded;
        apply();
        SG.toast('Filters cleared', 'info');
      });
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-clear-filters]') && e.target.closest('.empty-state')) {
        document.querySelectorAll('[data-filter-cat],[data-filter-discount],[data-filter-stock],[data-filter-rating]').forEach(function (i) { i.checked = false; });
        if (searchInput) searchInput.value = '';
        apply();
      }
      var vt = e.target.closest('[data-view]');
      if (vt) {
        state.view = vt.dataset.view;
        document.querySelectorAll('[data-view]').forEach(function (b) { b.classList.toggle('is-active', b === vt); });
        render();
      }
      var ft = e.target.closest('[data-filters-toggle]');
      if (ft) {
        document.querySelector('.filters') && document.querySelector('.filters').classList.add('is-open');
        document.querySelector('.filters__scrim') && document.querySelector('.filters__scrim').classList.add('is-open');
      }
      if (e.target.closest('[data-filters-close]') || e.target.classList.contains('filters__scrim')) {
        document.querySelector('.filters') && document.querySelector('.filters').classList.remove('is-open');
        document.querySelector('.filters__scrim') && document.querySelector('.filters__scrim').classList.remove('is-open');
      }
    });

    apply();
  }

  /* ---------------- Category page ---------------- */
  async function initCategory() {
    var grid = document.querySelector('[data-category-grid]');
    if (!grid) return;
    var slug = U.qs('c') || 'kitchen-gadgets';
    grid.innerHTML = skeletons(8);
    try {
      var catRes = await sb.from('categories').select('*');
      var cats = catRes.data || [];
      var cat = cats.find(function (c) { return c.slug === slug; }) || cats.find(function (c) { return c.name.toLowerCase().replace(/\s+/g, '-') === slug; }) || cats[0];
      if (!cat) { errorState(grid, 'Category not found.'); return; }

      document.title = cat.name + ' — Smart Ghar';
      document.querySelectorAll('[data-cat-name]').forEach(function (el) { el.textContent = cat.name; });
      document.querySelectorAll('[data-cat-desc]').forEach(function (el) { el.textContent = cat.description || ''; });
      document.querySelectorAll('[data-cat-icon]').forEach(function (el) { el.textContent = cat.icon || '🛍️'; });
      document.querySelectorAll('[data-cat-crumb]').forEach(function (el) { el.textContent = cat.name; });
      var heroImg = document.querySelector('[data-cat-hero]');
      if (heroImg) heroImg.src = U.safeUrl(cat.image_url, '/images/products/cat-kitchen.png');

      var tabs = document.querySelector('[data-cat-tabs]');
      if (tabs) {
        tabs.innerHTML = cats.map(function (c) {
          return '<a class="btn btn--sm ' + (c.id === cat.id ? 'btn--forest' : 'btn--outline') + '" href="category.html?c=' + encodeURIComponent(c.slug) + '">' +
            U.esc(c.icon || '') + ' ' + U.esc(c.name) + '</a>';
        }).join('');
      }

      var products = await fetchProducts({ category: cat.name, limit: 60 });
      grid.innerHTML = products.length ? products.map(cardHtml).join('') :
        '<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-box-open"></i><p>No products in this category yet.</p></div>';
      var countEl = document.querySelector('[data-cat-count]');
      if (countEl) countEl.textContent = products.length + ' products';
    } catch (err) {
      errorState(grid, 'Could not load this category.');
    }
  }

  /* ---------------- Product detail ---------------- */
  async function initProductDetail() {
    var root = document.querySelector('[data-pd-root]');
    if (!root) return;
    var id = U.qs('id');
    if (!id) {
      root.innerHTML = '<div class="empty-state"><i class="fa-solid fa-box-open"></i><h3 style="font-family:var(--f-body)">Product not specified</h3><a class="btn btn--primary btn--sm" href="shop.html" style="margin-top:14px">Browse Shop</a></div>';
      return;
    }

    var p;
    try {
      var res = await sb.from('products').select('*').eq('id', id).maybeSingle();
      p = res.data;
    } catch (err) { p = null; }

    if (!p) {
      root.innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><h3 style="font-family:var(--f-body)">Product not found</h3><p style="font-size:.86rem;margin-bottom:14px">It may have been removed or the link is incorrect.</p><a class="btn btn--primary btn--sm" href="shop.html">Back to Shop</a></div>';
      return;
    }

    window.__sgProducts[p.id] = p;
    document.title = p.title + ' — Smart Ghar';
    var price = Number(p.sale_price != null ? p.sale_price : p.original_price);
    var save = Number(p.original_price) - price;
    var inStock = Number(p.stock_quantity) > 0;
    var gallery = Array.isArray(p.image_gallery) && p.image_gallery.length ? p.image_gallery : [p.image_url];
    if (gallery.indexOf(p.image_url) === -1) gallery.unshift(p.image_url);
    var features = Array.isArray(p.key_features) ? p.key_features : [];

    root.innerHTML =
      '<div class="pd-layout">' +
        '<div>' +
          '<div class="gallery__main" data-zoom>' +
            '<img src="' + U.esc(U.safeUrl(gallery[0])) + '" alt="' + U.esc(p.title) + '" data-main-img>' +
            '<div class="gallery__badges">' + badges(p) + '</div>' +
          '</div>' +
          '<div class="gallery__thumbs">' +
            gallery.map(function (g, i) {
              return '<button class="' + (i === 0 ? 'is-active' : '') + '" data-thumb="' + U.esc(g) + '"><img src="' + U.esc(U.safeUrl(g)) + '" alt="View ' + (i + 1) + '" loading="lazy"></button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="pd-info">' +
          '<nav class="breadcrumb" style="margin-bottom:12px"><a href="index.html">Home</a><i class="fa-solid fa-chevron-right"></i>' +
            '<a href="shop.html">Shop</a><i class="fa-solid fa-chevron-right"></i>' +
            '<a href="category.html?c=' + encodeURIComponent(p.category.toLowerCase().replace(/\s+/g, '-')) + '">' + U.esc(p.category) + '</a>' +
            '<i class="fa-solid fa-chevron-right"></i><span>' + U.esc(p.title) + '</span></nav>' +
          '<span class="pc-cat">' + U.esc(p.category) + '</span>' +
          '<h1>' + U.esc(p.title) + '</h1>' +
          '<div class="pd-meta">' +
            '<span class="stars">' + U.stars(p.rating) + '</span>' +
            '<span>' + Number(p.rating).toFixed(1) + ' (' + (p.review_count || 0) + ' reviews)</span>' +
            '<span>•</span><span>' + (p.review_count || 0) + ' sold</span>' +
          '</div>' +
          '<div class="pd-price">' +
            '<span class="now">' + U.money(price) + '</span>' +
            (save > 0 ? '<s>' + U.money(p.original_price) + '</s>' : '') +
            (save > 0 ? '<span class="pd-save"><i class="fa-solid fa-tag"></i> Save ' + U.money(save) + ' (' + p.discount_percent + '% OFF)</span>' : '') +
          '</div>' +
          '<div class="pd-stock ' + (inStock ? 'in' : 'out') + '">' +
            '<i class="fa-solid ' + (inStock ? 'fa-circle-check' : 'fa-circle-xmark') + '"></i> ' +
            (inStock ? 'In Stock (' + p.stock_quantity + ' available)' : 'Out of Stock') +
          '</div>' +
          '<p class="pd-short">' + U.esc(p.short_description || '') + '</p>' +
          (features.length ?
            '<div class="feature-box"><h4>Key Features</h4><ul>' +
              features.map(function (f) { return '<li><i class="fa-solid fa-check"></i><span>' + U.esc(f) + '</span></li>'; }).join('') +
            '</ul></div>' : '') +
          '<div class="pd-row" style="margin-bottom:10px">' +
            '<div class="qty qty--lg">' +
              '<button data-pd-dec aria-label="Decrease"><i class="fa-solid fa-minus"></i></button>' +
              '<span data-pd-qty>1</span>' +
              '<button data-pd-inc aria-label="Increase"><i class="fa-solid fa-plus"></i></button>' +
            '</div>' +
            '<span style="display:flex;align-items:center;font-size:.8rem;color:var(--muted)">Max ' + (p.stock_quantity || 0) + '</span>' +
          '</div>' +
          '<div class="pd-buy">' +
            '<button class="btn btn--primary btn--block btn--lg" data-pd-add ' + (inStock ? '' : 'disabled') + '><i class="fa-solid fa-bag-shopping"></i> Add to Cart</button>' +
            '<button class="btn btn--forest btn--block arrow-slide" data-pd-buy ' + (inStock ? '' : 'disabled') + '>Buy Now <i class="fa-solid fa-arrow-right"></i></button>' +
            '<a class="btn btn--wa btn--block" data-pd-wa target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Order on WhatsApp</a>' +
            '<button class="btn btn--outline btn--block" data-wish="' + U.esc(p.id) + '" data-wish-title="' + U.esc(p.title) + '"><i class="fa-regular fa-heart"></i> Add to Wishlist</button>' +
          '</div>' +
          '<div class="delivery-box">' +
            '<div><i class="fa-solid fa-truck-fast"></i><span>Free delivery on orders above ' + U.money(SG.site.freeShipping) + '</span></div>' +
            '<div><i class="fa-solid fa-money-bill-wave"></i><span>Cash on Delivery available all over Pakistan</span></div>' +
            '<div><i class="fa-solid fa-rotate-left"></i><span>7-day easy return policy</span></div>' +
            '<div><i class="fa-brands fa-whatsapp"></i><span>Need help? <a class="link-underline" href="' + U.waLink('Hi Smart Ghar! I have a question about ' + p.title) + '" target="_blank" rel="noopener" style="color:var(--green-700);font-weight:600">Chat on WhatsApp</a></span></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<section class="section section--tight">' +
        '<div class="tabs" role="tablist">' +
          '<button class="is-active" data-tab="desc">Description</button>' +
          '<button data-tab="specs">Specifications</button>' +
          '<button data-tab="reviews">Reviews (' + (p.review_count || 0) + ')</button>' +
        '</div>' +
        '<div class="tab-panel is-active" data-panel="desc"><div class="story" style="margin:0">' +
          U.esc(p.full_description || p.short_description || '').split('\n').filter(Boolean).map(function (para) { return '<p>' + para + '</p>'; }).join('') +
        '</div></div>' +
        '<div class="tab-panel" data-panel="specs">' +
          '<table class="spec-table"><tbody>' +
            '<tr><th>Category</th><td>' + U.esc(p.category) + '</td></tr>' +
            '<tr><th>Available Stock</th><td>' + (p.stock_quantity || 0) + ' units</td></tr>' +
            '<tr><th>Rating</th><td>' + Number(p.rating).toFixed(1) + ' / 5 (' + (p.review_count || 0) + ' reviews)</td></tr>' +
            '<tr><th>Warranty</th><td>7-day replacement for damaged items</td></tr>' +
            '<tr><th>Delivery</th><td>2–4 working days across Pakistan</td></tr>' +
            '<tr><th>Payment</th><td>Cash on Delivery, Bank Transfer, EasyPaisa / JazzCash</td></tr>' +
          '</tbody></table>' +
        '</div>' +
        '<div class="tab-panel" data-panel="reviews"><div data-pd-reviews><div style="text-align:center;padding:20px"><span class="spinner spinner--green"></span></div></div></div>' +
      '</section>' +
      '<section class="section section--tight" data-related-section>' +
        '<div class="section-head"><h2>You May Also <em>Like</em></h2><p>Handpicked from the same category</p></div>' +
        '<div class="product-grid" data-related-grid></div>' +
      '</section>';

    /* WhatsApp link */
    var wa = root.querySelector('[data-pd-wa]');
    wa.href = U.waLink('Hi Smart Ghar! I want to order:\n\n📦 Product: ' + p.title + '\n💰 Price: ' + U.money(price) + '\n\nPlease confirm availability.');

    /* qty */
    var qtyEl = root.querySelector('[data-pd-qty]');
    var maxQty = Math.max(1, Number(p.stock_quantity) || 1);
    root.querySelector('[data-pd-inc]').addEventListener('click', function () {
      qtyEl.textContent = Math.min(maxQty, Number(qtyEl.textContent) + 1);
    });
    root.querySelector('[data-pd-dec]').addEventListener('click', function () {
      qtyEl.textContent = Math.max(1, Number(qtyEl.textContent) - 1);
    });
    root.querySelector('[data-pd-add]').addEventListener('click', function () {
      SG.cart.add(p, Number(qtyEl.textContent));
    });
    root.querySelector('[data-pd-buy]').addEventListener('click', function () {
      SG.cart.add(p, Number(qtyEl.textContent), { open: false, toast: false });
      window.location.href = 'checkout.html';
    });

    /* gallery */
    root.querySelectorAll('[data-thumb]').forEach(function (b) {
      b.addEventListener('click', function () {
        root.querySelector('[data-main-img]').src = b.dataset.thumb;
        root.querySelectorAll('[data-thumb]').forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
      });
    });
    var zoom = root.querySelector('[data-zoom]');
    if (window.matchMedia('(min-width:1024px)').matches) {
      zoom.addEventListener('mousemove', function (e) {
        var img = zoom.querySelector('img');
        if (!zoom.classList.contains('is-zoomed')) return;
        var r = zoom.getBoundingClientRect();
        img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
      });
      zoom.addEventListener('click', function () { zoom.classList.toggle('is-zoomed'); });
    } else {
      /* swipe gallery on mobile */
      var startX = 0;
      zoom.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
      zoom.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) < 40) return;
        var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-thumb]'));
        var idx = thumbs.findIndex(function (t) { return t.classList.contains('is-active'); });
        idx = (idx + (dx < 0 ? 1 : -1) + thumbs.length) % thumbs.length;
        thumbs[idx].click();
      }, { passive: true });
    }

    /* tabs */
    root.querySelectorAll('[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.remove('is-active'); });
        root.querySelectorAll('[data-panel]').forEach(function (pn) { pn.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var panel = root.querySelector('[data-panel="' + btn.dataset.tab + '"]');
        if (panel) panel.classList.add('is-active');
      });
    });

    /* reviews */
    loadReviews(p, root.querySelector('[data-pd-reviews]'));

    /* related */
    try {
      var rel = await fetchProducts({ category: p.category, limit: 5 });
      var filtered = rel.filter(function (x) { return x.id !== p.id; }).slice(0, 4);
      var relGrid = root.querySelector('[data-related-grid]');
      if (!filtered.length) {
        var fallback = await fetchProducts({ limit: 5 });
        filtered = fallback.filter(function (x) { return x.id !== p.id; }).slice(0, 4);
      }
      relGrid.innerHTML = filtered.map(cardHtml).join('');
      if (!filtered.length) root.querySelector('[data-related-section]').remove();
    } catch (e) {}
  }

  async function loadReviews(product, el) {
    if (!el) return;
    try {
      var res = await sb.from('reviews').select('*').eq('product_id', product.id).eq('is_approved', true).order('created_at', { ascending: false }).limit(20);
      var reviews = res.data || [];
      var counts = [5, 4, 3, 2, 1].map(function (star) {
        return reviews.filter(function (r) { return Number(r.rating) === star; }).length;
      });
      var totalReal = reviews.length || 1;
      var bars = [5, 4, 3, 2, 1].map(function (star, i) {
        var pct = reviews.length ? Math.round((counts[i] / totalReal) * 100) : (star === 5 ? 70 : star === 4 ? 20 : 5);
        return '<div><span style="width:26px">' + star + '★</span><span class="bar"><i style="width:' + pct + '%"></i></span><span style="width:34px;text-align:right">' + pct + '%</span></div>';
      }).join('');

      var list = reviews.length ? reviews.map(function (r) {
        var initials = (r.customer_name || 'C').split(' ').map(function (s) { return s.charAt(0); }).join('').slice(0, 2).toUpperCase();
        return '<div class="review-item">' +
          '<div class="review-item__top"><span class="avatar" style="width:38px;height:38px;font-size:.76rem">' + U.esc(initials) + '</span>' +
          '<div><b style="font-size:.86rem">' + U.esc(r.customer_name) + '</b><div class="stars" style="font-size:.7rem">' + U.stars(r.rating) + '</div></div>' +
          '<time>' + U.date(r.created_at) + '</time></div>' +
          '<p>' + U.esc(r.review_text) + '</p></div>';
      }).join('') : '<p style="color:var(--muted);font-size:.88rem">No written reviews yet — be the first to review this product.</p>';

      el.innerHTML =
        '<div class="rating-summary">' +
          '<div class="rating-big"><b>' + Number(product.rating).toFixed(1) + '</b>' +
            '<div class="stars">' + U.stars(product.rating) + '</div>' +
            '<small style="color:var(--muted);font-size:.76rem">' + (product.review_count || 0) + ' verified ratings</small></div>' +
          '<div class="rating-bars">' + bars + '</div>' +
        '</div>' +
        list +
        '<button class="btn btn--outline btn--sm" data-write-review style="margin-top:16px"><i class="fa-solid fa-pen"></i> Write a Review</button>' +
        '<form data-review-form style="display:none;margin-top:16px" class="card-box">' +
          '<div class="field"><label>Your Name <span class="req">*</span></label><input name="name" required maxlength="60" placeholder="e.g. Ayesha K."></div>' +
          '<div class="field"><label>Rating <span class="req">*</span></label><select name="rating" required>' +
            '<option value="5">★★★★★ Excellent</option><option value="4">★★★★ Good</option><option value="3">★★★ Average</option><option value="2">★★ Poor</option><option value="1">★ Bad</option>' +
          '</select></div>' +
          '<div class="field"><label>Your Review <span class="req">*</span></label><textarea name="text" required maxlength="500" placeholder="Share your experience with this product…"></textarea></div>' +
          '<button class="btn btn--primary btn--sm" type="submit">Submit Review</button>' +
        '</form>';

      el.querySelector('[data-write-review]').addEventListener('click', function () {
        var form = el.querySelector('[data-review-form]');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
      });
      el.querySelector('[data-review-form]').addEventListener('submit', async function (e) {
        e.preventDefault();
        var f = e.target;
        var q = function (n) { var c = f.querySelector('[name="' + n + '"]'); return c ? c.value : ''; };
        var payload = {
          product_id: product.id,
          customer_name: q('name').trim().slice(0, 60),
          rating: Number(q('rating')),
          review_text: q('text').trim().slice(0, 500),
          is_approved: false
        };
        if (!payload.customer_name || !payload.review_text) return;
        try {
          var ins = await sb.from('reviews').insert(payload);
          if (ins.error) throw ins.error;
          f.reset();
          f.style.display = 'none';
          SG.toast('Thanks! Your review will appear after approval.', 'success');
        } catch (err) {
          SG.toast('Could not submit review. Please try again.', 'error');
        }
      });
    } catch (err) {
      el.innerHTML = '<p style="color:var(--muted)">Reviews are unavailable right now.</p>';
    }
  }

  /* ---------------- Boot by page ---------------- */
  function boot() {
    initQuickView();
    if (document.querySelector('[data-featured-grid]')) initHome();
    if (document.querySelector('[data-shop-grid]')) initShop();
    if (document.querySelector('[data-category-grid]')) initCategory();
    if (document.querySelector('[data-pd-root]')) initProductDetail();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
