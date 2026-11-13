(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const stickyCta = document.querySelector('.mobile-sticky');

  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  const updateChrome = () => {
    const scrolled = window.scrollY > 24;
    header.classList.toggle('scrolled', scrolled);
    stickyCta?.classList.toggle('visible', window.scrollY > 300);
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

  const applySection = document.querySelector('[data-apply-section]');
  const applyCard = document.querySelector('[data-apply-card]');
  const applyForm = document.querySelector('[data-apply-form]');
  const applyFlow = document.querySelector('[data-apply-flow]');
  const bookingStage = document.querySelector('[data-booking-stage]');
  const bookingTitle = document.querySelector('[data-booking-title]');
  const progressLabel = document.querySelector('[data-progress-label]');
  const progressBar = document.querySelector('[data-progress-bar]');
  const budgetNote = document.querySelector('[data-budget-note]');
  const heroForm = document.querySelector('[data-hero-form]');
  const applySteps = applyForm ? [...applyForm.querySelectorAll('[data-step]')] : [];
  const TOTAL_STEPS = applySteps.length;
  let currentStep = 1;

  const showStep = (n, focus = true) => {
    currentStep = n;
    applySteps.forEach((step) => { step.hidden = step.dataset.step !== String(n); });
    progressLabel.textContent = `Step ${n} of ${TOTAL_STEPS}`;
    progressBar.style.width = `${(n / TOTAL_STEPS) * 100}%`;
    if (focus) applySteps[n - 1].querySelector('input')?.focus({ preventScroll: true });
  };

  const stepIsValid = (n) => {
    const fields = [...applySteps[n - 1].querySelectorAll('input')];
    for (const field of fields) {
      field.removeAttribute('aria-invalid');
      if (!field.checkValidity()) {
        field.setAttribute('aria-invalid', 'true');
        field.reportValidity();
        return false;
      }
    }
    return true;
  };

  applyForm?.addEventListener('click', (event) => {
    if (event.target.closest('[data-next]') && stepIsValid(currentStep)) showStep(currentStep + 1);
    if (event.target.closest('[data-back]')) showStep(currentStep - 1);
  });

  const LOW_BUDGET = ['Not advertising yet', 'Under £3,000'];
  const LOW_VALUE = ['Under £3,000'];
  applyForm?.addEventListener('change', (event) => {
    if (!['budget', 'value'].includes(event.target.name) || !budgetNote) return;
    const budget = applyForm.elements.budget.value;
    const value = applyForm.elements.value.value;
    budgetNote.hidden = !(LOW_BUDGET.includes(budget) || LOW_VALUE.includes(value));
  });

  applyForm?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.target.type === 'radio' || currentStep === TOTAL_STEPS) return;
    event.preventDefault();
    if (stepIsValid(currentStep)) showStep(currentStep + 1);
  });

  heroForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const website = heroForm.elements.website.value.trim();
    if (!website) {
      heroForm.elements.website.focus();
      return;
    }
    if (applyForm) applyForm.elements.website.value = website;
    applySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => applyForm.elements.service.focus({ preventScroll: true }), 450);
  });

  let calendarStarted = false;
  const startCalendar = (prefill) => {
    if (calendarStarted || typeof Cal === 'undefined') return;
    calendarStarted = true;
    Cal('init', '30min', { origin: 'https://app.cal.com' });
    Cal.config = Cal.config || {};
    Cal.config.forwardQueryParams = true;
    Cal.ns['30min']('inline', {
      elementOrSelector: '#my-cal-inline-30min',
      config: { layout: 'month_view', useSlotsViewOnSmallScreen: true, ...prefill },
      calLink: 'ben-abel-x1uqrg/30min',
    });
    Cal.ns['30min']('ui', { cssVarsPerTheme: { light: { 'cal-brand': '#0d2945' } }, hideEventTypeDetails: false, layout: 'month_view' });

    const calSkeleton = document.querySelector('[data-calendar-skeleton]');
    const calContainer = document.querySelector('#my-cal-inline-30min');
    const hideSkeleton = () => calSkeleton?.classList.add('is-hidden');
    const watchForIframe = new MutationObserver(() => {
      const iframe = calContainer.querySelector('iframe');
      if (!iframe) return;
      iframe.addEventListener('load', hideSkeleton, { once: true });
      watchForIframe.disconnect();
    });
    watchForIframe.observe(calContainer, { childList: true });
    window.setTimeout(hideSkeleton, 6000);
  };

  applyForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!stepIsValid(currentStep)) return;
    const data = new FormData(applyForm);
    const notes = [
      `Website: ${data.get('website')}`,
      `Service: ${data.get('service')}`,
      `Monthly Google Ads budget: ${data.get('budget')}`,
      `Average customer value: ${data.get('value')}`,
      `Phone: ${data.get('phone')}`,
    ].join('\n');
    startCalendar({ name: data.get('name'), email: data.get('email'), notes });
    const firstName = String(data.get('name')).trim().split(/\s+/)[0];
    bookingTitle.textContent = `Choose a time to talk, ${firstName}`;
    applyFlow.hidden = true;
    bookingStage.hidden = false;
    applySection.classList.add('is-booking');
    applySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    bookingTitle.focus({ preventScroll: true });
  });

  showStep(1, false);

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
