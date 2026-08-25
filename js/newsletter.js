// Altaura — footer newsletter signup
// Saves emails to Supabase (table: subscribers). Runs on every page since
// the form lives in the shared footer.

(function () {
  const form = document.querySelector('[data-newsletter-form]');
  if (!form) return;

  const emailInput = form.querySelector('[data-newsletter-email]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const msg = form.querySelector('[data-newsletter-msg]');

  function showSubscribed(message) {
    emailInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribed ✓';
    msg.textContent = message;
    msg.classList.add('footer-newsletter__msg--success');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      msg.textContent = 'Newsletter is not connected yet.';
      return;
    }

    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      msg.textContent = 'Please enter a valid email address.';
      return;
    }

    submitBtn.disabled = true;
    msg.classList.remove('footer-newsletter__msg--success');
    msg.textContent = 'Subscribing…';

    const { error } = await supabaseClient.from('subscribers').insert({ email });

    if (error && error.code === '23505') {
      // 23505 = duplicate email, this address is already subscribed
      showSubscribed("You're already subscribed to our newsletter.");
      return;
    }

    if (error) {
      msg.textContent = 'Something went wrong. Please try again.';
      submitBtn.disabled = false;
      return;
    }

    showSubscribed("You're subscribed! Watch your inbox.");
  });
})();
