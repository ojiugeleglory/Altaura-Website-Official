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
