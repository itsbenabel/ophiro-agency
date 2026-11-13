(() => {
  // Where applications are sent. Set this to a form endpoint (Formspree, Resend
  // function, Zapier webhook, etc.) that accepts a JSON POST. Left empty on purpose.
  const APPLY_ENDPOINT = '/api/apply';

  const root = document.querySelector('[data-apply-root]');
  const form = document.querySelector('[data-apply-form]');
  const errorBox = document.querySelector('[data-error]');
  const submitBtn = document.querySelector('[data-submit]');
  const thanks = document.querySelector('[data-thanks]');

  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.hidden = false;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.hidden = true;

    for (const field of form.querySelectorAll('input, select, textarea')) {
      field.removeAttribute('aria-invalid');
    }
    const firstBad = [...form.querySelectorAll('input, select, textarea')].find((f) => !f.checkValidity());
    if (firstBad) {
      firstBad.setAttribute('aria-invalid', 'true');
      firstBad.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    if (data.company_website) return; // honeypot

    if (!APPLY_ENDPOINT) {
      showError('The form is not connected yet. Please try again later.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    try {
      const response = await fetch(APPLY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, submitted_at: new Date().toISOString(), source: 'ophiro.xyz/apply' }),
      });
      if (!response.ok) throw new Error(String(response.status));
      root.classList.add('is-sent');
      thanks.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showError('Something went wrong sending that. Please try again in a minute.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });
})();
