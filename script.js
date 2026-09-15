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
    stickyCta?.classList.toggle('visible', window.scrollY > 300 && !dialog?.open);
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

  const CPL = 100;
  const CPQL = 300;
  const CLOSE_RATE = 0.25;
  const spendInput = document.querySelector('#calc-spend');
  const revenueInput = document.querySelector('#calc-revenue');
  const spendValueLabel = document.querySelector('[data-calc-spend-value]');
  const revenueValueLabel = document.querySelector('[data-calc-revenue-value]');
  const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

  const setRangeProgress = (input) => {
    if (!input) return;
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const pct = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.setProperty('--range-progress', `${pct}%`);
  };

  const tweenValues = {};
  const animateNumber = (key, el, from, to, format, duration = 350) => {
    if (!el) return;
    cancelAnimationFrame(tweenValues[key]);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      el.textContent = format(from + (to - from) * eased);
      if (t < 1) tweenValues[key] = requestAnimationFrame(step);
    };
    tweenValues[key] = requestAnimationFrame(step);
  };

  const previous = { leads: 0, qualified: 0, customers: 0, revenue: 0, roas: 0 };

  const updateCalculator = () => {
    const spend = Number(spendInput?.value) || 0;
    const avgRevenue = Number(revenueInput?.value) || 0;
    const leads = spend / CPL;
    const qualifiedLeads = spend / CPQL;
    const customers = qualifiedLeads * CLOSE_RATE;
    const revenue = customers * avgRevenue;
    const roas = spend > 0 ? revenue / spend : 0;

    if (spendValueLabel) spendValueLabel.textContent = gbp.format(spend);
    if (revenueValueLabel) revenueValueLabel.textContent = gbp.format(avgRevenue);
    setRangeProgress(spendInput);
    setRangeProgress(revenueInput);

    animateNumber('leads', document.querySelector('[data-calc-leads]'), previous.leads, leads, (v) => Math.round(v).toLocaleString('en-GB'));
    animateNumber('qualified', document.querySelector('[data-calc-qualified]'), previous.qualified, qualifiedLeads, (v) => v.toFixed(1));
    animateNumber('customers', document.querySelector('[data-calc-customers]'), previous.customers, customers, (v) => v.toFixed(1));
    animateNumber('revenue', document.querySelector('[data-calc-revenue]'), previous.revenue, revenue, (v) => gbp.format(v));
    animateNumber('roas', document.querySelector('[data-calc-roas]'), previous.roas, roas, (v) => `${v.toFixed(1)}x`);

    previous.leads = leads;
    previous.qualified = qualifiedLeads;
    previous.customers = customers;
    previous.revenue = revenue;
    previous.roas = roas;
  };

  spendInput?.addEventListener('input', updateCalculator);
  revenueInput?.addEventListener('input', updateCalculator);
  updateCalculator();

  document.querySelectorAll('.faq-list details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.faq-list details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });
})();
