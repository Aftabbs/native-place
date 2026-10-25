// A static page for each popular route ("Bengaluru to Patna train"), so a search engine
// can send someone straight to an answer. Built from the same answer() the site uses.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { answer, type Answer, type Context } from '../src/answer';
import { CLASS_NAMES, type ExploreData } from '../src/explore';
import { buildPlaces, type Place, type Places, searchPlaces } from '../src/places';

export const SITE = 'https://native-place.pages.dev';

// Where people move for work, and the hometowns most of them travel back to.
const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Surat'];
const HOMETOWNS = [
  'Patna', 'Darbhanga', 'Muzaffarpur', 'Gaya', 'Bhagalpur', 'Purnia', 'Siwan', 'Saharsa', 'Samastipur',
  'Begusarai', 'Kishanganj', 'Lucknow', 'Gorakhpur', 'Varanasi', 'Prayagraj', 'Kanpur', 'Azamgarh',
  'Ballia', 'Deoria', 'Ranchi', 'Dhanbad', 'Kolkata', 'Malda', 'Bhubaneswar', 'Cuttack', 'Guwahati',
  'Thiruvananthapuram', 'Ernakulam', 'Kozhikode', 'Thrissur', 'Madurai', 'Tirunelveli', 'Coimbatore',
  'Visakhapatnam', 'Vijayawada', 'Hubballi', 'Belagavi', 'Kadur', 'Jaipur', 'Jodhpur', 'Bhopal', 'Nagpur',
];

interface RoutePage {
  slug: string;
  from: Place;
  to: Place;
  // The names people search for: Bhubaneswar, not its district Khordha.
  fromName: string;
  toName: string;
  answer: Answer;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const rupees = (n: number) => n.toLocaleString('en-IN');

function context(dataDir: string, today: string): Context {
  const load = (name: string) => JSON.parse(readFileSync(join(dataDir, name), 'utf8'));
  return {
    explore: load('explore.json'),
    fares: load('fares.json'),
    specials: load('specials-2026.json'),
    migration: load('migration-2011.json'),
    travel: load('rail-travel-2023.json'),
    today,
  };
}

/** Every city-to-hometown pair that has a train, or a one-change route. */
export function routePages(dataDir: string, today: string): RoutePage[] {
  const ctx = context(dataDir, today);
  const places = buildPlaces(JSON.parse(readFileSync(join(dataDir, 'places.json'), 'utf8')) as Places, ctx.explore as ExploreData);
  const pages: RoutePage[] = [];
  for (const city of CITIES) {
    for (const town of HOMETOWNS) {
      const [from] = searchPlaces(city, places, 1);
      const [to] = searchPlaces(town, places, 1);
      if (!from || !to || from.name === to.name) continue;
      const a = answer(from, to, ctx);
      if (!a.steps.length) continue;
      pages.push({ slug: `${slugOf(city)}-to-${slugOf(town)}`, from, to, fromName: city, toName: town, answer: a });
    }
  }
  return pages;
}

const STYLE = `
:root { color-scheme: dark; --bg: #070b16; --panel: #0e1528; --text: #e8ecf5; --muted: #a9b3c8; --accent: #ffb347; --line: #22304d; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
.wrap { max-width: 720px; margin: 0 auto; padding: 24px 16px 0; }
main.wrap { padding-bottom: 48px; }
a { color: var(--accent); }
a:focus-visible, .button:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
.brand { font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); text-decoration: none; }
h1 { font-size: clamp(1.6rem, 5vw, 2.2rem); line-height: 1.2; margin: 12px 0 8px; }
h2 { font-size: 1.15rem; margin: 28px 0 8px; }
.lead { color: var(--muted); margin: 0 0 16px; }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 16px; margin: 12px 0; }
.card strong { display: block; font-size: 1.05rem; }
.small { color: var(--muted); font-size: .9rem; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 8px 4px; border-bottom: 1px solid var(--line); }
.button { display: inline-block; min-height: 44px; padding: 11px 18px; border-radius: 10px; background: var(--accent); color: #111; font-weight: 700; text-decoration: none; }
ul.routes { columns: 2 220px; padding-left: 18px; }
footer { margin-top: 40px; color: var(--muted); font-size: .85rem; }
`;

function shell(opts: { title: string; description: string; path: string; body: string; root: string }): string {
  const url = `${SITE}/${opts.path}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(opts.description)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:site_name" content="Native Place" />
<meta property="og:title" content="${esc(opts.title)}" />
<meta property="og:description" content="${esc(opts.description)}" />
<meta property="og:image" content="${SITE}/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="#070b16" />
<style>${STYLE}</style>
<script>window.goatcounter = { path: () => location.pathname };</script>
<script data-goatcounter="https://aftab.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</head>
<body>
<header class="wrap"><a class="brand" href="${opts.root}">● Native Place</a></header>
<main class="wrap">
${opts.body}
<footer>Timings: Trains at a Glance 2026, Ministry of Railways. Fares: official fare tables. Special trains: zonal railway notices. Places: GeoNames (CC BY 4.0). Book on <a href="https://www.irctc.co.in/" rel="noopener">IRCTC</a>. <a href="${opts.root}methods.html">How this was made</a></footer>
</main>
</body>
</html>
`;
}

function routeHtml(page: RoutePage, others: RoutePage[]): string {
  const { from, to, fromName, toName, answer: a } = page;
  const [first] = a.steps;
  const title = `${fromName} to ${toName} train: fastest train, timings and fare (2026)`;
  const description = `${first.train}: ${first.from} ${first.dep} to ${first.to} ${first.arr}, ${first.duration}, ${first.days}.${a.fares[0] ? ` ${CLASS_NAMES[a.fares[0].cls] ?? a.fares[0].cls} from ₹${rupees(a.fares[0].low)}.` : ''} From the official 2026 timetable.`;
  const steps = a.steps
    .map(
      (s, i) => `<div class="card"><strong>${esc(s.train)}</strong>
${esc(s.from)} <b>${esc(s.dep)}</b> → ${esc(s.to)} <b>${esc(s.arr)}</b><br />
<span class="small">${esc(s.duration)} · ${esc(s.days)}</span>
${i === 0 && a.wait ? `<p class="small">Change here. Wait about ${esc(a.wait)}.</p>` : ''}</div>`,
    )
    .join('\n');
  const fares = a.fares.length
    ? `<h2>Fare per person (estimate)</h2>
<table><thead><tr><th scope="col">Class</th><th scope="col">Fare</th></tr></thead><tbody>
${a.fares.map((f) => `<tr><th scope="row">${esc(CLASS_NAMES[f.cls] ?? f.cls)}</th><td>₹${rupees(f.low)}${f.high > f.low ? `–${rupees(f.high)}` : ''}</td></tr>`).join('\n')}
</tbody></table>
<p class="small">From the official fare tables. Meals, Tatkal and dynamic pricing are not included.</p>`
    : '';
  const more = a.alternatives.length
    ? `<h2>Other trains</h2><ul>${a.alternatives.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
    : '';
  const specials = a.specials.length
    ? `<h2>Special trains this season</h2><ul>${a.specials
        .slice(0, 5)
        .map((s) => `<li><b>${esc(s.n)}</b> ${esc(s.name)} · <a href="${esc(s.source)}" rel="noopener">notice</a></li>`)
        .join('')}</ul>`
    : '';
  const app = `../../?from=${encodeURIComponent(from.label)}&to=${encodeURIComponent(to.label)}`;
  const nearby = others
    .filter((o) => o !== page && (o.fromName === fromName || o.toName === toName))
    .slice(0, 12)
    .map((o) => `<li><a href="../${o.slug}/">${esc(o.fromName)} to ${esc(o.toName)}</a></li>`)
    .join('');
  const body = `<h1>${esc(fromName)} to ${esc(toName)} train</h1>
<p class="lead">${esc(a.headline)}, from the official 2026 railway timetable.</p>
${a.notes.map((n) => `<p>${esc(n)}</p>`).join('\n')}
${steps}
<p><a class="button" href="${app}">Check trains on your date</a></p>
${more}
${fares}
${specials}
<h2>More routes</h2>
<ul class="routes">${nearby}</ul>
<p><a href="../">All popular routes</a></p>`;
  return shell({ title, description, path: `train/${page.slug}/`, body, root: '../../' });
}

function indexHtml(pages: RoutePage[]): string {
  const byCity = new Map<string, RoutePage[]>();
  for (const p of pages) (byCity.get(p.fromName) ?? byCity.set(p.fromName, []).get(p.fromName)!).push(p);
  const sections = [...byCity]
    .map(
      ([city, list]) => `<h2>From ${esc(city)}</h2>
<ul class="routes">${list.map((p) => `<li><a href="${p.slug}/">${esc(p.fromName)} to ${esc(p.toName)}</a></li>`).join('')}</ul>`,
    )
    .join('\n');
  const body = `<h1>Trains to your hometown: popular routes</h1>
<p class="lead">The fastest train, the days it runs and the fare range, from the official 2026 timetable. For any other town or village, <a href="../">search on the main page</a>.</p>
${sections}`;
  return shell({
    title: 'Trains to your hometown: popular routes in India (2026)',
    description: 'Fastest trains, timings and fares between India’s big cities and the hometowns people travel back to, from the official 2026 timetable.',
    path: 'train/',
    body,
    root: '../',
  });
}

/** Writes train/<route>/index.html, train/index.html, sitemap.xml and robots.txt into outDir. */
export function writeRoutePages(dataDir: string, outDir: string, today: string): number {
  const pages = routePages(dataDir, today);
  for (const page of pages) {
    const dir = join(outDir, 'train', page.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), routeHtml(page, pages));
  }
  writeFileSync(join(outDir, 'train', 'index.html'), indexHtml(pages));
  const urls = ['', 'methods.html', 'train/', ...pages.map((p) => `train/${p.slug}/`)];
  writeFileSync(
    join(outDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${SITE}/${u}</loc><lastmod>${today}</lastmod></url>`)
      .join('\n')}\n</urlset>\n`,
  );
  writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  return pages.length;
}
