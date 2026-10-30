/* ==========================================================
   SMART GHAR — Admin image picker
   Turns every image URL field into "Choose from Gallery" with
   automatic compression + Supabase Storage upload.
   ========================================================== */
(function (window, document) {
  'use strict';

  var BUCKET = 'product-images';
  var MAX_UPLOAD = 12 * 1024 * 1024; // 12 MB before compression
  var MAX_DIM = 1400;                // longest edge after compression
  var KEEP_BYTES = 600 * 1024;       // keep originals that are already small

  function client() { return (window.SG && window.SG.sb) || null; }
  function esc(v) { return (window.SG && SG.utils && SG.utils.esc) ? SG.utils.esc(v) : String(v || ''); }
  function safe(v) {
    if (window.SG && SG.utils && SG.utils.safeUrl) return SG.utils.safeUrl(v);
    return v;
  }
  function toast(msg, type, ms) {
    if (window.SG && SG.toast) SG.toast(msg, type, ms);
  }

  /* ---------------- Compression ---------------- */
  function compress(file) {
    return new Promise(function (resolve) {
      if (!file || !/^image\//.test(file.type || '')) return resolve(file);
      if (/gif|svg/.test(file.type)) return resolve(file); // never re-encode these
      if (!window.URL || !URL.createObjectURL) return resolve(file);

      var objUrl = URL.createObjectURL(file);
      var img = new Image();

      img.onload = function () {
        var done = function (out) { URL.revokeObjectURL(objUrl); resolve(out); };
        try {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          if (!w || !h) return done(file);

          var scale = Math.min(1, MAX_DIM / Math.max(w, h));
          var small = file.size <= KEEP_BYTES;
          if (scale === 1 && small) return done(file); // already web-sized

          var cw = Math.max(1, Math.round(w * scale));
          var ch = Math.max(1, Math.round(h * scale));
          var canvas = document.createElement('canvas');
          canvas.width = cw;
          canvas.height = ch;
          var ctx = canvas.getContext && canvas.getContext('2d');
          if (!ctx) return done(file);

          ctx.fillStyle = '#ffffff'; // flatten transparency when converting to jpeg
          ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);

          if (!canvas.toBlob) return done(file);
          canvas.toBlob(function (blob) {
            if (!blob) return done(file);
            var name = String(file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg';
            try {
              done(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
            } catch (e) {
              blob.name = name;
              done(blob);
            }
          }, 'image/jpeg', 0.86);
        } catch (e) {
          done(file);
        }
      };
      img.onerror = function () { URL.revokeObjectURL(objUrl); resolve(file); };
      img.src = objUrl;
    });
  }

  function extOf(file) {
    var m = String(file.name || '').match(/\.([a-z0-9]+)$/i);
    if (m) return m[1].toLowerCase();
    var t = String(file.type || '').split('/')[1] || 'jpg';
    return t === 'jpeg' ? 'jpg' : t;
  }

  function friendly(err) {
    var msg = (err && (err.message || err.error_description)) || '';
    if (/bucket/i.test(msg) || /not found/i.test(msg)) return 'Image storage is not ready yet (missing bucket).';
    if (/row-level security|permission|denied|401|403/i.test(msg)) return 'Upload blocked — please sign in again.';
    if (/payload|too large|size/i.test(msg)) return 'This photo is too large. Try a smaller one.';
    return msg || 'Upload failed. Please try again.';
  }

  /* ---------------- Upload ---------------- */
  async function upload(file, folder) {
    var sb = client();
    if (!sb) throw new Error('Supabase is not connected.');
    if (!/^image\//.test(file.type || '')) throw new Error('Only image files can be uploaded.');
    if (file.size > MAX_UPLOAD) throw new Error('Photo is too large (max 12 MB).');

    var prepared = await compress(file);
    var path = (folder || 'misc') + '/' +
      new Date().toISOString().slice(0, 10) + '-' +
      Date.now().toString(36) + '-' +
      Math.random().toString(36).slice(2, 7) + '.' + extOf(prepared);

    var res = await sb.storage.from(BUCKET).upload(path, prepared, {
      cacheControl: '31536000',
      contentType: prepared.type || 'image/jpeg',
      upsert: false
    });
    if (res && res.error) throw new Error(friendly(res.error));

    var pub = sb.storage.from(BUCKET).publicUrl(path);
    var url = (pub && pub.data && pub.data.publicUrl) || '';
    if (!url) throw new Error('Upload worked but the public URL could not be created.');
    return url;
  }

  /* ---------------- Widget ---------------- */
  function split(v) {
    return String(v || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function render(wrap, input, cfg) {
    var prev = wrap.querySelector('[data-imgp-preview]');
    if (!prev) return;
    var list = split(input.value);
    var label = cfg.label || 'photo';

    if (!list.length) {
      prev.innerHTML = '<div class="imgp__empty"><i class="fa-regular fa-image"></i><span>No ' + esc(label) + ' yet</span></div>';
      return;
    }

    if (!cfg.multi) {
      prev.innerHTML = '<div class="imgp__thumb"><img src="' + esc(safe(list[0])) + '" alt="' + esc(label) + '"></div>';
      return;
    }

    prev.innerHTML = list.map(function (u, i) {
      return '<div class="imgp__thumb">' +
        '<img src="' + esc(safe(u)) + '" alt="' + esc(label) + ' ' + (i + 1) + '">' +
        '<button type="button" class="imgp__x" data-imgp-remove="' + i + '" aria-label="Remove photo">' +
          '<i class="fa-solid fa-xmark"></i>' +
        '</button>' +
      '</div>';
    }).join('');
  }

  function build(field, cfg) {
    if (!field) return;
    var input = field.querySelector('[name="' + cfg.name + '"]');
    if (!input || input.dataset.imgpReady === '1') return;
    input.dataset.imgpReady = '1';
    input.classList.add('imgp__url');

    var wrap = document.createElement('div');
    wrap.className = 'imgp' + (cfg.multi ? ' imgp--multi' : '');
    wrap.innerHTML =
      '<div class="imgp__preview" data-imgp-preview></div>' +
      '<div class="imgp__actions">' +
        '<button type="button" class="btn btn--primary btn--sm imgp__pick" data-imgp-pick>' +
          '<i class="fa-solid fa-images"></i> ' + (cfg.multi ? 'Add Photos' : 'Choose from Gallery') +
        '</button>' +
        '<button type="button" class="btn btn--outline btn--sm" data-imgp-url>' +
          '<i class="fa-solid fa-link"></i> URL' +
        '</button>' +
      '</div>' +
      '<input type="file" class="imgp__file" accept="image/*"' + (cfg.multi ? ' multiple' : '') + ' hidden>';

    input.parentNode.insertBefore(wrap, input.nextSibling);

    var fileInput = wrap.querySelector('input[type="file"]');
    var pickBtn = wrap.querySelector('[data-imgp-pick]');
    var urlBtn = wrap.querySelector('[data-imgp-url]');

    pickBtn.addEventListener('click', function () {
      if (!client()) { toast('Supabase is not connected.', 'error'); return; }
      fileInput.click();
    });

    urlBtn.addEventListener('click', function () {
      var open = input.classList.toggle('imgp__url--open');
      urlBtn.classList.toggle('is-active', open);
      input.style.display = open ? 'block' : 'none';
      if (open) { input.focus(); input.select && input.select(); }
    });

    fileInput.addEventListener('change', async function () {
      var files = Array.prototype.slice.call(fileInput.files || []);
      if (!files.length) return;

      var original = pickBtn.innerHTML;
      pickBtn.disabled = true;
      var added = [];

      try {
        for (var i = 0; i < files.length; i++) {
          pickBtn.innerHTML = '<span class="spinner spinner--sm"></span> Uploading ' +
            (files.length > 1 ? (i + 1) + '/' + files.length : '…');
          added.push(await upload(files[i], cfg.folder));
        }

        if (cfg.multi) {
          input.value = split(input.value).concat(added).join(', ');
        } else {
          input.value = added[0];
        }
        render(wrap, input, cfg);
        toast(added.length > 1 ? added.length + ' photos uploaded' : 'Photo uploaded', 'success');
      } catch (err) {
        console.error('[SmartGhar] image upload', err);
        toast(friendly(err), 'error', 5000);
      } finally {
        pickBtn.disabled = false;
        pickBtn.innerHTML = original;
        fileInput.value = '';
      }
    });

    wrap.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-imgp-remove]');
      if (!rm) return;
      var list = split(input.value);
      list.splice(Number(rm.dataset.imgpRemove), 1);
      input.value = list.join(', ');
      render(wrap, input, cfg);
    });

    render(wrap, input, cfg);
  }

  var TARGETS = [
    { form: '[data-product-form]', name: 'image_url', folder: 'products', label: 'photo' },
    { form: '[data-product-form]', name: 'image_gallery', folder: 'products', multi: true, label: 'photo' },
    { form: '[data-category-form]', name: 'image_url', folder: 'categories', label: 'image' },
    { form: '[data-settings-form]', name: 'logo_url', folder: 'brand', label: 'logo' }
  ];

  var built = [];

  function init() {
    built = [];
    TARGETS.forEach(function (cfg) {
      var field = document.querySelector(cfg.form + ' [name="' + cfg.name + '"]');
      if (!field) return;
      var fieldWrap = field.closest('.field') || field.parentNode;
      build(fieldWrap, cfg);
      var wrap = field.parentNode.querySelector('.imgp');
      if (wrap) built.push({ input: field, wrap: wrap, cfg: cfg });
    });
  }

  function syncAll() {
    if (!built.length) init();
    built.forEach(function (b) { render(b.wrap, b.input, b.cfg); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SGImages = { sync: syncAll, reinit: init, upload: upload, compress: compress, BUCKET: BUCKET };
})(window, document);
