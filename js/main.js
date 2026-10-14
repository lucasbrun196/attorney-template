(() => {
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Abertura */
  const start = () => {
    body.classList.add('is-ready');
    setTimeout(() => body.classList.remove('is-loading'), 900);
  };
  if (document.readyState === 'complete') setTimeout(start, 700);
  else window.addEventListener('load', () => setTimeout(start, 700));
  // garantia caso alguma imagem demore
  setTimeout(start, 2200);

  /* Títulos: quebra em palavras para animar */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words
      .map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`)
      .join(' ');
  });

  /* Revelar ao rolar */
  const revealTargets = document.querySelectorAll('[data-reveal], [data-split]');

  // pequeno escalonamento entre irmãos
  const groups = new Map();
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const parent = el.parentElement;
    const idx = groups.get(parent) || 0;
    el.style.setProperty('--d', `${Math.min(idx, 5) * 0.08}s`);
    groups.set(parent, idx + 1);
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }

  /* Contadores */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 1800;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        runCounter(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(runCounter);
  }

  /* Cabeçalho, barra de progresso, parallax */
  const header = document.querySelector('.header');
  const bar = document.querySelector('.progress span');
  const whats = document.querySelector('.whats');
  const heroImg = document.querySelector('.hero__img');
  const parallax = [...document.querySelectorAll('[data-parallax]')];
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    header.classList.toggle('is-scrolled', y > 40);
    const menuOpen = body.classList.contains('menu-open');
    header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > window.innerHeight * 0.8);
    whats.classList.toggle('is-visible', y > window.innerHeight * 0.6);
    lastY = y;

    if (!reduceMotion) {
      if (y < window.innerHeight * 1.2 && body.classList.contains('is-ready')) {
        heroImg.style.translate = `0 ${y * 0.25}px`;
      }
      const vh = window.innerHeight;
      parallax.forEach((img) => {
        const rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const speed = Number(img.dataset.parallax) || 0.1;
        const offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
        img.style.transform = `translate3d(0, ${offset - rect.height * 0.1}px, 0)`;
      });
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Link ativo no menu */
  const navLinks = [...document.querySelectorAll('.nav a')];
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => sio.observe(s));
  }

  /* Menu móvel */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
    header.classList.remove('is-hidden');
  };
  burger.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open')));
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100 && mobileMenu.classList.contains('is-open')) setMenu(false);
  });

  /* Áreas de atuação (acordeão) */
  const areas = document.querySelectorAll('.area');
  areas.forEach((area) => {
    const btn = area.querySelector('.area__row');
    btn.addEventListener('click', () => {
      const willOpen = !area.classList.contains('is-open');
      areas.forEach((a) => {
        a.classList.remove('is-open');
        a.querySelector('.area__row').setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        area.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
  if (areas[0]) areas[0].querySelector('.area__row').click();

  /* FAQ: apenas um aberto por vez */
  const faqs = document.querySelectorAll('.faq details');
  faqs.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  }));

  /* Formulário (demonstração — não envia dados) */
  const form = document.querySelector('.form');
  const status = form.querySelector('.form__status');
  const submit = form.querySelector('button[type="submit"]');

  const phone = form.querySelector('input[name="telefone"]');
  phone.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g, '').slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    phone.value = out;
  });

  /* Dropdown de assunto (substitui a lista nativa, mantendo o <select> para validação) */
  form.querySelectorAll('[data-select]').forEach((wrap) => {
    const native = wrap.querySelector('select');
    const trigger = wrap.querySelector('.select__trigger');
    const valueEl = wrap.querySelector('.select__value');
    const list = wrap.querySelector('.select__list');
    const choices = [...native.options].filter((o) => !o.disabled);
    let active = -1;

    const items = choices.map((opt, i) => {
      const li = document.createElement('li');
      li.className = 'select__option';
      li.id = `${native.name}-opt-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.textContent = opt.textContent;
      li.addEventListener('click', () => choose(i));
      li.addEventListener('mousemove', () => setActive(i, false));
      list.appendChild(li);
      return li;
    });

    const setActive = (i, scroll = true) => {
      active = i;
      items.forEach((li, n) => li.classList.toggle('is-active', n === i));
      if (i >= 0) {
        trigger.setAttribute('aria-activedescendant', items[i].id);
        if (scroll) items[i].scrollIntoView({ block: 'nearest' });
      }
    };

    const sync = () => {
      const idx = choices.indexOf(native.selectedOptions[0]);
      valueEl.textContent = idx >= 0 ? choices[idx].textContent : '';
      wrap.classList.toggle('has-value', idx >= 0);
      items.forEach((li, n) => li.setAttribute('aria-selected', String(n === idx)));
      return idx;
    };

    const open = () => {
      if (wrap.classList.contains('is-open')) return;
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      setActive(Math.max(sync(), 0));
      document.addEventListener('pointerdown', outside);
    };
    const close = () => {
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
      document.removeEventListener('pointerdown', outside);
    };
    const outside = (e) => { if (!wrap.contains(e.target)) close(); };

    function choose(i) {
      native.value = choices[i].value;
      native.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
      close();
      trigger.focus();
    }

    trigger.addEventListener('click', () => (wrap.classList.contains('is-open') ? close() : open()));
    trigger.addEventListener('keydown', (e) => {
      const isOpen = wrap.classList.contains('is-open');
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp': {
          e.preventDefault();
          if (!isOpen) { open(); return; }
          const step = e.key === 'ArrowDown' ? 1 : -1;
          setActive((active + step + items.length) % items.length);
          break;
        }
        case 'Home': if (isOpen) { e.preventDefault(); setActive(0); } break;
        case 'End': if (isOpen) { e.preventDefault(); setActive(items.length - 1); } break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && active >= 0) choose(active); else open();
          break;
        case 'Escape': if (isOpen) { e.preventDefault(); close(); } break;
        case 'Tab': close(); break;
        default:
          // digitar a inicial pula para a opção correspondente
          if (e.key.length === 1) {
            const k = e.key.toLowerCase();
            const from = active + 1;
            const hit = [...items.slice(from), ...items.slice(0, from)]
              .find((li) => li.textContent.toLowerCase().startsWith(k));
            if (hit) { if (!isOpen) open(); setActive(items.indexOf(hit)); }
          }
      }
    });

    form.addEventListener('reset', () => setTimeout(sync));
    sync();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    form.querySelectorAll('input, textarea, select').forEach((field) => {
      const wrap = field.closest('.field, .check');
      const ok = field.checkValidity() && !(field.name === 'telefone' && field.value.replace(/\D/g, '').length < 10);
      wrap.classList.toggle('is-error', !ok);
      if (!ok && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      status.classList.add('is-error');
      status.textContent = 'Revise os campos destacados antes de enviar.';
      (firstInvalid.closest('[data-select]')?.querySelector('.select__trigger') || firstInvalid).focus();
      return;
    }

    status.classList.remove('is-error');
    status.textContent = '';
    submit.classList.add('is-sending');
    submit.querySelector('span').textContent = 'Enviando…';

    setTimeout(() => {
      submit.classList.remove('is-sending');
      submit.querySelector('span').textContent = 'Enviar mensagem';
      const nome = form.nome.value.trim().split(' ')[0];
      status.textContent = `Obrigado, ${nome}. Recebemos sua mensagem e retornaremos em até um dia útil.`;
      form.reset();
    }, 1400);
  });

  form.querySelectorAll('input, textarea, select').forEach((field) => {
    field.addEventListener('input', () => field.closest('.field, .check').classList.remove('is-error'));
    field.addEventListener('change', () => field.closest('.field, .check').classList.remove('is-error'));
  });

  /* Ano no rodapé */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
