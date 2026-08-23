// Altaura — sticky chat widget
// Talks to /api/chat (a Vercel serverless function) which calls the Anthropic API.

(function () {
  const widget = document.querySelector('[data-chat-widget]');
  if (!widget) return;

  const trigger = widget.querySelector('.chat-widget__trigger');
  const closeBtn = widget.querySelector('.chat-widget__close');
  const messagesEl = widget.querySelector('[data-chat-messages]');
  const form = widget.querySelector('[data-chat-form]');
  const input = widget.querySelector('[data-chat-input]');
  const sendBtn = widget.querySelector('[data-chat-send]');

  const history = []; // { role: 'user' | 'assistant', content: string }
  let hasGreeted = false;
  let isSending = false;

  function linkify(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(urlPattern, (url) => {
      const clean = url.replace(/[.,)]+$/, '');
      return `<a href="${clean}" target="_blank" rel="noreferrer">${clean}</a>`;
    });
  }

  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = `chat-widget__msg chat-widget__msg--${role === 'user' ? 'user' : 'bot'}`;
    el.innerHTML = linkify(text);
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-widget__typing';
    el.setAttribute('data-typing-indicator', '');
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function greet() {
    if (hasGreeted) return;
    hasGreeted = true;
    addMessage('bot', "Hi, I'm the Altaura assistant. Ask me about our services, what's included in each package, or how to get started, and I'll point you the right way.");
  }

  function openWidget() {
    widget.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    greet();
    setTimeout(() => input.focus(), 300);
  }

  function closeWidget() {
    widget.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (widget.classList.contains('is-open')) {
      closeWidget();
    } else {
      openWidget();
    }
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeWidget();
  });

  document.addEventListener('click', (e) => {
    if (widget.classList.contains('is-open') && !widget.contains(e.target)) {
      closeWidget();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeWidget();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || isSending) return;

    addMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    isSending = true;
    sendBtn.disabled = true;

    const typingEl = showTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      typingEl.remove();

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      const reply = data.reply || "Sorry, I didn't quite catch that. Could you try asking again?";
      addMessage('bot', reply);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      typingEl.remove();
      addMessage('bot', "Sorry, I'm having trouble connecting right now. You can reach us directly on WhatsApp at +234 803 305 5684, or send an inquiry: https://forms.gle/a91VRKFu6KSutTgX9");
    } finally {
      isSending = false;
      sendBtn.disabled = false;
    }
  });
})();
