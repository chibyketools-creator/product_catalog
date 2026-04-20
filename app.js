/* ── TAG CLASS MAPPING ── */
function tagClass(tag) {
  const t = tag.toLowerCase();
  if (t.includes('best') || t.includes('popular') || t.includes('demand') ||
      t.includes('essential') || t.includes('mandatory') || t.includes('top') ||
      t.includes('site') || t.includes('choice') || t.includes('pro') ||
      t.includes('staple')) return 'ptag hot';
  if (t.includes('stock') || t.includes('new')) return 'ptag new';
  if (t.includes('value') || t.includes('sale')) return 'ptag sale';
  return 'ptag';
}

/* ── RELATED LABEL PER CATEGORY ── */
const relatedLabel = {
  cordless:  'Also in Cordless',
  electric:  'Also in Electric Tools',
  washer:    'Also in Washers',
  drills:    'Also in Drills',
  rotary:    'Also in Rotary Hammers',
  safety:    'Individual Safety Items',
  chisel:    'Also in Chiseling',
  grinders:  'Also in Grinders',
  handtools: 'Individual Hand Tools',
  saw:       'Also in Machine Saws',

};

/* ── BUILD RELATED FROM REAL PRODUCT DATA ── */
function getRelated(currentProduct, allProducts, limit = 4) {
  return allProducts
    .filter(p =>
      p !== currentProduct &&
      (
        p.category === currentProduct.category ||
        p.showIn.some(s => currentProduct.showIn.includes(s))
      )
    )
    .slice(0, limit);
}

/* ── OPEN PRODUCT DETAIL (scroll to product card by name+brand) ── */
function openRelatedProduct(p) {
  const targetCat = p.showIn[0] || p.category;

  // Find the tab whose onclick contains the target category
  const navBtn = Array.from(document.querySelectorAll('.tab'))
    .find(btn => btn.getAttribute('onclick')?.includes(`'${targetCat}'`));

  const doScroll = () => {
    const allCards = document.querySelectorAll('.product-card');
    for (const card of allCards) {
      const brandEl = card.querySelector('.pc-brand');
      const nameEl  = card.querySelector('.pc-name');
      if (
        brandEl && nameEl &&
        brandEl.textContent.trim() === p.brand.trim() &&
        nameEl.textContent.trim() === p.name.trim()
      ) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.transition  = 'box-shadow 0.3s ease';
        card.style.boxShadow   = '0 0 0 2px rgba(245,196,0,0.7)';
        setTimeout(() => { card.style.boxShadow = ''; }, 1800);
        return;
      }
    }
  };

  if (navBtn) {
    navBtn.click();           // triggers your show() function
    setTimeout(doScroll, 350); // wait for section to render
  } else {
    doScroll();               // already on the right tab
  }
}

/* ── RENDER RELATED CARDS FROM REAL DATA ── */
function renderRelated(currentProduct, allProducts) {
  const cat          = currentProduct.category;
  const relContainer = document.getElementById('related-' + cat);
  if (!relContainer) return;

  const titleEl = relContainer.previousElementSibling;
  if (titleEl) titleEl.textContent = relatedLabel[cat] || 'Also available';

  const relatedProducts = getRelated(currentProduct, allProducts);

  relContainer.innerHTML = '';

  if (relatedProducts.length === 0) {
    relContainer.style.display = 'none';
    if (titleEl) titleEl.style.display = 'none';
    return;
  }

  relatedProducts.forEach(r => {
    const card = document.createElement('div');
    card.className = 'related-card';
    card.style.cursor = 'pointer';

    const iconHTML = r.image
      ? `<img src="${r.image}" alt="${r.name}"
            style="width:100%;height:100%;object-fit:contain;border-radius:8px;padding:4px;" />`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;
              justify-content:center;font-size:28px;opacity:0.4;">🔧</div>`;

    card.innerHTML = `
      <div class="rc-icon">${iconHTML}</div>
      <div class="rc-name">${r.brand} ${r.name}</div>
      <div class="rc-price">₦${r.price.toLocaleString()}</div>
      <div class="rc-badge">${r.model}</div>
    `;

    card.addEventListener('click', () => openRelatedProduct(r));

    card.addEventListener('mouseenter', () => {
      card.style.transform  = 'translateY(-3px)';
      card.style.transition = 'transform 0.2s ease, border-color 0.2s ease';
      card.style.borderColor = 'rgba(245,196,0,0.4)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform   = 'translateY(0)';
      card.style.borderColor = '';
    });

    relContainer.appendChild(card);
  });
}

/* ── LOAD AND RENDER PRODUCTS ── */
fetch('product.json')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status} — product.json not found`);
    return res.json();
  })
  .then(products => {
    console.log(` Loaded ${products.length} products`);

    // New logic: allow products to appear in multiple categories
    const byCategory = {};

    products.forEach(p => {
      const categoriesToShow = p.showIn && Array.isArray(p.showIn)
        ? p.showIn
        : [p.category];        // fallback to single category

      categoriesToShow.forEach(cat => {
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(p);
      });
    });

    // Render each category
    Object.keys(byCategory).forEach(cat => {
      const container = document.getElementById('products-' + cat);
      if (!container) return;

      container.innerHTML = '';   // clear first

      byCategory[cat].forEach(p => {
        let specsHTML = '';
        for (let key in p.specs) {
          specsHTML += `
            <div class="spec-row">
              <span class="spec-key">${key}:</span>
              <span class="spec-val">${p.specs[key]}</span>
            </div>`;
        }

        let tagsHTML = '';
        p.tags.forEach(tag => {
          tagsHTML += `<span class="${tagClass(tag)}">${tag}</span>`;
        });

        const imgHTML = p.image
          ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:12px;position:relative;z-index:1;">`
          : `<div class="pc-img-icon">🔧</div>
             <div class="pc-img-hint">Add product photo here<br>1080×1080px recommended</div>`;

        const oldPriceHTML  = p.oldPrice  ? `<span class="price-was">₦${p.oldPrice.toLocaleString()}</span>`  : '';
        const priceNoteHTML = p.priceNote ? `<span class="price-note">${p.priceNote}</span>`                   : '';

        container.innerHTML += `
        <div class="product-card">
          <div class="pc-top">
            <div class="pc-img">
              ${p.label ? `<div class="pc-img-label">${p.label}</div>` : ''}
              ${imgHTML}
            </div>
            <div class="pc-info">
              <div>
                <div class="pc-brand">${p.brand}</div>
                <div class="pc-name">${p.name}</div>
                <div class="pc-model">${p.model}</div>
              </div>
              <div class="pc-desc">${p.description}</div>
              <div class="pc-specs">${specsHTML}</div>
              <div class="pc-tags">${tagsHTML}</div>
            </div>
          </div>
          <div class="pc-bottom">
            <div>
              <div class="price-block">
                <span class="price-main">₦${p.price.toLocaleString()}</span>
                ${oldPriceHTML}
                ${priceNoteHTML}
              </div>
              <div class="avail"><span class="avail-dot"></span>${p.availability}</div>
            </div>
            <div class="cta-row">
              <button class="btn-call" onclick="window.open('tel:${p.phone}')">📞 Call</button>
              <button class="btn-order"
                onclick="window.open('https://wa.me/${p.whatsapp}?text=Hi! I want to order the ${encodeURIComponent(p.name)}')">
                WhatsApp Order
              </button>
            </div>
          </div>
        </div>`;
      });
    });

    
    products.forEach(p => {
      renderRelated(p, products);
    });
  })
  .catch(err => {
    console.error('Failed to load product.json:', err);
    document.querySelectorAll('[id^="products-"]').forEach(c => {
      c.innerHTML = `<div style="padding:40px;text-align:center;color:#ff6b35;background:#1f1f2b;border-radius:12px;">
        Could not load products. Make sure product.json exists.
      </div>`;
    });
  });