import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { routePages } from '../scripts/route-pages';

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
