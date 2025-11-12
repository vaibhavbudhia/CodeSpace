const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const state = { source: 'global', query: 'breast cancer', perPage: 12 };

function renderNotice() {
  const n = $('#notice');
  if (state.source === 'global') n.innerText = 'Results from ClinicalTrials.gov (live).';
  if (state.source === 'india') n.innerText = 'CTRI results require a proxy server due to CORS limitations.';
  if (state.source === 'news') n.innerText = 'News tab fetches RSS or News API results.';
}

function makeCard(item, source) {
  const el = document.createElement('div'); el.className = 'card';
  const meta = `<div class="pill">${source.toUpperCase()}</div><div class="muted">${item.status || ''}</div>`;
  el.innerHTML = `<div class='meta'>${meta}</div><h3 class='title'>${item.title || 'Untitled'}</h3><div class='desc'>${item.brief_summary || ''}</div>`;
  const footer = document.createElement('div'); footer.className = 'footer';
  footer.innerHTML = `<div class='small'>${item.conditions || ''}</div><div><button class='switch'>Details</button></div>`;
  footer.querySelector('button').addEventListener('click', ()=>openModal(item, source));
  el.appendChild(footer);
  return el;
}

async function fetchClinicalTrials(query, max = 12) {
  const url = `https://clinicaltrials.gov/api/query/full_studies?expr=${encodeURIComponent(query)}&min_rnk=1&max_rnk=${max}&fmt=json`;
  const res = await fetch(url).then(r => r.json());
  const arr = res?.FullStudiesResponse?.FullStudies || [];
  return arr.map(s => {
    const info = s.Study;
    return {
      title: info?.ProtocolSection?.IdentificationModule?.OfficialTitle || info?.ProtocolSection?.IdentificationModule?.BriefTitle,
      brief_summary: info?.ProtocolSection?.DescriptionModule?.BriefSummary || '',
      status: info?.ProtocolSection?.StatusModule?.OverallStatus,
      conditions: (info?.ProtocolSection?.ConditionsModule?.ConditionList?.Condition || []).join(', '),
      url: 'https://clinicaltrials.gov/study/' + (info?.ProtocolSection?.IdentificationModule?.NCTId || '')
    };
  });
}

async function runSearch() {
  const out = $('#results'); out.innerHTML = '';
  const loading = document.createElement('div'); loading.style.gridColumn = '1/-1'; loading.style.textAlign = 'center'; loading.innerHTML = '<div class="loader"></div>';
  out.appendChild(loading);
  let items = [];
  if (state.source === 'global') items = await fetchClinicalTrials(state.query, state.perPage);
  out.innerHTML = '';
  if (!items.length) out.innerHTML = '<div>No results found.</div>';
  items.forEach(it => out.appendChild(makeCard(it, state.source)));
}

function openModal(item, source) {
  $('#modTitle').innerText = item.title;
  $('#modLeft').innerHTML = `<p><strong>Status:</strong> ${item.status}</p><p><strong>Conditions:</strong> ${item.conditions}</p>`;
  $('#modRight').innerHTML = `<p>${item.brief_summary}</p>`;
  $('#openExternal').dataset.url = item.url;
  $('#modalBg').style.display = 'flex';
}
$('#closeModal').addEventListener('click', () => $('#modalBg').style.display = 'none');
$('#searchBtn').addEventListener('click', () => { state.query = $('#q').value.trim() || 'breast cancer'; runSearch(); });
$$('.tab').forEach(t => t.addEventListener('click', () => { $$('.tab').forEach(x => x.classList.remove('active')); t.classList.add('active'); state.source = t.dataset.source; renderNotice(); runSearch(); }));

renderNotice(); runSearch();
