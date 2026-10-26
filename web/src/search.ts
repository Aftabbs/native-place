// The search: From and To boxes, the answer below them, and the share card.

import { type Answer, answer } from './answer';
import { drawCard } from './card';
import { CLASS_NAMES } from './explore';
import { loadSearch } from './exploreUi';
import { coverage, type Special } from './festival';
import { lang, ui, words } from './i18n';
import { legPath } from './journey';
import { buildPlaces, type Place, type Places, searchPlaces, spoken } from './places';
import { attachSuggest } from './suggest';
import { townsFor } from './towns';

export interface Route {
  paths: [number, number][][];
  roads: [number, number][][]; // to or from a station outside the place, by road
  from: [number, number];
  to: [number, number];
  labels: [string, string];
}

interface Inputs {
  dataUrl: string;
  siteUrl: string;
  specials: () => Special[];
  states: () => unknown;
  onRoute: (route: Route | null) => void;
  onSearch: (fromState: string, toState: string) => void;
}

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const rupees = (n: number) => n.toLocaleString('en-IN');

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface Coverage {
  zones: number;
  checked: string; // YYYY-MM-DD
  running: boolean; // some season's specials are still running
}

/** "17 Oct" or "17 अक्टू" for a YYYY-MM-DD date. */
function shortDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${words(lang()).month(m - 1)}`;
}

function renderAnswer(a: Answer, cov: Coverage): string {
  const t = ui();
  const w = words(lang());
  const steps = a.steps
    .map(
      (s, i) => `
      <li>
        ${s.when ? `<span class="when-tag">${esc(s.when)}</span>` : ''}
        <strong>${esc(s.train)}</strong>
        <span class="times">${esc(s.from)} <b>${esc(s.dep)}</b> → ${esc(s.to)} <b>${esc(s.arr)}</b></span>
        <span class="small">${esc(s.duration)} · ${esc(s.days)}</span>
        ${i === 0 && a.wait ? `<span class="wait">${esc(t.change(a.wait))}</span>` : ''}
      </li>`,
    )
    .join('');
  const fares = a.fares.length
    ? `<h3>${t.fareTitle}</h3>
       <ul class="fares">${a.fares
         .map((f) => `<li><span>${esc(w.className(f.cls, CLASS_NAMES[f.cls] ?? f.cls))}</span> <b>₹${rupees(f.low)}${f.high > f.low ? `–${rupees(f.high)}` : ''}</b></li>`)
         .join('')}</ul>
       <p class="small">${t.fareNote}</p>`
    : '';
  // Say how complete the list is, so a missing special reads as "not listed", not "none".
  const scope = t.scope(cov.zones, shortDate(cov.checked));
  const specials = a.specials.length
    ? `<h3>${t.specialsTitle}</h3>
       <p class="small">${esc(a.season ?? '')}. ${esc(scope)}</p>
       <ul class="specials">${a.specials
         .slice(0, 5)
         .map(
           (s) =>
             `<li><strong>${esc(s.n)}</strong> ${esc(s.name)}<span class="small">${esc(s.days.map(w.weekday).join(', ') || t.datesInNotice)}${s.last ? ` · ${esc(t.until(shortDate(s.last)))}` : ''} · <a href="${esc(s.source)}" target="_blank" rel="noopener">${t.notice}</a></span></li>`,
         )
         .join('')}</ul>`
    : cov.running
      ? `<h3>${t.specialsTitle}</h3><p class="small">${t.noneListed} ${esc(scope)}</p>`
      : '';
  const people = a.people;
  return `
    <h2 id="result-title">${esc(a.title)}</h2>
    <p class="headline">${esc(a.headline)}</p>
    ${a.notes.map((n) => `<p class="note">${esc(n)}</p>`).join('')}
    ${steps ? `<ol class="steps">${steps}</ol>` : ''}
    ${a.alternatives.length ? `<details><summary>${t.moreOptions(a.alternatives.length)}</summary><ul>${a.alternatives.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
    ${fares}
    ${a.steps.length ? `<p><a class="button" href="https://www.irctc.co.in/" target="_blank" rel="noopener">${t.book}</a></p>` : ''}
    ${specials}
    ${people.length ? `<h3>${t.notAlone}</h3><ul class="people">${people.map((f) => `<li>${esc(f.text)} <span class="small">(${esc(f.source)})</span></li>`).join('')}</ul>` : ''}
    <div class="actions">
      <button id="make-card" type="button" class="primary">${t.shareCard}</button>
      <button id="new-search" type="button">${t.newSearch}</button>
    </div>`;
}

let warm: (() => Promise<unknown>) | null = null;

/** Download the timetable and build the place index before anyone types. */
export function warmSearch() {
  return warm?.().catch(() => undefined);
}

export function setupSearch(inputs: Inputs) {
  const form = $<HTMLFormElement>('#search');
  const from = $<HTMLInputElement>('#from');
  const to = $<HTMLInputElement>('#to');
  const when = $<HTMLInputElement>('#when');
  when.min = today(); // trains in the past are no use
  const hint = $<HTMLParagraphElement>('#search-hint');
  const result = $<HTMLElement>('#result');
  const dialog = $<HTMLDialogElement>('#card-dialog');
  const canvas = $<HTMLCanvasElement>('#card-canvas');
  const share = $<HTMLButtonElement>('#card-share');
  const download = $<HTMLAnchorElement>('#card-download');
  const cardHint = $<HTMLParagraphElement>('#card-hint');

  let places: Place[] | null = null;
  let current: { answer: Answer; from: Place; to: Place; date?: string } | null = null;
  let blob: Blob | null = null;

  async function ready() {
    const loaded = await loadSearch(inputs.dataUrl);
    if (!places) {
      places = buildPlaces(loaded.places, loaded.explore);
      // Someone may have typed before the places arrived: suggest for what is there.
      const typing = [from, to].find((input) => input === document.activeElement);
      if (typing?.value) typing.dispatchEvent(new Event('input'));
    }
    return { loaded, places };
  }

  /** The place someone meant: districts, cities and main stations first, then towns. */
  async function resolve(text: string, all: Place[], data: Places): Promise<Place | null> {
    const towns = await townsFor(text, inputs.dataUrl, data);
    return searchPlaces(text, [...all, ...towns], 1)[0] ?? null;
  }

  /** Write the answer into the page, in the current language. */
  function show(a: Place, b: Place, date: string | undefined, loaded: Awaited<ReturnType<typeof ready>>['loaded']) {
    const ans = answer(a, b, { ...loaded, specials: inputs.specials(), today: today(), date, lang: lang() });
    current = { answer: ans, from: a, to: b, date };
    const listed = inputs.specials();
    const { zones, checked } = coverage(listed);
    const running = listed.some((x) => !x.last || x.last >= today());
    result.innerHTML = renderAnswer(ans, { zones, checked, running });
    result.hidden = false;
    document.body.classList.add('answered'); // the answer lists its own special trains
    $<HTMLButtonElement>('#make-card').addEventListener('click', openCard);
    $<HTMLButtonElement>('#new-search').addEventListener('click', () => {
      result.hidden = true;
      document.body.classList.remove('answered');
      inputs.onRoute(null);
      from.select();
    });
    return ans;
  }

  // A new language redraws the answer on screen, without moving the map again.
  document.addEventListener('langchange', async () => {
    if (!current || result.hidden) return;
    show(current.from, current.to, current.date, (await ready()).loaded);
  });

  async function search() {
    hint.textContent = ui().looking;
    const { loaded, places: all } = await ready();
    const [a, b] = await Promise.all([
      resolve(from.value, all, loaded.places),
      resolve(to.value, all, loaded.places),
    ]);
    if (!a || !b) {
      hint.textContent = ui().notFound(!a ? from.value : to.value);
      return;
    }
    if (a.label === b.label) {
      hint.textContent = ui().same;
      return;
    }
    from.value = a.label;
    to.value = b.label;
    // Put the keyboard away on phones so the answer is visible.
    if (document.activeElement instanceof HTMLElement && form.contains(document.activeElement)) document.activeElement.blur();
    hint.textContent = '';
    const date = when.value && when.value >= today() ? when.value : undefined;
    const ans = show(a, b, date, loaded);
    const url = new URL(location.href);
    url.searchParams.set('from', a.label);
    url.searchParams.set('to', b.label);
    if (date) url.searchParams.set('date', date);
    else url.searchParams.delete('date');
    history.replaceState(null, '', url);
    const at = (code: string): [number, number] => {
      const st = loaded.explore.stations[code];
      return [st[1], st[2]];
    };
    const roads: [number, number][][] = [];
    if (ans.journey.fromRailhead) roads.push([[a.lon, a.lat], at(ans.journey.fromRailhead.code)]);
    if (ans.journey.toRailhead) roads.push([at(ans.journey.toRailhead.code), [b.lon, b.lat]]);
    inputs.onRoute({
      paths: ans.journey.options[0]?.legs.map((l) => legPath(l, loaded.explore)) ?? [],
      roads,
      from: [a.lon, a.lat],
      to: [b.lon, b.lat],
      labels: [a.name, b.name],
    });
    inputs.onSearch(spoken(a.state), spoken(b.state));
    // Scroll only the panel: scrollIntoView would also shift the page and push the map away.
    const panel = result.closest<HTMLElement>('.panel')!;
    panel.scrollTo({ top: result.offsetTop - 8, behavior: 'smooth' });
  }

  async function openCard() {
    if (!current) return;
    dialog.showModal();
    blob = null;
    share.disabled = true;
    download.hidden = true;
    cardHint.textContent = ui().making;
    await document.fonts.ready;
    const { answer: a, from: p, to: q } = current;
    drawCard(canvas, { title: a.title, from: [p.lon, p.lat], to: [q.lon, q.lat], lines: a.facts, kicker: ui().cardKicker }, inputs.states() as never, inputs.siteUrl);
    canvas.setAttribute('aria-label', `Card: ${a.title}. ${a.facts.map((l) => `${l.text} (${l.source})`).join('. ')}`);
    // Make the file before the tap: some browsers refuse to share once an await
    // has passed inside the click handler.
    blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/png'));
    if (!blob) return;
    download.href = URL.createObjectURL(blob);
    download.download = `native-place-${p.name}-${q.name}.png`.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
    download.hidden = false;
    const file = new File([blob], download.download, { type: 'image/png' });
    share.disabled = !(navigator.canShare && navigator.canShare({ files: [file] }));
    cardHint.textContent = share.disabled ? ui().downloadOnly : ui().shareOrDownload;
  }

  warm = ready;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    search();
  });
  // One tap shows what an answer looks like.
  for (const chip of document.querySelectorAll<HTMLButtonElement>('.chip')) {
    chip.addEventListener('click', () => {
      from.value = chip.dataset.from!;
      to.value = chip.dataset.to!;
      void search();
    });
  }
  $<HTMLButtonElement>('#swap').addEventListener('click', () => {
    [from.value, to.value] = [to.value, from.value];
  });
  // Fetch the timetable as soon as someone starts typing, then suggest places.
  for (const input of [from, to]) {
    input.addEventListener('focus', () => void ready(), { once: true });
    attachSuggest(
      input,
      () => places,
      async (text) => (places ? townsFor(text, inputs.dataUrl, (await ready()).loaded.places) : []),
    );
  }
  $<HTMLButtonElement>('#card-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.querySelector<HTMLButtonElement>('#make-card')?.focus());
  share.addEventListener('click', () => {
    if (!blob || !current) return;
    const file = new File([blob], download.download, { type: 'image/png' });
    navigator.share({ files: [file], title: 'Native Place', text: `${current.answer.title} · ${location.href}` }).catch(() => {
      /* the person closed the share sheet */
    });
  });

  // A shared link opens straight on its answer.
  const params = new URLSearchParams(location.search);
  if (params.get('from') && params.get('to')) {
    from.value = params.get('from')!;
    to.value = params.get('to')!;
    when.value = params.get('date') ?? '';
    void search();
  }
}
