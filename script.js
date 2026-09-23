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

  const marqueeToggle = document.querySelector('[data-marquee-toggle]');
  const logoTrack = document.querySelector('.logo-track');
  marqueeToggle?.addEventListener('click', () => {
    const paused = logoTrack.classList.toggle('is-paused');
    marqueeToggle.setAttribute('aria-pressed', String(paused));
    marqueeToggle.setAttribute('aria-label', paused ? 'Play scrolling logos' : 'Pause scrolling logos');
    marqueeToggle.querySelector('[data-icon-pause]').hidden = paused;
    marqueeToggle.querySelector('[data-icon-play]').hidden = !paused;
  });

  const calSkeleton = document.querySelector('[data-calendar-skeleton]');
  const calContainer = document.querySelector('#my-cal-inline-30min');
  if (calSkeleton && calContainer) {
    const hideSkeleton = () => calSkeleton.classList.add('is-hidden');
    const watchForIframe = new MutationObserver(() => {
      const iframe = calContainer.querySelector('iframe');
      if (!iframe) return;
      iframe.addEventListener('load', hideSkeleton, { once: true });
      watchForIframe.disconnect();
    });
    watchForIframe.observe(calContainer, { childList: true });
    window.setTimeout(hideSkeleton, 6000);
  }

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
