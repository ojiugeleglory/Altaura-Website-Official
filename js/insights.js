// Altaura Insights — public page logic
// Renders the list of published posts and, when a ?slug= param is present,
// renders a single post detail view instead.

(function () {
  const listView = document.getElementById('insights-list-view');
  const gridSection = document.getElementById('insights-grid')?.closest('.section');
  const detailView = document.getElementById('insights-detail-view');
  const grid = document.getElementById('insights-grid');
  const filtersBar = document.getElementById('insights-filters');
  const emptyState = document.getElementById('insights-empty');

  if (!grid || !supabaseClient) {
    if (grid && !supabaseClient) {
      emptyState?.classList.remove('admin-hidden');
      const p = emptyState?.querySelector('p');
      if (p) p.textContent = 'Insights is not connected yet.';
    }
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function renderMarkdown(text) {
    if (window.marked) {
      return marked.parse(text || '');
    }
    // Fallback: paragraphs split on double newline
    return (text || '')
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  function cardTemplate(post) {
    const cover = post.cover_image_url
      ? `<img src="${post.cover_image_url}" alt="${post.title}" loading="lazy" />`
      : `<span>No Cover Image</span>`;
    const excerpt = post.excerpt || '';
    return `
      <a class="insight-card" href="insights.html?slug=${encodeURIComponent(post.slug)}">
        <div class="insight-card__image">${cover}</div>
        <div class="insight-card__meta">
          <span>${post.category || 'Insight'}</span>
          <span class="dot" aria-hidden="true"></span>
          <span>${formatDate(post.created_at)}</span>
        </div>
        <h3>${post.title}</h3>
        ${excerpt ? `<p>${excerpt}</p>` : ''}
        <span class="insight-card__read">Read More &rarr;</span>
      </a>
    `;
  }

  function renderList(posts) {
    if (!posts.length) {
      grid.innerHTML = '';
      emptyState?.classList.remove('admin-hidden');
      return;
    }
    emptyState?.classList.add('admin-hidden');
    grid.innerHTML = posts.map(cardTemplate).join('');

    const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];
    if (categories.length > 1 && filtersBar) {
      filtersBar.innerHTML = ['All', ...categories]
        .map((c, i) => `<button class="filter-tab${i === 0 ? ' is-active' : ''}" data-category="${c}">${c}</button>`)
        .join('');

      filtersBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-tab');
        if (!btn) return;
        filtersBar.querySelectorAll('.filter-tab').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const cat = btn.dataset.category;
        const filtered = cat === 'All' ? posts : posts.filter((p) => p.category === cat);
        grid.innerHTML = filtered.length ? filtered.map(cardTemplate).join('') : '';
        emptyState?.classList.toggle('admin-hidden', filtered.length > 0);
      });
    }
  }

  function renderDetail(post) {
    listView?.classList.add('admin-hidden');
    gridSection?.classList.add('admin-hidden');
    detailView?.classList.remove('admin-hidden');

    document.getElementById('page-title').textContent = `${post.title} | Altaura Insights`;
    document.getElementById('detail-category').textContent = post.category || 'Insight';
    document.getElementById('detail-title').textContent = post.title;
    document.getElementById('detail-date').textContent = formatDate(post.created_at);
    document.getElementById('detail-body').innerHTML = renderMarkdown(post.body);

    const coverWrap = document.getElementById('detail-cover-wrap');
    const coverImg = document.getElementById('detail-cover');
    if (post.cover_image_url) {
      coverImg.src = post.cover_image_url;
      coverImg.alt = post.title;
      coverWrap.classList.remove('admin-hidden');
    }
  }

  async function loadList() {
    const { data, error } = await supabaseClient
      .from('posts')
      .select('id, title, slug, category, excerpt, cover_image_url, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Altaura Insights: failed to load posts', error);
      emptyState?.classList.remove('admin-hidden');
      return;
    }
    renderList(data || []);
  }

  async function loadDetail(theSlug) {
    const { data, error } = await supabaseClient
      .from('posts')
      .select('*')
      .eq('slug', theSlug)
      .eq('published', true)
      .maybeSingle();

    if (error || !data) {
      console.error('Altaura Insights: post not found', error);
      window.location.href = 'insights.html';
      return;
    }
    renderDetail(data);
  }

  function showSkeleton() {
    grid.innerHTML = Array.from({ length: 4 }).map(() => `
      <div class="insight-card insight-card--skeleton">
        <div class="insight-card__image skeleton-block"></div>
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--long"></div>
        <div class="skeleton-line skeleton-line--medium"></div>
      </div>
    `).join('');
  }

  if (slug) {
    loadDetail(slug);
  } else {
    showSkeleton();
    loadList();
  }
})();
