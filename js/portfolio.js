// Altaura Portfolio — public page logic
// Fetches published case studies from Supabase and renders them, then wires
// up the existing filter tabs and expand/collapse interaction.

(function () {
  const grid = document.getElementById('portfolio-grid');
  const empty = document.getElementById('portfolio-empty');
  const filterTabs = document.querySelectorAll('.filters .filter-tab');

  if (!grid) return;

  if (typeof supabaseClient === 'undefined' || !supabaseClient) {
    empty?.classList.remove('admin-hidden');
    const p = empty?.querySelector('p');
    if (p) p.textContent = 'Portfolio is not connected yet.';
    return;
  }

  function cardTemplate(item) {
    const cover = item.image_url ? `<img src="${item.image_url}" alt="${item.brand_name} portfolio preview" loading="lazy" />` : '';
    const tags = [item.tag_1, item.tag_2].filter(Boolean).map((t) => `<span>${t}</span>`).join('');
    return `
      <article class="case-study-card card" data-category="${item.category}">
        <div class="case-study-card__image">${cover}</div>
        <p class="eyebrow">${item.eyebrow || item.category}</p>
        <h3>${item.brand_name}</h3>
        <div class="pill-row">${tags}</div>
        <p>${item.result_stat}</p>
        <button class="case-study-toggle" type="button">View Case Study</button>
        <div class="case-study-panel">
          <p><strong>Challenge:</strong> ${item.challenge}</p>
          <p><strong>Approach:</strong> ${item.approach}</p>
          <p><strong>Outcome:</strong> ${item.outcome}</p>
          ${item.closing_line ? `<p class="muted">${item.closing_line}</p>` : ''}
        </div>
      </article>
    `;
  }

  function wireInteractions() {
    const caseCards = grid.querySelectorAll('.case-study-card');

    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((item) => item.classList.remove('is-active'));
        tab.classList.add('is-active');
        const filter = tab.dataset.filter;
        caseCards.forEach((card) => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('is-hidden', !match);
          card.style.transition = 'opacity 0.25s ease';
          card.style.opacity = match ? '1' : '0';
        });
      });
    });

    caseCards.forEach((card) => {
      const toggle = card.querySelector('.case-study-toggle');
      if (toggle) {
        toggle.addEventListener('click', () => {
          card.classList.toggle('expanded');
          toggle.setAttribute('aria-expanded', String(card.classList.contains('expanded')));
        });
      }
    });
  }

  async function load() {
    const { data, error } = await supabaseClient
      .from('portfolio_items')
      .select('brand_name, category, eyebrow, tag_1, tag_2, result_stat, challenge, approach, outcome, closing_line, image_url, display_order')
      .eq('published', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Altaura Portfolio: failed to load', error);
      empty?.classList.remove('admin-hidden');
      return;
    }

    if (!data || !data.length) {
      empty?.classList.remove('admin-hidden');
      return;
    }

    empty?.classList.add('admin-hidden');
    grid.innerHTML = data.map(cardTemplate).join('');
    wireInteractions();
  }

  function showSkeleton() {
    grid.innerHTML = Array.from({ length: 6 }).map(() => `
      <article class="case-study-card card case-study-card--skeleton">
        <div class="case-study-card__image skeleton-block"></div>
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--long"></div>
        <div class="skeleton-line skeleton-line--medium"></div>
      </article>
    `).join('');
  }

  showSkeleton();
  load();
})();
