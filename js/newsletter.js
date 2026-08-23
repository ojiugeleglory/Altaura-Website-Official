// Altaura — footer newsletter signup
// Saves emails to Supabase (table: subscribers). Runs on every page since
// the form lives in the shared footer.

(function () {
  const form = document.querySelector('[data-newsletter-form]');
  if (!form) return;

  const emailInput = form.querySelector('[data-newsletter-email]');
  const msg = form.querySelector('[data-newsletter-msg]');

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

    msg.textContent = 'Subscribing…';
    const { error } = await supabaseClient.from('subscribers').insert({ email });

    if (error && error.code !== '23505') {
      // 23505 = duplicate email, treat as a friendly success instead of an error
      msg.textContent = 'Something went wrong. Please try again.';
      return;
    }

    msg.textContent = "You're on the list.";
    form.reset();
  });
})();
