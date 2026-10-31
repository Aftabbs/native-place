import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { routePages, specialsByState } from '../scripts/route-pages';

const pages = routePages(fileURLToPath(new URL('../public/data', import.meta.url)), '2026-10-25');

describe('route pages', () => {
  it('are named after the cities people search for, not their districts', () => {
    const slugs = pages.map((p) => p.slug);
    expect(slugs).toContain('bengaluru-to-patna');
    expect(slugs).toContain('delhi-to-bhubaneswar');
    expect(slugs.some((s) => /khordha|kamrup|kanpur-nagar/.test(s))).toBe(false);
  });

  it('only exist where a train runs, each with its own answer', () => {
    expect(pages.length).toBeGreaterThan(300);
    expect(new Set(pages.map((p) => p.slug)).size).toBe(pages.length);
    for (const page of pages) expect(page.answer.steps.length).toBeGreaterThan(0);
  });
});

describe('specials page', () => {
  const dir = fileURLToPath(new URL('../public/data', import.meta.url));

  it('leaves out trains that have stopped running', () => {
    const early = specialsByState(dir, '2026-10-25').flatMap(([, list]) => list);
    const late = specialsByState(dir, '2026-12-31').flatMap(([, list]) => list);
    expect(early.length).toBeGreaterThan(100);
    expect(late.length).toBeLessThan(early.length);
    for (const s of late) expect((s.last ?? '9999') >= '2026-12-31');
  });

  it('puts the state with the most trains first', () => {
    const groups = specialsByState(dir, '2026-10-25');
    expect(groups[0][0]).toBe('Bihar');
    for (let i = 1; i < groups.length; i++) expect(groups[i - 1][1].length).toBeGreaterThanOrEqual(groups[i][1].length);
  });
});
