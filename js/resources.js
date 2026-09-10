(async function () {
  if (!supabaseClient) return;

  const grid = document.querySelector('.ebook-grid') || document.getElementById('resources-grid');
  if (!grid) return;

  grid.innerHTML = '<div>Loading resources…</div>';

  const { data, error } = await supabaseClient
    .from('resources')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    grid.innerHTML = '<p>Could not load resources: ' + error.message + '</p>';
    return;
  }

  if (!data || !data.length) {
    grid.innerHTML = '<p>No resources available yet.</p>';
    return;
  }

  function formatPrice(p) {
    if (p == null) return '';
    if (p === 0) return 'Free';
    return '₦' + Number(p).toLocaleString();
  }

  grid.innerHTML = data.map((res) => {
    const cover = res.cover_image_url ? `<div class="ebook-cover"><img src="${res.cover_image_url}" alt="${res.title}" /></div>` : '<div class="ebook-cover"><span>No image</span></div>';
    const statusLabel = res.status === 'paid' ? 'Paid' : res.status === 'free' ? 'Free Guide' : 'Coming Soon';

    let priceHtml = '';
    if (res.status === 'coming_soon') {
      priceHtml = '';
    } else if (res.original_price && res.original_price !== res.price) {
      priceHtml = `<p class="price"><span class="muted" style="text-decoration:line-through; margin-right:8px;">${formatPrice(res.original_price)}</span><strong>${formatPrice(res.price)}</strong></p>`;
    } else {
      priceHtml = `<p class="price"><strong>${formatPrice(res.price)}</strong></p>`;
    }

    const btn = res.status === 'coming_soon' ? `<button class="button button--ghost" disabled>Coming Soon</button>` : `<a class="button button--primary" href="${res.external_link}" target="_blank" rel="noreferrer">${res.status === 'free' ? 'Download' : 'Buy'}</a>`;

    return `
      <article class="ebook-card card">
        ${cover}
        <p class="eyebrow">${statusLabel}</p>
        <h3>${res.title}</h3>
        <p>${res.description}</p>
        ${priceHtml}
        ${btn}
      </article>
    `;
  }).join('');
})();
