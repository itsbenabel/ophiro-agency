(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const stickyCta = document.querySelector('.mobile-sticky');
  const dialog = document.querySelector('[data-assessment-dialog]');
  const form = document.querySelector('[data-assessment-form]');
  const steps = [...document.querySelectorAll('[data-form-step]')];
  const success = document.querySelector('[data-form-success]');
  const progressLabel = document.querySelector('[data-progress-label]');
  const progressBar = document.querySelector('[data-progress-bar]');

  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  const updateChrome = () => {
    const scrolled = window.scrollY > 24;
    header.classList.toggle('scrolled', scrolled);
    stickyCta?.classList.toggle('visible', window.scrollY > 620 && !dialog?.open);
  };

  updateChrome();
  window.addEventListener('scroll', updateChrome, { passive: true });

  menuToggle?.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  mobileMenu?.querySelectorAll('a, button').forEach((item) => {
    item.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  const showStep = (stepNumber) => {
    steps.forEach((step) => step.classList.toggle('active', step.dataset.formStep === String(stepNumber)));
    success?.classList.remove('active');
    progressLabel.textContent = `Step ${stepNumber} of 2`;
    progressBar.style.width = stepNumber === 1 ? '50%' : '100%';
    dialog.querySelector('.dialog-form-wrap')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAssessment = () => {
    if (!dialog) return;
    showStep(1);
    form?.reset();
    dialog.showModal();
    document.body.classList.add('dialog-open');
    stickyCta?.classList.remove('visible');
    window.setTimeout(() => form?.querySelector('input')?.focus(), 80);
  };

  const closeAssessment = () => {
    if (!dialog?.open) return;
    dialog.close();
    document.body.classList.remove('dialog-open');
    updateChrome();
  };

  document.querySelectorAll('[data-open-assessment]').forEach((button) => button.addEventListener('click', openAssessment));
  document.querySelectorAll('[data-close-assessment]').forEach((button) => button.addEventListener('click', closeAssessment));

  dialog?.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) closeAssessment();
  });

  dialog?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeAssessment();
  });

  document.querySelector('[data-form-next]')?.addEventListener('click', () => {
    const firstStep = document.querySelector('[data-form-step="1"]');
    const fields = [...firstStep.querySelectorAll('input, select, textarea')];
    const valid = fields.every((field) => field.reportValidity());
    if (valid) showStep(2);
  });

  document.querySelector('[data-form-back]')?.addEventListener('click', () => showStep(1));

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    steps.forEach((step) => step.classList.remove('active'));
    success.classList.add('active');
    progressLabel.textContent = 'Complete';
    progressBar.style.width = '100%';
  });

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px' });
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('.faq-list details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.faq-list details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });
})();
