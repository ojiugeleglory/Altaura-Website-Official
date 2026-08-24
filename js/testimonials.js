// Altaura — homepage testimonial carousel
// Rotates through client quotes with a soft fade, dot navigation, and auto-advance.

(function () {
  const root = document.querySelector('[data-testimonial-carousel]');
  if (!root) return;

  const content = root.querySelector('[data-testimonial-content]');
  const quoteEl = root.querySelector('[data-testimonial-quote]');
  const nameEl = root.querySelector('[data-testimonial-name]');
  const roleEl = root.querySelector('[data-testimonial-role]');
  const dots = Array.from(root.querySelectorAll('[data-testimonial-dots] .dot'));

  const testimonials = [
    {
      quote: 'Altaura brought structure to our brand and made ordering easier for customers. The systems created improved both sales flow and fulfilment.',
      name: 'Founder',
      role: 'Abreas Natural Drinks',
    },
    {
      quote: 'Altaura helped refine our brand into something that feels more premium, intentional, and aligned with our vision.',
      name: 'Founder',
      role: 'Veezera Diffusers',
    },
    {
      quote: 'The logo, packaging, and visual refinement gave our brand a more professional and cohesive identity.',
      name: 'Founder',
      role: 'Tessy\u2019s Haven',
    },
    {
      quote: 'Altaura brought clarity, consistency, and a more elevated feel to my author brand and book launch.',
      name: 'Elizabeth Eniola Shodipe',
      role: 'Author',
    },
  ];

  let current = 0;
  let timer = null;

  function render(index) {
    content.classList.add('is-fading');
    setTimeout(() => {
      const t = testimonials[index];
      quoteEl.textContent = t.quote;
      nameEl.textContent = t.name;
      roleEl.textContent = t.role;
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      content.classList.remove('is-fading');
    }, 250);
  }

  function goTo(index) {
    current = (index + testimonials.length) % testimonials.length;
    render(current);
  }

  function startAutoAdvance() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 6000);
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index, 10));
      startAutoAdvance();
    });
  });

  startAutoAdvance();
})();
