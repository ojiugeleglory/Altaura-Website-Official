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

    const tabsRow = document.querySelector('.admin-tabs');
    if (tabsRow) tabsRow.classList.toggle('admin-hidden', view === 'editor');
    newPostBtn.classList.toggle('admin-hidden', view !== 'list');

    tabPosts.classList.toggle('is-active', view === 'list');
    tabSubscribers.classList.toggle('is-active', view === 'subscribers');
  }

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

    statusMsg.textContent = 'Uploading cover image…';
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${slugify(file.name.replace(/\.[^/.]+$/, ''))}.${fileExt}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('insights-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

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
