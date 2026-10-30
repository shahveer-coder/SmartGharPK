"""One-off page assembler: composes shared header/footer into static HTML pages."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def head(title, desc, extra_css="", extra_head="", canonical=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="keywords" content="kitchen gadgets Pakistan, home appliances COD, online shopping Karachi, smart home products, kitchen tools PK">
  <meta name="theme-color" content="#14532d">
  <link rel="canonical" href="https://smart-ghar-pk.vercel.app/{canonical}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="/images/logo.png">
  <meta property="og:type" content="website">
  <link rel="icon" href="/images/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/images/logo.png">
  <link rel="preload" href="/vendor/fonts/poppins-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/vendor/fa/css/all.min.css">
  <link rel="stylesheet" href="/vendor/aos.css">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/animations.css">{extra_css}
  {extra_head}
</head>
<body>
  <div class="page-loader"><div class="page-loader__spinner"></div></div>
  <div class="scroll-progress"></div>
"""


ANNOUNCE = """
  <div class="announce">
    <div class="announce__track">
      <span data-announce-text>🚚 Cash on Delivery All Over Pakistan 🇵🇰 | Free Shipping Above PKR 3,000</span>
      <span>✨ 100% Original Products — 7 Day Easy Returns</span>
      <span data-announce-text>🚚 Cash on Delivery All Over Pakistan 🇵🇰 | Free Shipping Above PKR 3,000</span>
      <span>✨ 100% Original Products — 7 Day Easy Returns</span>
    </div>
    <button class="announce__close" aria-label="Close announcement" style="display:grid"><i class="fa-solid fa-xmark"></i></button>
  </div>
"""

HEADER = """
  <header class="header">
    <div class="container header__inner">
      <a class="brand" href="index.html" aria-label="Smart Ghar home">
        <img class="logo-pop" src="/images/logo.png" alt="Smart Ghar logo" width="50" height="50">
        <span class="brand__text"><b>SMART <span>GHAR</span></b><small>Kitchen &amp; Home Gadgets</small></span>
      </a>
      <nav class="nav" aria-label="Main navigation">
        <a href="index.html">Home</a>
        <a href="shop.html">Shop</a>
        <a href="category.html?c=kitchen-gadgets">Categories</a>
        <a href="about.html">About</a>
        <a href="track-order.html">Track Order</a>
      </nav>
      <div class="header__actions">
        <button class="icon-btn" data-open-search aria-label="Search products"><i class="fa-solid fa-magnifying-glass"></i></button>
        <button class="icon-btn" data-open-cart aria-label="Open cart">
          <i class="fa-solid fa-bag-shopping" data-cart-icon></i>
          <span class="cart-badge is-empty" data-cart-count>0</span>
        </button>
        <a class="icon-btn icon-btn--wa" data-wa-link data-wa-text="Hi Smart Ghar! I need help with my order." aria-label="Chat on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
        <button class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>

  <div class="mobile-menu" id="mobileMenu">
    <div class="mobile-menu__head">
      <a class="brand" href="index.html">
        <img src="/images/logo.png" alt="Smart Ghar" width="44" height="44">
        <span class="brand__text"><b>SMART <span>GHAR</span></b><small>Kitchen &amp; Home Gadgets</small></span>
      </a>
      <button class="icon-btn" data-menu-close aria-label="Close menu"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <nav class="mobile-menu__links">
      <a href="index.html">Home <i class="fa-solid fa-arrow-right"></i></a>
      <a href="shop.html">Shop All <i class="fa-solid fa-arrow-right"></i></a>
      <a href="category.html?c=kitchen-gadgets">Categories <i class="fa-solid fa-arrow-right"></i></a>
      <a href="about.html">About Us <i class="fa-solid fa-arrow-right"></i></a>
      <a href="track-order.html">Track Order <i class="fa-solid fa-arrow-right"></i></a>
      <a href="checkout.html">Checkout <i class="fa-solid fa-arrow-right"></i></a>
    </nav>
    <div class="mobile-menu__cta">
      <a class="btn btn--wa" data-wa-link data-wa-text="Hi Smart Ghar! I need help choosing a product."><i class="fa-brands fa-whatsapp"></i> Chat on WhatsApp</a>
      <a class="btn btn--outline" href="shop.html">Start Shopping</a>
    </div>
    <div class="mobile-menu__foot">
      <p><i class="fa-solid fa-truck-fast"></i> Cash on Delivery all over Pakistan</p>
      <p style="margin-top:6px"><i class="fa-solid fa-phone"></i> <span data-wa-display>+92 318 2158561</span></p>
    </div>
  </div>

  <div class="search-overlay" role="dialog" aria-modal="true" aria-label="Search products">
    <div class="search-overlay__box">
      <form class="search-field" role="search">
        <i class="fa-solid fa-magnifying-glass" style="color:var(--muted)"></i>
        <input type="search" placeholder="Search for chopper, air fryer, lamp…" aria-label="Search products" autocomplete="off">
        <button class="btn btn--primary btn--sm" type="submit">Search</button>
      </form>
      <div class="search-results"></div>
    </div>
  </div>
"""

FOOTER = """
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <img src="/images/logo.png" alt="Smart Ghar" width="80" height="80" loading="lazy">
          <p>Smart Ghar brings premium kitchen &amp; home gadgets to Pakistani homes — honest quality, fair prices and delivery you can rely on.</p>
          <p class="footer__made" style="font-size:.8rem;color:#dcfce7;font-style:italic">Smart Home. Easy Life.</p>
          <div class="socials">
            <a href="https://instagram.com/smartghar.pk" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="https://facebook.com/smartghar.pk" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="https://tiktok.com/@smartghar.pk" target="_blank" rel="noopener" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
            <a href="https://youtube.com/@smartghar.pk" target="_blank" rel="noopener" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
          </div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="index.html"><i class="fa-solid fa-chevron-right"></i> Home</a></li>
            <li><a href="shop.html"><i class="fa-solid fa-chevron-right"></i> Shop All</a></li>
            <li><a href="about.html"><i class="fa-solid fa-chevron-right"></i> About Us</a></li>
            <li><a href="track-order.html"><i class="fa-solid fa-chevron-right"></i> Track Order</a></li>
            <li><a data-wa-link data-wa-text="Hi Smart Ghar! I need help." href="#"><i class="fa-solid fa-chevron-right"></i> Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4>Categories</h4>
          <ul>
            <li><a href="category.html?c=kitchen-gadgets"><i class="fa-solid fa-chevron-right"></i> Kitchen Gadgets</a></li>
            <li><a href="category.html?c=home-essentials"><i class="fa-solid fa-chevron-right"></i> Home Essentials</a></li>
            <li><a href="category.html?c=storage-solutions"><i class="fa-solid fa-chevron-right"></i> Storage Solutions</a></li>
            <li><a href="category.html?c=gift-items"><i class="fa-solid fa-chevron-right"></i> Gift Items</a></li>
          </ul>
        </div>
        <div>
          <h4>Get In Touch</h4>
          <ul class="footer__contact">
            <li><i class="fa-solid fa-location-dot"></i><span>Karachi, Pakistan</span></li>
            <li><i class="fa-brands fa-whatsapp"></i><a data-wa-link data-wa-text="Hi Smart Ghar! I need help." href="#"><span data-wa-display>+92 318 2158561</span></a></li>
            <li><i class="fa-solid fa-envelope"></i><a href="mailto:info@smartghar.pk" data-store-email>info@smartghar.pk</a></li>
            <li><i class="fa-solid fa-clock"></i><span>24/7 WhatsApp Support</span></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© <span data-year>2025</span> Smart Ghar. All Rights Reserved.</span>
        <div class="pay-icons"><span>COD</span><span>EasyPaisa</span><span>JazzCash</span><span>Bank Transfer</span></div>
      </div>
    </div>
  </footer>
"""

FLOAT = """
  <a class="wa-float" data-wa-link data-wa-text="Hi Smart Ghar! I need help with my order." aria-label="Chat on WhatsApp">
    <i class="fa-brands fa-whatsapp"></i><span class="wa-float__tip">Chat with us!</span>
  </a>
  <button class="to-top" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>

  <nav class="bottom-nav" aria-label="Mobile quick navigation">
    <a href="index.html"><i class="fa-solid fa-house"></i> Home</a>
    <a href="shop.html"><i class="fa-solid fa-bag-shopping"></i> Shop</a>
    <a class="bn-wa" data-wa-link data-wa-text="Hi Smart Ghar! I need help." href="#"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
    <a data-open-cart href="#"><i class="fa-solid fa-cart-shopping"></i> Cart <span class="cart-badge bn-badge is-empty" data-cart-count>0</span></a>
    <a href="track-order.html"><i class="fa-solid fa-user"></i> Account</a>
  </nav>
"""

SCRIPTS = """
  <script src="/vendor/supabase.js"></script>
  <script src="/vendor/aos.js"></script>
  <script src="/js/supabase-config.js"></script>
  <script src="/js/cart.js"></script>
  <script src="/js/main.js"></script>
"""

STORE_SCRIPTS = SCRIPTS + '  <script src="/js/store.js"></script>\n'

TAIL = """</body>
</html>
"""


def page(filename, html):
    with open(os.path.join(ROOT, filename), "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", filename, len(html) // 1024, "KB")


# ------------------------------------------------------------------ product detail
page("product-detail.html",
     head("Product — Smart Ghar | Kitchen &amp; Home Gadgets",
          "View product details, features and customer reviews. Cash on delivery all over Pakistan.",
          canonical="product-detail.html")
     + ANNOUNCE + HEADER + """
  <main>
    <div class="section" style="padding-top:24px">
      <div class="container" data-pd-root>
        <div class="pd-layout">
          <div class="skeleton" style="aspect-ratio:1;border-radius:16px"></div>
          <div style="display:grid;gap:12px">
            <div class="skeleton" style="height:16px;width:35%"></div>
            <div class="skeleton" style="height:34px;width:85%"></div>
            <div class="skeleton" style="height:16px;width:50%"></div>
            <div class="skeleton" style="height:28px;width:40%"></div>
            <div class="skeleton" style="height:90px"></div>
            <div class="skeleton" style="height:52px;border-radius:999px"></div>
            <div class="skeleton" style="height:52px;border-radius:999px"></div>
          </div>
        </div>
      </div>
    </div>

    <section class="section section--cream section--tight">
      <div class="container">
        <div class="value-grid">
          <article class="value-card"><span class="ic"><i class="fa-solid fa-truck-fast"></i></span><h3>Fast Delivery</h3><p>2–4 working days to all major cities in Pakistan.</p></article>
          <article class="value-card"><span class="ic"><i class="fa-solid fa-money-bill-wave"></i></span><h3>Cash on Delivery</h3><p>Pay only when the parcel reaches your hands.</p></article>
          <article class="value-card"><span class="ic"><i class="fa-solid fa-rotate-left"></i></span><h3>7-Day Returns</h3><p>Damaged or wrong item? We replace it quickly.</p></article>
        </div>
      </div>
    </section>
  </main>
""" + FOOTER + FLOAT + STORE_SCRIPTS + TAIL)


# ------------------------------------------------------------------ category
page("category.html",
     head("Shop by Category — Smart Ghar",
          "Explore Smart Ghar categories: kitchen gadgets, home essentials, storage solutions and gift items with cash on delivery.",
          canonical="category.html")
     + ANNOUNCE + HEADER + """
  <main>
    <div class="page-head">
      <div class="container">
        <nav class="breadcrumb"><a href="index.html">Home</a><i class="fa-solid fa-chevron-right"></i><a href="shop.html">Shop</a><i class="fa-solid fa-chevron-right"></i><span data-cat-crumb>Category</span></nav>
        <h1><span data-cat-icon>🛍️</span> <span data-cat-name>Category</span></h1>
        <p data-cat-desc>Loading…</p>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px" data-cat-tabs></div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px">
          <span class="count" data-cat-count style="color:var(--muted);font-size:.84rem"></span>
          <a class="btn btn--outline btn--sm" href="shop.html"><i class="fa-solid fa-sliders"></i> All Filters</a>
        </div>
        <div class="product-grid product-grid--4" data-category-grid></div>
      </div>
    </div>

    <section class="section section--cream section--tight">
      <div class="container">
        <div class="newsletter" data-aos="fade-up">
          <h2>Looking for something specific?</h2>
          <p>Tell us what you need and we will source it for you at the best price.</p>
          <div class="center"><a class="btn btn--wa btn--lg" data-wa-link data-wa-text="Hi Smart Ghar! I am looking for a specific product."><i class="fa-brands fa-whatsapp"></i> Ask on WhatsApp</a></div>
        </div>
      </div>
    </section>
  </main>
""" + FOOTER + FLOAT + STORE_SCRIPTS + TAIL)


# ------------------------------------------------------------------ track order
page("track-order.html",
     head("Track Your Order — Smart Ghar", "Track your Smart Ghar order status in real time with your order ID or phone number.",
          canonical="track-order.html")
     + ANNOUNCE + HEADER + """
  <main>
    <div class="page-head">
      <div class="container">
        <nav class="breadcrumb"><a href="index.html">Home</a><i class="fa-solid fa-chevron-right"></i><span>Track Order</span></nav>
        <h1>Track Your Order</h1>
        <p>Enter your order ID (e.g. SG-00123) or the phone number you ordered with.</p>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="track-card">
          <form class="track-search" data-track-form>
            <input type="text" placeholder="SG-00123 or 03XX XXXXXXX" aria-label="Order ID or phone number" required data-track-input>
            <button class="btn btn--primary" type="submit"><i class="fa-solid fa-magnifying-glass"></i> Track Order</button>
          </form>
          <p style="font-size:.76rem;color:var(--muted);margin-top:10px">
            Can't find your order? <a class="link-underline" data-wa-link data-wa-text="Hi Smart Ghar! I need help tracking my order." style="color:var(--green-700);font-weight:600">Message us on WhatsApp</a>
          </p>

          <div data-track-result style="margin-top:24px"></div>
        </div>
      </div>
    </div>
  </main>
""" + FOOTER + FLOAT + SCRIPTS + '  <script src="/js/track.js"></script>\n' + TAIL)


# ------------------------------------------------------------------ about
page("about.html",
     head("About Smart Ghar — Kitchen &amp; Home Gadgets Pakistan",
          "Smart Ghar is a Pakistani home-gadget brand delivering thoughtfully selected kitchen and home products with cash on delivery.",
          canonical="about.html")
     + ANNOUNCE + HEADER + """
  <main>
    <section class="about-hero">
      <div class="container about-hero__grid">
        <div data-aos="fade-right">
          <span class="eyebrow" style="display:inline-flex;gap:8px;align-items:center;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:var(--green-700);background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.22);padding:7px 14px;border-radius:999px;margin-bottom:14px">
            <i class="fa-solid fa-house"></i> Our Story
          </span>
          <h1 style="font-size:clamp(1.9rem,6vw,3rem);margin-bottom:14px">A smarter home, made <em style="font-style:normal;color:var(--green)">simple</em></h1>
          <p class="lead">Smart Ghar is a Pakistani home &amp; kitchen gadget brand built around one belief — everyday tools should make life easier, not more complicated.</p>
          <div class="about-stats">
            <div><b>10,000+</b><small>Happy customers</small></div>
            <div><b>4.9/5</b><small>Average rating</small></div>
            <div><b>2–4</b><small>Days delivery</small></div>
            <div><b>7 Days</b><small>Easy returns</small></div>
          </div>
        </div>
        <div class="hero-visual" data-aos="zoom-in">
          <div class="hero__sphere" style="width:min(80vw,340px)">
            <img src="/images/logo.png" alt="Smart Ghar logo" width="300" height="300">
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head" data-aos="fade-up">
          <span class="eyebrow"><i class="fa-solid fa-book-open"></i> How we started</span>
          <h2>Our <em>Story</em></h2>
        </div>
        <div class="story">
          <p>Smart Ghar started with a simple observation: Pakistani families were paying too much for everyday home products — and often receiving items that broke within weeks. We wanted to change that with a brand people could actually trust.</p>
          <p>So we began hand-picking kitchen and home gadgets, testing each one in real kitchens, comparing quality, and negotiating directly with manufacturers to keep prices honest. Only products we would use in our own homes made the cut.</p>
          <p>Today Smart Ghar delivers across Pakistan with cash on delivery, WhatsApp support before and after your purchase, and a straightforward 7-day return policy. No gimmicks — just good products, fairly priced and delivered on time.</p>
        </div>
      </div>
    </section>

    <section class="section section--cream">
      <div class="container">
        <div class="value-grid">
          <article class="value-card" data-aos="fade-up">
            <span class="ic"><i class="fa-solid fa-bullseye"></i></span>
            <h3>Our Mission</h3>
            <p>To make everyday home life in Pakistan easier and more affordable — one dependable gadget at a time.</p>
          </article>
          <article class="value-card" data-aos="fade-up" data-aos-delay="100">
            <span class="ic"><i class="fa-solid fa-eye"></i></span>
            <h3>Our Vision</h3>
            <p>To become Pakistan's most trusted home-gadget brand by putting quality and honest service first.</p>
          </article>
          <article class="value-card" data-aos="fade-up" data-aos-delay="200">
            <span class="ic"><i class="fa-solid fa-handshake-angle"></i></span>
            <h3>Our Values</h3>
            <p>Real quality checks, transparent pricing, fast replies and respect for every single customer.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head" data-aos="fade-up">
          <span class="eyebrow"><i class="fa-solid fa-star"></i> What makes us different</span>
          <h2>Why We're <em>Different</em></h2>
        </div>
        <div class="value-grid">
          <article class="value-card" data-aos="fade-up">
            <span class="ic"><i class="fa-solid fa-magnifying-glass-chart"></i></span>
            <h3>Tested Before We Sell</h3>
            <p>Every product is checked for build quality, packaging and usability before it goes live on the store.</p>
          </article>
          <article class="value-card" data-aos="fade-up" data-aos-delay="100">
            <span class="ic"><i class="fa-solid fa-comments"></i></span>
            <h3>Human Support, Real Fast</h3>
            <p>A real person answers your WhatsApp message — no bots, no waiting for days.</p>
          </article>
          <article class="value-card" data-aos="fade-up" data-aos-delay="200">
            <span class="ic"><i class="fa-solid fa-hand-holding-heart"></i></span>
            <h3>Cash on Delivery</h3>
            <p>See the parcel before you pay. If something is wrong, our 7-day return policy has you covered.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section--cream">
      <div class="container">
        <div class="section-head" data-aos="fade-up">
          <span class="eyebrow"><i class="fa-solid fa-quote-left"></i> Testimonials</span>
          <h2>Loved by <em>Pakistani Homes</em></h2>
        </div>
        <div class="review-grid">
          <article class="review-card" data-aos="flip-left">
            <span class="quote">”</span>
            <div class="review-card__top"><span class="avatar">AK</span><div><b>Ayesha K.</b><small>Karachi</small></div></div>
            <div class="stars" style="margin-bottom:8px">★★★★★</div>
            <p>“Ordered the chopper and a spice rack. Both arrived in three days, packed beautifully and working perfectly. This is how online shopping should feel.”</p>
            <span class="verified"><i class="fa-solid fa-circle-check"></i> Verified Purchase</span>
          </article>
          <article class="review-card" data-aos="flip-left" data-aos-delay="100">
            <span class="quote">”</span>
            <div class="review-card__top"><span class="avatar">BR</span><div><b>Bilal R.</b><small>Lahore</small></div></div>
            <div class="stars" style="margin-bottom:8px">★★★★★</div>
            <p>“The air fryer is genuine and exactly as described. Cash on delivery made me feel safe ordering online for the first time.”</p>
            <span class="verified"><i class="fa-solid fa-circle-check"></i> Verified Purchase</span>
          </article>
          <article class="review-card" data-aos="flip-left" data-aos-delay="200">
            <span class="quote">”</span>
            <div class="review-card__top"><span class="avatar">HS</span><div><b>Hira S.</b><small>Islamabad</small></div></div>
            <div class="stars" style="margin-bottom:8px">★★★★★</div>
            <p>“Their WhatsApp support replied within minutes and helped me pick the right gift. My sister loved the smart watch.”</p>
            <span class="verified"><i class="fa-solid fa-circle-check"></i> Verified Purchase</span>
          </article>
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="cta-band" data-aos="zoom-in">
          <h2>Ready to upgrade your home?</h2>
          <p>Browse our best-selling gadgets and get them delivered to your door — pay cash on delivery.</p>
          <a class="btn btn--primary btn--lg arrow-slide" href="shop.html">Shop Now <i class="fa-solid fa-arrow-right"></i></a>
        </div>
      </div>
    </section>
  </main>
""" + FOOTER + FLOAT + SCRIPTS + TAIL)


# ------------------------------------------------------------------ checkout
page("checkout.html",
     head("Checkout — Smart Ghar | Cash on Delivery",
          "Complete your Smart Ghar order with cash on delivery, bank transfer or EasyPaisa/JazzCash.",
          canonical="checkout.html")
     + ANNOUNCE + HEADER + """
  <main>
    <div class="page-head">
      <div class="container">
        <nav class="breadcrumb"><a href="index.html">Home</a><i class="fa-solid fa-chevron-right"></i><a href="shop.html">Shop</a><i class="fa-solid fa-chevron-right"></i><span>Checkout</span></nav>
        <h1>Checkout</h1>
        <p>Cash on Delivery available all over Pakistan. No advance payment needed.</p>
      </div>
    </div>

    <div class="section">
      <div class="container checkout-layout">
        <form class="checkout-form" data-checkout-form novalidate>
          <div class="card-box" style="margin-bottom:16px">
            <div class="card-box__head"><span class="step">1</span><h3>Contact Information</h3></div>
            <div class="form-row">
              <div class="field">
                <label for="cName">Full Name <span class="req">*</span></label>
                <input id="cName" name="customer_name" autocomplete="name" placeholder="e.g. Ayesha Khan" required>
                <span class="error">Please enter your full name</span>
              </div>
              <div class="field">
                <label for="cPhone">Phone Number <span class="req">*</span></label>
                <input id="cPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="03XX-XXXXXXX" required>
                <span class="hint">We will confirm your order on this number</span>
                <span class="error">Enter a valid Pakistani mobile number</span>
              </div>
            </div>
            <div class="field" style="margin-bottom:0">
              <label for="cEmail">Email (optional)</label>
              <input id="cEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com">
              <span class="error">Enter a valid email address</span>
            </div>
          </div>

          <div class="card-box" style="margin-bottom:16px">
            <div class="card-box__head"><span class="step">2</span><h3>Shipping Address</h3></div>
            <div class="field">
              <label for="cAddress">Full Street Address <span class="req">*</span></label>
              <input id="cAddress" name="address" autocomplete="street-address" placeholder="House / Flat, street, area" required>
              <span class="error">Please enter your address</span>
            </div>
            <div class="form-row">
              <div class="field">
                <label for="cCity">City <span class="req">*</span></label>
                <select id="cCity" name="city" required>
                  <option value="">Select city</option>
                  <option>Karachi</option><option>Lahore</option><option>Islamabad</option><option>Rawalpindi</option>
                  <option>Faisalabad</option><option>Multan</option><option>Peshawar</option><option>Quetta</option>
                  <option>Hyderabad</option><option>Sialkot</option><option>Gujranwala</option><option>Bahawalpur</option>
                  <option>Sargodha</option><option>Sukkur</option><option>Larkana</option><option>Other</option>
                </select>
                <span class="error">Please select your city</span>
              </div>
              <div class="field">
                <label for="cProvince">Province <span class="req">*</span></label>
                <select id="cProvince" name="province" required>
                  <option value="">Select province</option>
                  <option>Sindh</option><option>Punjab</option><option>Khyber Pakhtunkhwa</option><option>Balochistan</option>
                  <option>Gilgit-Baltistan</option><option>Azad Jammu &amp; Kashmir</option><option>Islamabad Capital Territory</option>
                </select>
                <span class="error">Please select your province</span>
              </div>
            </div>
            <div class="form-row" style="margin-bottom:0">
              <div class="field" style="margin-bottom:0">
                <label for="cPostal">Postal Code (optional)</label>
                <input id="cPostal" name="postal_code" inputmode="numeric" placeholder="e.g. 75500">
              </div>
              <div class="field" style="margin-bottom:0">
                <label for="cNotes">Order Notes (optional)</label>
                <input id="cNotes" name="order_notes" placeholder="Landmark, delivery time…">
              </div>
            </div>
          </div>

          <div class="card-box" style="margin-bottom:16px">
            <div class="card-box__head"><span class="step">3</span><h3>Payment Method</h3></div>
            <label class="pay-option is-selected">
              <input type="radio" name="payment_method" value="COD" checked>
              <span class="pay-option__icon">💰</span>
              <span><b>Cash on Delivery</b><small>Pay when your parcel arrives — recommended</small></span>
            </label>
            <label class="pay-option">
              <input type="radio" name="payment_method" value="Bank Transfer">
              <span class="pay-option__icon">🏦</span>
              <span><b>Bank Transfer</b><small>Transfer to our account and share the receipt</small></span>
            </label>
            <div class="pay-detail" data-pay-detail="Bank Transfer">
              <b data-bank-name>Bank:</b> <span data-bank-title></span><br>
              Account: <span data-bank-account></span><br>
              <small style="color:var(--muted)">Send the screenshot on WhatsApp after transferring.</small>
            </div>
            <label class="pay-option">
              <input type="radio" name="payment_method" value="EasyPaisa/JazzCash">
              <span class="pay-option__icon">📱</span>
              <span><b>EasyPaisa / JazzCash</b><small>Send payment to our mobile account</small></span>
            </label>
            <div class="pay-detail" data-pay-detail="EasyPaisa/JazzCash">
              EasyPaisa: <b data-easypaisa></b><br>JazzCash: <b data-jazzcash></b><br>
              <small style="color:var(--muted)">Account title: <span data-easypaisa-title></span></small>
            </div>
          </div>

          <button class="btn btn--primary btn--lg btn--block" type="submit" data-place-order>
            <i class="fa-solid fa-lock"></i> Place Order
          </button>
          <p style="font-size:.74rem;color:var(--muted);text-align:center;margin-top:10px">
            By placing an order you agree to our delivery and return policy.
          </p>
        </form>

        <aside class="summary-card">
          <h3 style="font-family:var(--f-body);font-size:1rem;margin-bottom:14px"><i class="fa-solid fa-bag-shopping" style="color:var(--green)"></i> Order Summary</h3>
          <div class="summary-items" data-summary-items></div>

          <form class="promo" data-promo-form>
            <input type="text" placeholder="Promo code (SMART20)" aria-label="Promo code" data-promo-input>
            <button class="btn btn--forest btn--sm" type="submit">Apply</button>
          </form>
          <p style="font-size:.74rem;margin:-6px 0 12px;color:var(--green-700);display:none" data-promo-msg></p>

          <div class="totals">
            <div><span>Subtotal</span><b data-sum-subtotal>PKR 0</b></div>
            <div><span>Shipping</span><b data-sum-shipping>PKR 0</b></div>
            <div data-sum-discount-row style="display:none;color:var(--green-700)"><span>Discount <span data-sum-coupon></span></span><b data-sum-discount>-PKR 0</b></div>
            <div class="grand"><span>Total</span><span data-sum-total>PKR 0</span></div>
          </div>

          <div class="trust-row">
            <span><i class="fa-solid fa-lock"></i> Secure Checkout</span>
            <span><i class="fa-solid fa-truck-fast"></i> Fast Delivery</span>
            <span><i class="fa-solid fa-money-bill-wave"></i> COD</span>
          </div>
        </aside>
      </div>
    </div>
  </main>

  <div class="modal" id="orderSuccess">
    <div class="modal__backdrop" data-success-close></div>
    <div class="modal__card">
      <div class="success-mark"><i class="fa-solid fa-check"></i></div>
      <h2 class="h2" style="font-size:1.4rem;text-align:center;margin-bottom:6px">Order Placed Successfully! 🎉</h2>
      <p style="text-align:center;color:var(--muted);font-size:.88rem">Your Order ID</p>
      <p style="text-align:center;font-weight:700;font-size:1.15rem;color:var(--forest);letter-spacing:.06em;margin-bottom:12px" data-order-number>SG-00000</p>
      <p style="text-align:center;color:var(--muted);font-size:.86rem;margin-bottom:18px">We will contact you shortly on WhatsApp to confirm your order.</p>
      <a class="btn btn--wa btn--block" data-success-wa target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Confirm on WhatsApp</a>
      <a class="btn btn--outline btn--block" href="shop.html" style="margin-top:8px">Continue Shopping</a>
    </div>
  </div>
""" + FOOTER + FLOAT + SCRIPTS + '  <script src="/js/checkout.js"></script>\n' + TAIL)


# ------------------------------------------------------------------ admin login
page("admin-login.html",
     head("Admin Login — Smart Ghar", "Smart Ghar admin panel login.", extra_css='\n  <link rel="stylesheet" href="/css/admin.css">',
          canonical="admin-login.html")
     + """
  <main class="auth-page">
    <div class="auth-card" data-aos="zoom-in">
      <a href="index.html" style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:18px">
        <img src="/images/logo.png" alt="Smart Ghar" width="88" height="88" style="border-radius:50%">
      </a>
      <h1 style="font-size:1.5rem;text-align:center;margin-bottom:4px">Admin Panel Login</h1>
      <p style="text-align:center;color:var(--muted);font-size:.86rem;margin-bottom:22px">Welcome back! Sign in to manage your store.</p>

      <form data-admin-login novalidate>
        <div class="field">
          <label for="aEmail">Email Address</label>
          <input id="aEmail" type="email" name="email" autocomplete="username" placeholder="admin@smartghar.pk" required>
        </div>
        <div class="field">
          <label for="aPass">Password</label>
          <div class="pass-wrap">
            <input id="aPass" type="password" name="password" autocomplete="current-password" placeholder="••••••••" required>
            <button type="button" class="pass-toggle" data-pass-toggle aria-label="Show password"><i class="fa-solid fa-eye"></i></button>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;font-size:.82rem">
          <label class="check" style="padding:0"><input type="checkbox" name="remember" checked> Remember me</label>
          <a class="link-underline" href="#" style="color:var(--green-700);font-weight:600" data-forgot>Forgot password?</a>
        </div>
        <button class="btn btn--primary btn--block btn--lg" type="submit" data-login-btn>
          <i class="fa-solid fa-lock"></i> Login
        </button>
        <p data-login-error style="display:none;color:#dc2626;font-size:.82rem;margin-top:12px;text-align:center"></p>
      </form>

      <p style="text-align:center;font-size:.72rem;color:var(--muted);margin-top:22px">Smart Ghar Admin © <span data-year>2025</span></p>
    </div>
  </main>
  <script src="/vendor/supabase.js"></script>
  <script src="/js/supabase-config.js"></script>
  <script>
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    var toggle = document.querySelector('[data-pass-toggle]');
    toggle && toggle.addEventListener('click', function () {
      var input = document.getElementById('aPass');
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.innerHTML = '<i class="fa-solid fa-eye' + (show ? '-slash' : '') + '"></i>';
    });

    var form = document.querySelector('[data-admin-login]');
    var errEl = document.querySelector('[data-login-error]');
    var btn = document.querySelector('[data-login-btn]');

    // already signed in? go straight to dashboard
    (async function () {
      if (!window.SG || !SG.sb) return;
      var s = await SG.sb.auth.getSession();
      if (s && s.data && s.data.session) window.location.replace('admin-dashboard.html');
    })();

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      errEl.style.display = 'none';
      var email = form.email.value.trim();
      var pass = form.password.value;
      if (!email || !pass) { errEl.textContent = 'Please enter your email and password.'; errEl.style.display = 'block'; return; }
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Signing in…';
      try {
        var res = await SG.sb.auth.signInWithPassword({ email: email, password: pass });
        if (res.error) throw res.error;
        window.location.href = 'admin-dashboard.html';
      } catch (err) {
        errEl.textContent = (err && err.message) ? err.message : 'Login failed. Please check your credentials.';
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-lock"></i> Login';
      }
    });

    document.querySelector('[data-forgot]').addEventListener('click', async function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      if (!email) { errEl.textContent = 'Enter your admin email first, then click forgot password.'; errEl.style.display = 'block'; return; }
      try {
        await SG.sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/admin-login.html' });
        SG.toast('Password reset link sent to ' + email, 'success');
      } catch (err) {
        SG.toast('Could not send reset email.', 'error');
      }
    });
  </script>
</body>
</html>
""")

print("done")
