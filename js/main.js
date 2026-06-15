const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navPanel = document.querySelector('.nav-panel');
const navLinks = document.querySelectorAll('.nav-link');
const animateItems = document.querySelectorAll('.animate-on-scroll');
const filterTabs = document.querySelectorAll('.filter-tab');
const caseCards = document.querySelectorAll('.case-study-card');
const faqItems = document.querySelectorAll('.faq-item');

if (header) {
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

if (navToggle && navPanel) {
  navToggle.addEventListener('click', () => {
    const open = navPanel.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  navPanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navPanel.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  animateItems.forEach((item) => observer.observe(item));
}

navLinks.forEach((link) => {
  const href = link.getAttribute('href');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  if (href === currentPath || (currentPath === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

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
      const expanded = card.classList.contains('expanded');
      toggle.setAttribute('aria-expanded', String(expanded));
    });
  }
});

faqItems.forEach((item) => {
  const question = item.querySelector('.faq-question');
  if (question) {
    question.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      question.setAttribute('aria-expanded', String(open));
    });
  }
});

/* Sticky Inquiry Bubble */
const inquiryBubble = document.querySelector('[data-inquiry-bubble]');

if (inquiryBubble) {
  const inquiryTrigger = inquiryBubble.querySelector('.inquiry-bubble__trigger');
  const inquiryClose = inquiryBubble.querySelector('.inquiry-bubble__close');
  const inquiryCta = inquiryBubble.querySelector('[data-inquiry-cta]');
  const inquiryEyebrow = inquiryBubble.querySelector('[data-inquiry-eyebrow]');
  const inquirySubtext = inquiryBubble.querySelector('[data-inquiry-subtext]');
  const inquiryStorageKey = 'altaura_inquiry_clicked';

  const updateInquiryCopy = () => {
    if (localStorage.getItem(inquiryStorageKey) === 'true') {
      inquiryEyebrow.textContent = 'YOU\'RE BOOKED';
      inquirySubtext.textContent = "Check your email for the calendar invite.";
    }
  };

  const openInquiryBubble = () => {
    updateInquiryCopy();
    inquiryBubble.classList.add('is-open');
    inquiryTrigger.setAttribute('aria-expanded', 'true');
  };

  const closeInquiryBubble = () => {
    inquiryBubble.classList.remove('is-open');
    inquiryTrigger.setAttribute('aria-expanded', 'false');
  };

  inquiryTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    openInquiryBubble();
  });

  inquiryClose.addEventListener('click', (event) => {
    event.stopPropagation();
    closeInquiryBubble();
  });

  inquiryCta.addEventListener('click', () => {
    localStorage.setItem(inquiryStorageKey, 'true');
    updateInquiryCopy();
  });

  document.addEventListener('click', (event) => {
    if (inquiryBubble.classList.contains('is-open') && !inquiryBubble.contains(event.target)) {
      closeInquiryBubble();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeInquiryBubble();
    }
  });
}

/* Brand Clarity Quiz */
(function () {
  var quizRoot = document.querySelector('[data-brand-quiz]');
  if (!quizRoot) return;

  var INQUIRY = 'https://forms.gle/a91VRKFu6KSutTgX9';
  var TOTAL = 5;

  var QUESTIONS = [
    {
      text: "How would you describe your brand right now?",
      options: [
        { text: "I’m just starting out — I have a business idea but no real brand yet", tag: "Creation" },
        { text: "I have a brand but it feels inconsistent or unclear", tag: "Audit" },
        { text: "My brand looks okay but doesn’t feel premium or aligned", tag: "Refinement" },
        { text: "I’ve grown and my brand no longer reflects where I am", tag: "Transformation" }
      ]
    },
    {
      text: "What is the biggest challenge your brand is facing?",
      options: [
        { text: "I don’t know how to position myself or stand out", tag: "Strategy" },
        { text: "My visuals look scattered or unprofessional", tag: "Refinement" },
        { text: "People don’t fully understand what I offer or who it’s for", tag: "Strategy" },
        { text: "I’m not converting the attention I get into actual sales", tag: "Transformation" }
      ]
    },
    {
      text: "How clear is your brand messaging right now?",
      options: [
        { text: "I don’t have a clear message — I say different things in different places", tag: "Strategy" },
        { text: "I have a message but I’m not sure it resonates with the right people", tag: "Strategy" },
        { text: "My message is clear but my visuals don’t match the level I want", tag: "Refinement" },
        { text: "My messaging and visuals are decent but my positioning feels weak", tag: "Transformation" }
      ]
    },
    {
      text: "What outcome matters most to you right now?",
      options: [
        { text: "I want a brand identity that looks professional and polished", tag: "Refinement" },
        { text: "I want people to immediately understand what I do and trust me", tag: "Strategy" },
        { text: "I want my brand to feel premium and attract better clients", tag: "Transformation" },
        { text: "I want a complete brand overhaul — strategy, visuals, and systems", tag: "Transformation" }
      ]
    },
    {
      text: "Where are you in your business journey?",
      options: [
        { text: "Pre-launch or just launched — building from scratch", tag: "Creation" },
        { text: "Early stage — operating but still finding my footing", tag: "Audit" },
        { text: "Growing — I have clients but I’ve outgrown my current brand", tag: "Refinement" },
        { text: "Established — I need a strategic repositioning, not just a refresh", tag: "Transformation" }
      ]
    }
  ];

  var RESULTS = {
    Audit: {
      heading: "Your brand needs a clear diagnosis first.",
      summary: "Before you invest in strategy or visuals, you need to know exactly what is not working and why. A Brand Audit gives you that clarity — showing you precisely where your brand is losing trust, attention, and sales, and what to fix first.",
      bullets: [
        "Your messaging may be inconsistent across touchpoints",
        "Visitors are likely confused about what you offer or who it is for",
        "The foundation needs clarity before elevation can happen"
      ],
      service: "Brand Audit"
    },
    Strategy: {
      heading: "Your brand needs sharper direction and positioning.",
      summary: "You have something real to offer, but your brand is not yet communicating it clearly. A Brand Strategy gives you the positioning, messaging framework, and direction your brand needs to stand out, attract the right people, and convert.",
      bullets: [
        "Your audience definition needs to be more precise",
        "Your messaging likely lacks a consistent, compelling voice",
        "You need a clear content and communication direction"
      ],
      service: "Brand Strategy"
    },
    Refinement: {
      heading: "Your brand needs to look as good as it actually is.",
      summary: "The thinking is there — but the visuals are not yet carrying the weight of your brand’s quality. A Visual Refinement elevates your identity so your brand commands the perception it deserves at first glance.",
      bullets: [
        "Your current visuals may be undermining your credibility",
        "Inconsistency across touchpoints is weakening brand recognition",
        "A refined visual system will make your quality immediately visible"
      ],
      service: "Visual Refinement"
    },
    Transformation: {
      heading: "Your brand is ready for a complete elevation.",
      summary: "You have outgrown where your brand currently is. What you need is not a refresh — it is a full repositioning: strategy, identity, messaging, and systems rebuilt to reflect the level you are operating at and the clients you want to attract.",
      bullets: [
        "Your brand no longer reflects your current positioning or ambition",
        "You need strategy and visuals working together, not separately",
        "A complete brand system will unlock the next level of growth"
      ],
      service: "Brand Transformation"
    },
    Creation: {
      heading: "Your brand needs to be built from the ground up.",
      summary: "You are at the beginning — and that is the best place to start with intention. Rather than building something that will need to be undone later, let’s build your brand correctly from day one with a strategy-first approach: clear positioning, a strong identity, and a system built to grow with you.",
      bullets: [
        "Starting with strategy protects every investment you make after",
        "A strong foundation means your brand attracts the right clients immediately",
        "You deserve a brand that reflects your vision from the very first impression"
      ],
      service: "Brand Transformation"
    }
  };

  var PRIORITY = ['Transformation', 'Refinement', 'Strategy', 'Audit', 'Creation'];

  var state = {
    index: 0,
    answers: new Array(TOTAL).fill(null),
    busy: false
  };

  var progressBar = quizRoot.querySelector('[data-quiz-progress-bar]');
  var counterEl   = quizRoot.querySelector('[data-quiz-counter]');
  var backBtn     = quizRoot.querySelector('[data-quiz-back]');
  var viewport    = quizRoot.querySelector('[data-quiz-viewport]');
  var nextBtn     = quizRoot.querySelector('[data-quiz-next]');
  var quizArea    = quizRoot.querySelector('[data-quiz-area]');
  var resultArea  = quizRoot.querySelector('[data-quiz-result]');

  function setNextEnabled(on) {
    nextBtn.disabled = !on;
  }

  function updateMeta(idx) {
    progressBar.style.width = (idx / TOTAL * 100) + '%';
    counterEl.textContent = 'Question ' + (idx + 1) + ' of ' + TOTAL;
    backBtn.style.visibility = idx > 0 ? 'visible' : 'hidden';
    setNextEnabled(state.answers[idx] !== null);
  }

  function createSlide(idx) {
    var q = QUESTIONS[idx];
    var slide = document.createElement('div');
    slide.className = 'quiz-slide';

    var qp = document.createElement('p');
    qp.className = 'quiz-question-text';
    qp.textContent = q.text;
    slide.appendChild(qp);

    var opts = document.createElement('div');
    opts.className = 'quiz-options';

    q.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      if (state.answers[idx] && state.answers[idx].optionIndex === i) {
        btn.classList.add('is-selected');
      }

      var span = document.createElement('span');
      span.textContent = opt.text;
      btn.appendChild(span);

      btn.insertAdjacentHTML('beforeend',
        '<svg class="quiz-option__check" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">' +
        '<path d="M3.5 9l4 4 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>'
      );

      btn.addEventListener('click', function () {
        slide.querySelectorAll('.quiz-option').forEach(function (o) { o.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        state.answers[idx] = { tag: opt.tag, optionIndex: i };
        setNextEnabled(true);
      });

      opts.appendChild(btn);
    });

    slide.appendChild(opts);
    return slide;
  }

  function transitionTo(newIdx, direction) {
    if (state.busy) return;
    state.busy = true;

    var outgoing = viewport.querySelector('.quiz-slide');
    var incoming = createSlide(newIdx);
    var inFrom   = direction === 'forward' ? '100%' : '-100%';
    var outTo    = direction === 'forward' ? '-100%' : '100%';

    // Lock viewport height so it doesn't collapse when children go absolute
    var lockedH = outgoing ? outgoing.offsetHeight : 0;
    viewport.style.height = lockedH + 'px';

    if (outgoing) {
      outgoing.style.position = 'absolute';
      outgoing.style.top = '0';
      outgoing.style.left = '0';
      outgoing.style.width = '100%';
    }
    incoming.style.position  = 'absolute';
    incoming.style.top       = '0';
    incoming.style.left      = '0';
    incoming.style.width     = '100%';
    incoming.style.transform = 'translateX(' + inFrom + ')';
    viewport.appendChild(incoming);

    // Double rAF ensures initial position is painted before animating
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (outgoing) {
          outgoing.style.transition = 'transform 300ms ease';
          outgoing.style.transform  = 'translateX(' + outTo + ')';
        }
        incoming.style.transition = 'transform 300ms ease';
        incoming.style.transform  = 'translateX(0)';
      });
    });

    // Update progress/counter immediately; next button disabled during transition
    progressBar.style.width  = (newIdx / TOTAL * 100) + '%';
    counterEl.textContent    = 'Question ' + (newIdx + 1) + ' of ' + TOTAL;
    backBtn.style.visibility = newIdx > 0 ? 'visible' : 'hidden';
    setNextEnabled(false);

    setTimeout(function () {
      if (outgoing) outgoing.remove();
      incoming.removeAttribute('style');
      viewport.style.height = '';
      state.index = newIdx;
      state.busy  = false;
      setNextEnabled(state.answers[newIdx] !== null);
    }, 320);
  }

  function calcWinner() {
    var counts = {};
    state.answers.forEach(function (a) {
      if (a) counts[a.tag] = (counts[a.tag] || 0) + 1;
    });
    var keys   = Object.keys(counts);
    var maxVal = keys.reduce(function (m, k) { return Math.max(m, counts[k]); }, 0);
    var tied   = keys.filter(function (k) { return counts[k] === maxVal; });
    tied.sort(function (a, b) { return PRIORITY.indexOf(a) - PRIORITY.indexOf(b); });
    return tied[0];
  }

  function copyToClipboard(text, btn, msg) {
    var origHTML = btn.innerHTML;
    var done = function () {
      btn.textContent = msg;
      setTimeout(function () { btn.innerHTML = origHTML; }, 2000);
    };
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove();
      done();
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  function showResult(tag) {
    var r = RESULTS[tag];
    var baseUrl  = window.location.href.split('?')[0];
    var shareUrl = baseUrl + '?result=' + tag;

    var bulletsHTML = r.bullets.map(function (b) {
      return '<li class="quiz-result__bullet">' + b + '</li>';
    }).join('');

    resultArea.innerHTML =
      '<p class="quiz-result__eyebrow">YOUR RESULT</p>' +
      '<h2 class="quiz-result__heading">' + r.heading + '</h2>' +
      '<p class="quiz-result__summary">' + r.summary + '</p>' +
      '<ul class="quiz-result__bullets">' + bulletsHTML + '</ul>' +
      '<p class="quiz-result__pill">Recommended: ' + r.service + '</p>' +
      '<div class="quiz-result__ctas">' +
        '<a class="button button--primary" href="' + INQUIRY + '" target="_blank" rel="noreferrer">Inquire About ' + r.service + '</a>' +
        '<a class="button button--ghost" href="services.html">View All Services</a>' +
      '</div>' +
      '<div class="quiz-share">' +
        '<span class="quiz-share__label">Share your result:</span>' +
        '<button type="button" class="quiz-share__btn" data-copy-link>' +
          '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
          '<path d="M5.5 1.5H2.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
          '<path d="M8.5 1.5h4v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<line x1="6" y1="8" x2="12.5" y2="1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' +
          ' Copy link' +
        '</button>' +
        '<button type="button" class="quiz-share__btn" data-share-instagram>' +
          '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
          '<rect x="1.5" y="1.5" width="11" height="11" rx="2.5" stroke="currentColor" stroke-width="1.4"/>' +
          '<circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.4"/>' +
          '<circle cx="10.25" cy="3.75" r="0.75" fill="currentColor"/></svg>' +
          ' Share on Instagram' +
        '</button>' +
      '</div>' +
      '<button type="button" class="quiz-result__retake" data-quiz-retake>Retake the quiz</button>';

    quizArea.hidden  = true;
    resultArea.removeAttribute('hidden');
    requestAnimationFrame(function () {
      resultArea.classList.add('quiz-result--visible');
    });

    try { history.replaceState(null, '', shareUrl); } catch (e) {}

    resultArea.querySelector('[data-copy-link]').addEventListener('click', function () {
      copyToClipboard(shareUrl, this, 'Copied!');
    });
    resultArea.querySelector('[data-share-instagram]').addEventListener('click', function () {
      copyToClipboard(r.heading + '\n\n' + r.summary, this, 'Copied! Paste this into your Instagram story.');
    });
    resultArea.querySelector('[data-quiz-retake]').addEventListener('click', resetQuiz);
  }

  function resetQuiz() {
    state.index   = 0;
    state.answers = new Array(TOTAL).fill(null);
    state.busy    = false;

    viewport.innerHTML = '';
    viewport.appendChild(createSlide(0));
    updateMeta(0);

    resultArea.classList.remove('quiz-result--visible');
    resultArea.setAttribute('hidden', '');
    resultArea.innerHTML = '';
    quizArea.removeAttribute('hidden');

    try { history.replaceState(null, '', window.location.pathname); } catch (e) {}
    quizRoot.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Boot: check for shared ?result= param, else render Q1
  (function () {
    var tag = new URLSearchParams(window.location.search).get('result');
    if (tag && RESULTS[tag]) {
      showResult(tag);
      return;
    }
    viewport.appendChild(createSlide(0));
    updateMeta(0);
  })();

  nextBtn.addEventListener('click', function () {
    if (state.busy || nextBtn.disabled) return;
    if (state.index < TOTAL - 1) {
      transitionTo(state.index + 1, 'forward');
    } else {
      progressBar.style.width = '100%';
      showResult(calcWinner());
    }
  });

  backBtn.addEventListener('click', function () {
    if (state.busy || state.index === 0) return;
    transitionTo(state.index - 1, 'back');
  });
})();

/* Timed Ebook Popup (fires after 10 seconds) */
const exitPopup = document.querySelector('[data-exit-popup]');

if (exitPopup && !window.location.pathname.toLowerCase().includes('ebooks')) {
  const exitCloseButtons = exitPopup.querySelectorAll('[data-exit-popup-close]');
  const exitForm = exitPopup.querySelector('[data-exit-popup-form]');
  const exitEmail = exitPopup.querySelector('[data-exit-popup-email]');
  const exitCover = exitPopup.querySelector('[data-exit-popup-cover]');
  const exitShownKey = 'altaura_exit_shown';
  const subscriberKey = 'altaura_subscribers';
  let successTimer;

  const showPopup = () => {
    if (sessionStorage.getItem(exitShownKey) === 'true') return;
    sessionStorage.setItem(exitShownKey, 'true');
    exitPopup.setAttribute('aria-hidden', 'false');
    exitPopup.classList.remove('is-closing');
    exitPopup.classList.add('is-visible');
    exitEmail.focus();
  };

  const closePopup = () => {
    clearTimeout(successTimer);
    exitPopup.classList.add('is-closing');
    exitPopup.classList.remove('is-visible');
    window.setTimeout(() => {
      exitPopup.classList.remove('is-closing');
      exitPopup.setAttribute('aria-hidden', 'true');
    }, 200);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const storeSubscriber = (email) => {
    const current = JSON.parse(localStorage.getItem(subscriberKey) || '[]');
    current.push(email);
    localStorage.setItem(subscriberKey, JSON.stringify(current));
  };

  if (exitCover) {
    exitCover.addEventListener('error', () => {
      exitCover.closest('.exit-popup__cover-wrap').classList.add('is-missing');
    });
  }

  // Fire after 10 seconds
  window.setTimeout(showPopup, 10000);

  exitCloseButtons.forEach((button) => button.addEventListener('click', closePopup));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && exitPopup.classList.contains('is-visible')) closePopup();
  });

  exitForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = exitEmail.value.trim();

    if (!isValidEmail(email)) {
      exitForm.classList.add('has-error');
      exitEmail.setAttribute('aria-invalid', 'true');
      return;
    }

    exitForm.classList.remove('has-error');
    exitEmail.removeAttribute('aria-invalid');
    storeSubscriber(email);
    exitPopup.classList.add('is-success');
    successTimer = window.setTimeout(closePopup, 6000);
  });
}
