(() => {
  'use strict';

  const data = window.PROTOTYPE_DATA;
  const state = { step: 0, name: '', design: null, hatched: false };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function slugFromLocation() {
    const parts = location.pathname.split('/').filter(Boolean);
    const prototypeIndex = parts.indexOf('prototype');
    const pathSlug = prototypeIndex >= 0 ? parts[prototypeIndex + 1] : '';
    return (pathSlug || new URLSearchParams(location.search).get('company') || 'demo').toLowerCase().replace(/[^a-z0-9-]/g, '');
  }

  function titleFromSlug(slug) {
    return slug.split('-').filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Your Company';
  }

  function marketFromIndustry(industry) {
    const value = (industry || '').toLowerCase();
    if (/construct|property|trade|building/.test(value)) return 'construction';
    if (/retail|commerce|hospitality/.test(value)) return 'retail';
    if (/health|medical|clinic|care/.test(value)) return 'healthcare';
    return 'professional';
  }

  const slug = slugFromLocation();
  const query = new URLSearchParams(location.search);
  const configured = data.prospects[slug];
  const prospect = configured || {
    company: titleFromSlug(slug),
    industry: query.get('industry') || 'Professional Services',
    market: marketFromIndustry(query.get('industry')),
    welcome: 'Build your first agent together, hatch it live, then explore a marketplace shaped around the work your team does every day.'
  };

  document.title = `${prospect.company} AI agent prototype | Agent Hatchers`;
  $('#header-company').textContent = `${prospect.company} · Private prototype`;
  $('#welcome-company').textContent = prospect.company;
  $('#welcome-copy').textContent = prospect.welcome;
  $('#industry-name').textContent = prospect.industry;

  function setStep(next) {
    if (next < 0 || next > 4) return;
    state.step = next;
    $$('.screen').forEach(screen => screen.classList.toggle('is-active', Number(screen.dataset.screen) === next));
    $$('.progress-step').forEach((step, index) => {
      step.classList.toggle('is-active', index === next);
      step.classList.toggle('is-done', index < next);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (next === 4) renderMarketplace();
  }

  $$('[data-next]').forEach(button => button.addEventListener('click', () => setStep(state.step + 1)));
  $$('.progress-step').forEach((button, index) => button.addEventListener('click', () => {
    if (index < state.step || (index === 4 && state.hatched)) setStep(index);
  }));

  const nameInput = $('#agent-name');
  const nameNext = $('#name-next');
  function updateName(value) {
    state.name = value.trim().slice(0, 24);
    nameInput.value = value.slice(0, 24);
    nameNext.disabled = state.name.length < 2;
    $$('[data-agent-name]').forEach(el => { el.textContent = state.name || 'your agent'; });
  }
  nameInput.addEventListener('input', event => updateName(event.target.value));
  nameInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !nameNext.disabled) nameNext.click();
  });
  $$('.suggestions button').forEach(button => button.addEventListener('click', () => {
    updateName(button.textContent);
    nameInput.focus();
  }));
  nameNext.addEventListener('click', () => setStep(2));

  const designGrid = $('#design-grid');
  data.designs.forEach(design => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'design-card';
    card.dataset.design = design.id;
    card.innerHTML = `<span class="design-avatar" style="--avatar-filter:${design.filter}"><img src="${design.image}" alt=""></span><b>${design.name}</b><small>${design.description}</small>`;
    card.addEventListener('click', () => {
      state.design = design;
      $$('.design-card').forEach(item => item.classList.toggle('is-selected', item === card));
      $('#design-next').disabled = false;
      $('#hatched-agent img').src = design.image;
      $('#hatched-agent').style.setProperty('--chosen-filter', design.filter);
    });
    designGrid.appendChild(card);
  });
  $('#design-next').addEventListener('click', () => setStep(3));

  const hatchStage = $('#hatch-stage');
  const hatchButton = $('#hatch-button');
  const marketplaceNext = $('#marketplace-next');
  const particleField = $('#particles');
  for (let i = 0; i < 30; i += 1) {
    const particle = document.createElement('i');
    particle.className = 'particle';
    const angle = (Math.PI * 2 * i) / 30;
    const distance = 90 + Math.random() * 170;
    particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    particle.style.setProperty('--delay', `${Math.random() * 0.2}s`);
    particleField.appendChild(particle);
  }

  hatchButton.addEventListener('click', () => {
    if (hatchStage.classList.contains('is-hatching') || state.hatched) return;
    hatchButton.disabled = true;
    $('#hatch-title').textContent = `${state.name} is hatching…`;
    $('#hatch-subtitle').textContent = 'A new AI teammate is coming to life.';
    hatchStage.classList.add('is-hatching');
    setTimeout(() => {
      hatchStage.classList.add('is-hatched');
      state.hatched = true;
      $('#hatch-title').textContent = `Meet ${state.name}.`;
      $('#hatch-subtitle').textContent = `${state.name} is ready to take on a clearly defined job for ${prospect.company}.`;
      hatchButton.classList.add('hidden');
      marketplaceNext.classList.remove('hidden');
    }, 2050);
  });
  marketplaceNext.addEventListener('click', () => setStep(4));

  const rail = $('#agent-rail');
  function openAgent(agent) {
    $('#modal-image').src = agent.image;
    $('#modal-image').alt = agent.name;
    $('#modal-category').textContent = agent.category;
    $('#modal-title').textContent = agent.name;
    $('#modal-summary').textContent = agent.summary;
    $('#modal-mcps').replaceChildren(...agent.mcps.map(name => {
      const chip = document.createElement('span'); chip.className = 'mcp-chip'; chip.textContent = name; return chip;
    }));
    $('#modal-capabilities').replaceChildren(...agent.capabilities.slice(0, 5).map(item => {
      const li = document.createElement('li'); li.textContent = item; return li;
    }));
    $('#modal').classList.add('is-open');
    $('#modal').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('.modal-close').focus();
  }

  function closeModal() {
    $('#modal').classList.remove('is-open');
    $('#modal').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderMarketplace() {
    if (rail.children.length) return;
    const ids = data.markets[prospect.market] || data.markets.professional;
    $('#market-count').textContent = ids.length;
    ids.forEach(id => {
      const agent = data.agents[id];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'agent-card';
      card.innerHTML = `<span class="agent-image"><img src="${agent.image}" alt=""></span><span class="agent-body"><span class="agent-category">${agent.category}</span><h3>${agent.name}</h3><p>${agent.summary}</p><span class="agent-meta"><span><strong>${agent.mcps.length}</strong> MCP connections</span><b>View agent →</b></span></span>`;
      card.addEventListener('click', () => openAgent(agent));
      rail.appendChild(card);
    });
  }

  $('#scroll-left').addEventListener('click', () => rail.scrollBy({ left: -310, behavior: 'smooth' }));
  $('#scroll-right').addEventListener('click', () => rail.scrollBy({ left: 310, behavior: 'smooth' }));
  $('.modal-close').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', event => { if (event.target === $('#modal')) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
  $('#restart').addEventListener('click', () => {
    state.step = 0; state.name = ''; state.design = null; state.hatched = false;
    nameInput.value = ''; nameNext.disabled = true; $('#design-next').disabled = true;
    $$('.design-card').forEach(item => item.classList.remove('is-selected'));
    hatchStage.classList.remove('is-hatching', 'is-hatched');
    hatchButton.disabled = false; hatchButton.classList.remove('hidden'); marketplaceNext.classList.add('hidden');
    $('#hatch-title').innerHTML = '<span data-agent-name>Your agent</span> is ready.';
    $('#hatch-subtitle').textContent = 'When everyone is ready, start the hatching ceremony.';
    setStep(0);
  });
})();
