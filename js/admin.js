// Altaura Insights — admin panel logic
// Handles Supabase auth, listing posts, and the create/edit/delete editor.

(function () {
  if (!supabaseClient) {
    document.body.innerHTML = '<div class="container" style="padding:120px 0; text-align:center;">' +
      '<p class="eyebrow">Insights Admin</p>' +
      '<h1>Not connected yet</h1>' +
      '<p class="lede" style="margin-inline:auto;">Fill in js/supabase-config.js with your Supabase project URL and anon key, then reload this page.</p>' +
      '</div>';
    return;
  }

  // Resizes and compresses an image in the browser before upload, so a
  // multi-MB phone photo becomes a reasonably sized web image (roughly
  // 150-400KB typically) instead of loading slowly for every visitor.
  function compressImage(file, maxWidth = 1600, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Could not read image'));
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
            'image/jpeg',
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }


  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');
  const listView = document.getElementById('admin-list-view');
  const editorView = document.getElementById('admin-editor-view');
  const postList = document.getElementById('admin-post-list');
  const listEmpty = document.getElementById('admin-list-empty');

  const tabPosts = document.getElementById('admin-tab-posts');
  const tabSubscribers = document.getElementById('admin-tab-subscribers');
  const subscribersView = document.getElementById('admin-subscribers-view');
  const subscribersList = document.getElementById('admin-subscribers-list');
  const subscribersEmpty = document.getElementById('admin-subscribers-empty');
  const subscribersCount = document.getElementById('admin-subscribers-count');

  const tabPortfolio = document.getElementById('admin-tab-portfolio');
  const tabResources = document.getElementById('admin-tab-resources');
  const portfolioListView = document.getElementById('admin-portfolio-list-view');
  const portfolioEditorView = document.getElementById('admin-portfolio-editor-view');
  const portfolioList = document.getElementById('admin-portfolio-list');
  const portfolioEmpty = document.getElementById('admin-portfolio-empty');
  const newPortfolioBtn = document.getElementById('admin-new-portfolio-btn');
  const portfolioBackBtn = document.getElementById('admin-portfolio-back-btn');

  const csBrandName = document.getElementById('cs-brand-name');
  const csCategory = document.getElementById('cs-category');
  const csEyebrow = document.getElementById('cs-eyebrow');
  const csTag1 = document.getElementById('cs-tag1');
  const csTag2 = document.getElementById('cs-tag2');
  const csResult = document.getElementById('cs-result');
  const csChallenge = document.getElementById('cs-challenge');
  const csApproach = document.getElementById('cs-approach');
  const csOutcome = document.getElementById('cs-outcome');
  const csClosing = document.getElementById('cs-closing');
  const csCoverInput = document.getElementById('cs-cover');
  const csCoverPreview = document.getElementById('cs-cover-preview');
  const csOrder = document.getElementById('cs-order');
  const csPublished = document.getElementById('cs-published');
  const csSaveBtn = document.getElementById('cs-save-btn');
  const csDeleteBtn = document.getElementById('cs-delete-btn');
  const csStatusMsg = document.getElementById('cs-status-msg');

  let currentPortfolioId = null;
  let currentPortfolioCoverUrl = '';

  // Resources admin elements
  const tabResourcesBtn = tabResources;
  const resourcesView = document.getElementById('admin-resources-view');
  const resourcesList = document.getElementById('admin-resources-list');
  const resourcesEmpty = document.getElementById('admin-resources-empty');
  const newResourceBtn = document.getElementById('admin-new-resource-btn');
  const resourcesEditorView = document.getElementById('admin-resources-editor-view');
  const resourcesBackBtn = document.getElementById('admin-resources-back-btn');

  const resTitle = document.getElementById('res-title');
  const resDescription = document.getElementById('res-description');
  const resPrice = document.getElementById('res-price');
  const resOriginalPrice = document.getElementById('res-original-price');
  const resStatus = document.getElementById('res-status');
  const resOrder = document.getElementById('res-order');
  const resExternalLink = document.getElementById('res-external-link');
  const resCoverInput = document.getElementById('res-cover');
  const resCoverPreview = document.getElementById('res-cover-preview');
  const resSaveBtn = document.getElementById('res-save-btn');
  const resDeleteBtn = document.getElementById('res-delete-btn');
  const resStatusMsg = document.getElementById('res-status-msg');

  let currentResourceId = null;
  let currentResourceCoverUrl = '';

  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const loginBtn = document.getElementById('admin-login-btn');
  const loginError = document.getElementById('admin-login-error');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const newPostBtn = document.getElementById('admin-new-post-btn');
  const backBtn = document.getElementById('admin-back-btn');

  const titleInput = document.getElementById('post-title');
  const slugInput = document.getElementById('post-slug');
  const categoryInput = document.getElementById('post-category');
  const excerptInput = document.getElementById('post-excerpt');
  const coverInput = document.getElementById('post-cover');
  const coverPreview = document.getElementById('post-cover-preview');
  const bodyInput = document.getElementById('post-body');
  const publishedInput = document.getElementById('post-published');
  const saveBtn = document.getElementById('post-save-btn');
  const deleteBtn = document.getElementById('post-delete-btn');
  const statusMsg = document.getElementById('post-status-msg');

  let currentPostId = null;
  let currentCoverUrl = '';
  let slugManuallyEdited = false;

  function slugify(text) {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  titleInput.addEventListener('input', () => {
    if (!slugManuallyEdited) {
      slugInput.value = slugify(titleInput.value);
    }
  });
  slugInput.addEventListener('input', () => { slugManuallyEdited = true; });

  function showView(view) {
    loginView.classList.toggle('admin-hidden', view !== 'login');
    dashboardView.classList.toggle('admin-hidden', view === 'login');
    listView.classList.toggle('admin-hidden', view !== 'list');
    editorView.classList.toggle('admin-hidden', view !== 'editor');
    subscribersView.classList.toggle('admin-hidden', view !== 'subscribers');
    resourcesView.classList.toggle('admin-hidden', view !== 'resources');
    resourcesEditorView.classList.toggle('admin-hidden', view !== 'resources-editor');
    portfolioListView.classList.toggle('admin-hidden', view !== 'portfolio-list');
    portfolioEditorView.classList.toggle('admin-hidden', view !== 'portfolio-editor');

    const tabsRow = document.querySelector('.admin-tabs');
    const isEditor = view === 'editor' || view === 'portfolio-editor';
    if (tabsRow) tabsRow.classList.toggle('admin-hidden', isEditor);
    newPostBtn.classList.toggle('admin-hidden', view !== 'list');
    newPortfolioBtn.classList.toggle('admin-hidden', view !== 'portfolio-list');

    tabPosts.classList.toggle('is-active', view === 'list');
    tabSubscribers.classList.toggle('is-active', view === 'subscribers');
    tabResources.classList.toggle('is-active', view === 'resources');
    tabPortfolio.classList.toggle('is-active', view === 'portfolio-list');
    newResourceBtn.classList.toggle('admin-hidden', view !== 'resources');
  }

  tabPortfolio.addEventListener('click', () => {
    showView('portfolio-list');
    loadPortfolio();
  });

  tabResourcesBtn.addEventListener('click', () => {
    showView('resources');
    loadResources();
  });

  newPortfolioBtn.addEventListener('click', () => {
    resetPortfolioEditor();
    showView('portfolio-editor');
  });

  newResourceBtn.addEventListener('click', () => {
    resetResourceEditor();
    showView('resources-editor');
  });

  resourcesBackBtn.addEventListener('click', () => {
    showView('resources');
    loadResources();
  });

  portfolioBackBtn.addEventListener('click', () => {
    showView('portfolio-list');
    loadPortfolio();
  });

  tabPosts.addEventListener('click', () => {
    showView('list');
    loadPosts();
  });

  tabSubscribers.addEventListener('click', () => {
    showView('subscribers');
    loadSubscribers();
  });

  async function loadSubscribers() {
    subscribersList.innerHTML = '<div class="admin-list__row">Loading…</div>';
    subscribersCount.textContent = '';

    const { data, error } = await supabaseClient
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      subscribersList.innerHTML = '';
      subscribersEmpty.classList.remove('admin-hidden');
      subscribersEmpty.querySelector('p').textContent = 'Could not load subscribers: ' + error.message;
      return;
    }

    if (!data || !data.length) {
      subscribersList.innerHTML = '';
      subscribersEmpty.classList.remove('admin-hidden');
      subscribersEmpty.querySelector('p').textContent = "No subscribers yet. Once people sign up in your footer, they'll show up here.";
      return;
    }

    subscribersEmpty.classList.add('admin-hidden');
    subscribersCount.textContent = `${data.length} subscriber${data.length === 1 ? '' : 's'}`;
    subscribersList.innerHTML = data.map((sub) => `
      <div class="admin-list__row" style="grid-template-columns: 1fr auto;">
        <div>${sub.email}</div>
        <span style="color:var(--color-text-muted); font-size:12px;">${formatDate(sub.created_at)}</span>
      </div>
    `).join('');
  }

  function resetPortfolioEditor() {
    currentPortfolioId = null;
    currentPortfolioCoverUrl = '';
    csBrandName.value = '';
    csCategory.value = 'Brand Transformation';
    csEyebrow.value = '';
    csTag1.value = '';
    csTag2.value = '';
    csResult.value = '';
    csChallenge.value = '';
    csApproach.value = '';
    csOutcome.value = '';
    csClosing.value = '';
    csCoverInput.value = '';
    csCoverPreview.innerHTML = '<span>No Cover Image</span>';
    csOrder.value = '0';
    csPublished.checked = false;
    csStatusMsg.textContent = '';
    csDeleteBtn.classList.add('admin-hidden');
  }

  function resetResourceEditor() {
    currentResourceId = null;
    currentResourceCoverUrl = '';
    resTitle.value = '';
    resDescription.value = '';
    resPrice.value = '';
    resOriginalPrice.value = '';
    resStatus.value = 'free';
    resOrder.value = '0';
    resExternalLink.value = '';
    resCoverInput.value = '';
    resCoverPreview.innerHTML = '<span>No Cover Image</span>';
    resStatusMsg.textContent = '';
    resDeleteBtn.classList.add('admin-hidden');
  }

  async function loadResources() {
    resourcesList.innerHTML = '<div class="admin-list__row">Loading…</div>';
    const { data, error } = await supabaseClient
      .from('resources')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      resourcesList.innerHTML = '';
      resourcesEmpty.classList.remove('admin-hidden');
      resourcesEmpty.querySelector('p').textContent = 'Could not load resources: ' + error.message;
      return;
    }

    if (!data || !data.length) {
      resourcesList.innerHTML = '';
      resourcesEmpty.classList.remove('admin-hidden');
      return;
    }

    resourcesEmpty.classList.add('admin-hidden');
    resourcesList.innerHTML = data.map((item) => `
      <div class="admin-list__row" data-id="${item.id}">
        <div>
          <strong>${item.title || '(Untitled)'}</strong><br>
          <span style="color:var(--color-text-muted); font-size:12px;">Status: ${item.status} · Order ${item.display_order}</span>
        </div>
        <span class="status">${item.status === 'paid' ? 'Paid' : item.status === 'free' ? 'Free' : 'Coming Soon'}</span>
        <button data-action="edit" data-id="${item.id}">Edit</button>
        <button data-action="delete" data-id="${item.id}" class="link-danger">Delete</button>
      </div>
    `).join('');
  }

  resourcesList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'edit') {
      editResource(id);
    } else if (btn.dataset.action === 'delete') {
      if (confirm('Delete this resource? This cannot be undone.')) {
        await supabaseClient.from('resources').delete().eq('id', id);
        loadResources();
      }
    }
  });

  async function editResource(id) {
    const { data, error } = await supabaseClient.from('resources').select('*').eq('id', id).maybeSingle();
    if (error || !data) return;

    currentResourceId = data.id;
    currentResourceCoverUrl = data.cover_image_url || '';

    resTitle.value = data.title || '';
    resDescription.value = data.description || '';
    resPrice.value = data.price != null ? data.price : '';
    resOriginalPrice.value = data.original_price != null ? data.original_price : '';
    resStatus.value = data.status || 'free';
    resOrder.value = data.display_order || 0;
    resExternalLink.value = data.external_link || '';

    resCoverPreview.innerHTML = currentResourceCoverUrl ? `<img src="${currentResourceCoverUrl}" alt="Cover preview" />` : '<span>No Cover Image</span>';

    resDeleteBtn.classList.remove('admin-hidden');
    resStatusMsg.textContent = '';
    showView('resources-editor');
  }

  async function loadPortfolio() {
    portfolioList.innerHTML = '<div class="admin-list__row">Loading…</div>';
    const { data, error } = await supabaseClient
      .from('portfolio_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      portfolioList.innerHTML = '';
      portfolioEmpty.classList.remove('admin-hidden');
      portfolioEmpty.querySelector('p').textContent = 'Could not load case studies: ' + error.message;
      return;
    }

    if (!data || !data.length) {
      portfolioList.innerHTML = '';
      portfolioEmpty.classList.remove('admin-hidden');
      return;
    }

    portfolioEmpty.classList.add('admin-hidden');
    portfolioList.innerHTML = data.map((item) => `
      <div class="admin-list__row" data-id="${item.id}">
        <div>
          <strong>${item.brand_name || '(Untitled)'}</strong><br>
          <span style="color:var(--color-text-muted); font-size:12px;">${item.category || 'Uncategorized'} · Order ${item.display_order}</span>
        </div>
        <span class="status ${item.published ? 'status--published' : 'status--draft'}">${item.published ? 'Published' : 'Draft'}</span>
        <button data-action="edit" data-id="${item.id}">Edit</button>
        <button data-action="delete" data-id="${item.id}" class="link-danger">Delete</button>
      </div>
    `).join('');
  }

  portfolioList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'edit') {
      editPortfolioItem(id);
    } else if (btn.dataset.action === 'delete') {
      if (confirm('Delete this case study? This cannot be undone.')) {
        await supabaseClient.from('portfolio_items').delete().eq('id', id);
        loadPortfolio();
      }
    }
  });

  async function editPortfolioItem(id) {
    const { data, error } = await supabaseClient.from('portfolio_items').select('*').eq('id', id).maybeSingle();
    if (error || !data) return;

    currentPortfolioId = data.id;
    currentPortfolioCoverUrl = data.image_url || '';

    csBrandName.value = data.brand_name || '';
    csCategory.value = data.category || 'Brand Transformation';
    csEyebrow.value = data.eyebrow || '';
    csTag1.value = data.tag_1 || '';
    csTag2.value = data.tag_2 || '';
    csResult.value = data.result_stat || '';
    csChallenge.value = data.challenge || '';
    csApproach.value = data.approach || '';
    csOutcome.value = data.outcome || '';
    csClosing.value = data.closing_line || '';
    csOrder.value = data.display_order || 0;
    csPublished.checked = !!data.published;

    csCoverPreview.innerHTML = currentPortfolioCoverUrl
      ? `<img src="${currentPortfolioCoverUrl}" alt="Cover preview" />`
      : '<span>No Cover Image</span>';

    csDeleteBtn.classList.remove('admin-hidden');
    csStatusMsg.textContent = '';
    showView('portfolio-editor');
  }

  csCoverInput.addEventListener('change', async () => {
    const file = csCoverInput.files[0];
    if (!file) return;

    csStatusMsg.textContent = 'Optimizing image…';
    let uploadFile;
    try {
      uploadFile = await compressImage(file);
    } catch (err) {
      uploadFile = file; // fall back to the original if compression fails
    }

    csStatusMsg.textContent = 'Uploading cover image…';
    const fileName = `portfolio-${Date.now()}-${slugify(file.name.replace(/\.[^/.]+$/, ''))}.jpg`;

    const { error: uploadError } = await supabaseClient.storage
      .from('insights-images')
      .upload(fileName, uploadFile, { cacheControl: '3600', upsert: false, contentType: 'image/jpeg' });

    if (uploadError) {
      csStatusMsg.textContent = 'Image upload failed: ' + uploadError.message;
      return;
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from('insights-images')
      .getPublicUrl(fileName);

    currentPortfolioCoverUrl = publicUrlData.publicUrl;
    csCoverPreview.innerHTML = `<img src="${currentPortfolioCoverUrl}" alt="Cover preview" />`;
    csStatusMsg.textContent = 'Cover image uploaded.';
  });

  // Resource cover upload
  resCoverInput.addEventListener('change', async () => {
    const file = resCoverInput.files[0];
    if (!file) return;

    resStatusMsg.textContent = 'Optimizing image…';
    let uploadFile;
    try {
      uploadFile = await compressImage(file);
    } catch (err) {
      uploadFile = file;
    }

    resStatusMsg.textContent = 'Uploading cover image…';
    const fileName = `resource-${Date.now()}-${slugify(file.name.replace(/\.[^/.]+$/, ''))}.jpg`;

    const { error: uploadError } = await supabaseClient.storage
      .from('insights-images')
      .upload(fileName, uploadFile, { cacheControl: '3600', upsert: false, contentType: 'image/jpeg' });

    if (uploadError) {
      resStatusMsg.textContent = 'Image upload failed: ' + uploadError.message;
      return;
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from('insights-images')
      .getPublicUrl(fileName);

    currentResourceCoverUrl = publicUrlData.publicUrl;
    resCoverPreview.innerHTML = `<img src="${currentResourceCoverUrl}" alt="Cover preview" />`;
    resStatusMsg.textContent = 'Cover image uploaded.';
  });

  csDeleteBtn.addEventListener('click', async () => {
    if (!currentPortfolioId) return;
    if (!confirm('Delete this case study? This cannot be undone.')) return;
    await supabaseClient.from('portfolio_items').delete().eq('id', currentPortfolioId);
    showView('portfolio-list');
    loadPortfolio();
  });

  csSaveBtn.addEventListener('click', async () => {
    const brandName = csBrandName.value.trim();
    const result = csResult.value.trim();
    const challenge = csChallenge.value.trim();
    const approach = csApproach.value.trim();
    const outcome = csOutcome.value.trim();

    if (!brandName || !result || !challenge || !approach || !outcome) {
      csStatusMsg.textContent = 'Brand name, result, challenge, approach, and outcome are required.';
      return;
    }

    const payload = {
      brand_name: brandName,
      category: csCategory.value,
      eyebrow: csEyebrow.value.trim(),
      tag_1: csTag1.value.trim(),
      tag_2: csTag2.value.trim(),
      result_stat: result,
      challenge,
      approach,
      outcome,
      closing_line: csClosing.value.trim(),
      image_url: currentPortfolioCoverUrl,
      display_order: parseInt(csOrder.value, 10) || 0,
      published: csPublished.checked,
      updated_at: new Date().toISOString(),
    };

    csStatusMsg.textContent = 'Saving…';
    let error;
    if (currentPortfolioId) {
      ({ error } = await supabaseClient.from('portfolio_items').update(payload).eq('id', currentPortfolioId));
    } else {
      ({ error } = await supabaseClient.from('portfolio_items').insert(payload));
    }

    if (error) {
      csStatusMsg.textContent = 'Could not save: ' + error.message;
      return;
    }

    csStatusMsg.textContent = 'Saved.';
    setTimeout(() => {
      showView('portfolio-list');
      loadPortfolio();
    }, 500);
  });

  resDeleteBtn.addEventListener('click', async () => {
    if (!currentResourceId) return;
    if (!confirm('Delete this resource? This cannot be undone.')) return;
    await supabaseClient.from('resources').delete().eq('id', currentResourceId);
    showView('resources');
    loadResources();
  });

  resSaveBtn.addEventListener('click', async () => {
    const title = resTitle.value.trim();
    const description = resDescription.value.trim();
    const price = resPrice.value !== '' ? parseFloat(resPrice.value) : null;
    const originalPrice = resOriginalPrice.value !== '' ? parseFloat(resOriginalPrice.value) : null;
    const status = resStatus.value;
    const displayOrder = parseInt(resOrder.value, 10) || 0;
    const externalLink = resExternalLink.value.trim();

    if (!title) {
      resStatusMsg.textContent = 'Title is required.';
      return;
    }

    const payload = {
      title,
      description,
      price,
      original_price: originalPrice,
      status,
      cover_image_url: currentResourceCoverUrl,
      external_link: externalLink,
      display_order: displayOrder,
      updated_at: new Date().toISOString(),
    };

    resStatusMsg.textContent = 'Saving…';
    let error;
    if (currentResourceId) {
      ({ error } = await supabaseClient.from('resources').update(payload).eq('id', currentResourceId));
    } else {
      ({ error } = await supabaseClient.from('resources').insert(payload));
    }

    if (error) {
      resStatusMsg.textContent = 'Could not save: ' + error.message;
      return;
    }

    resStatusMsg.textContent = 'Saved.';
    setTimeout(() => {
      showView('resources');
      loadResources();
    }, 500);
  });

  async function checkSession() {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
      showView('list');
      loadPosts();
    } else {
      showView('login');
    }
  }

  loginBtn.addEventListener('click', async () => {
    loginError.textContent = '';
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passwordInput.value,
    });
    if (error) {
      loginError.textContent = 'Could not sign in. Check your email and password.';
      return;
    }
    showView('list');
    loadPosts();
  });

  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    showView('login');
  });

  newPostBtn.addEventListener('click', () => {
    resetEditor();
    showView('editor');
  });

  backBtn.addEventListener('click', () => {
    showView('list');
    loadPosts();
  });

  function resetEditor() {
    currentPostId = null;
    currentCoverUrl = '';
    slugManuallyEdited = false;
    titleInput.value = '';
    slugInput.value = '';
    categoryInput.value = '';
    excerptInput.value = '';
    bodyInput.value = '';
    publishedInput.checked = false;
    coverInput.value = '';
    coverPreview.innerHTML = '<span>No Cover Image</span>';
    statusMsg.textContent = '';
    deleteBtn.classList.add('admin-hidden');
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  async function loadPosts() {
    postList.innerHTML = '<div class="admin-list__row">Loading…</div>';
    const { data, error } = await supabaseClient
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      postList.innerHTML = '';
      listEmpty.classList.remove('admin-hidden');
      listEmpty.querySelector('p').textContent = 'Could not load posts: ' + error.message;
      return;
    }

    if (!data || !data.length) {
      postList.innerHTML = '';
      listEmpty.classList.remove('admin-hidden');
      return;
    }

    listEmpty.classList.add('admin-hidden');
    postList.innerHTML = data.map((post) => `
      <div class="admin-list__row" data-id="${post.id}">
        <div>
          <strong>${post.title || '(Untitled)'}</strong><br>
          <span style="color:var(--color-text-muted); font-size:12px;">${formatDate(post.created_at)} · ${post.category || 'Uncategorized'}</span>
        </div>
        <span class="status ${post.published ? 'status--published' : 'status--draft'}">${post.published ? 'Published' : 'Draft'}</span>
        <button data-action="edit" data-id="${post.id}">Edit</button>
        <button data-action="delete" data-id="${post.id}" class="link-danger">Delete</button>
      </div>
    `).join('');
  }

  postList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'edit') {
      editPost(id);
    } else if (btn.dataset.action === 'delete') {
      if (confirm('Delete this post? This cannot be undone.')) {
        await supabaseClient.from('posts').delete().eq('id', id);
        loadPosts();
      }
    }
  });

  async function editPost(id) {
    const { data, error } = await supabaseClient.from('posts').select('*').eq('id', id).maybeSingle();
    if (error || !data) return;

    currentPostId = data.id;
    currentCoverUrl = data.cover_image_url || '';
    slugManuallyEdited = true;

    titleInput.value = data.title || '';
    slugInput.value = data.slug || '';
    categoryInput.value = data.category || '';
    excerptInput.value = data.excerpt || '';
    bodyInput.value = data.body || '';
    publishedInput.checked = !!data.published;

    coverPreview.innerHTML = currentCoverUrl
      ? `<img src="${currentCoverUrl}" alt="Cover preview" />`
      : '<span>No Cover Image</span>';

    deleteBtn.classList.remove('admin-hidden');
    statusMsg.textContent = '';
    showView('editor');
  }

  coverInput.addEventListener('change', async () => {
    const file = coverInput.files[0];
    if (!file) return;

    statusMsg.textContent = 'Optimizing image…';
    let uploadFile;
    try {
      uploadFile = await compressImage(file);
    } catch (err) {
      uploadFile = file; // fall back to the original if compression fails
    }

    statusMsg.textContent = 'Uploading cover image…';
    const fileName = `${Date.now()}-${slugify(file.name.replace(/\.[^/.]+$/, ''))}.jpg`;

    const { error: uploadError } = await supabaseClient.storage
      .from('insights-images')
      .upload(fileName, uploadFile, { cacheControl: '3600', upsert: false, contentType: 'image/jpeg' });

    if (uploadError) {
      statusMsg.textContent = 'Image upload failed: ' + uploadError.message;
      return;
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from('insights-images')
      .getPublicUrl(fileName);

    currentCoverUrl = publicUrlData.publicUrl;
    coverPreview.innerHTML = `<img src="${currentCoverUrl}" alt="Cover preview" />`;
    statusMsg.textContent = 'Cover image uploaded.';
  });

  deleteBtn.addEventListener('click', async () => {
    if (!currentPostId) return;
    if (!confirm('Delete this post? This cannot be undone.')) return;
    await supabaseClient.from('posts').delete().eq('id', currentPostId);
    showView('list');
    loadPosts();
  });

  saveBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const slug = slugInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !slug || !body) {
      statusMsg.textContent = 'Title, slug, and body are required.';
      return;
    }

    const payload = {
      title,
      slug,
      category: categoryInput.value.trim(),
      excerpt: excerptInput.value.trim(),
      cover_image_url: currentCoverUrl,
      body,
      published: publishedInput.checked,
      updated_at: new Date().toISOString(),
    };

    statusMsg.textContent = 'Saving…';
    let error;
    if (currentPostId) {
      ({ error } = await supabaseClient.from('posts').update(payload).eq('id', currentPostId));
    } else {
      ({ error } = await supabaseClient.from('posts').insert(payload));
    }

    if (error) {
      statusMsg.textContent = 'Could not save: ' + error.message;
      return;
    }

    statusMsg.textContent = 'Saved.';
    setTimeout(() => {
      showView('list');
      loadPosts();
    }, 500);
  });

  checkSession();
})();
