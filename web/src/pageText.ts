// The fixed words on the page, in the chosen language, and the switch between them.

import { lang, setLang, ui, type UiText } from './i18n';

type TextKey = { [K in keyof UiText]: UiText[K] extends string ? K : never }[keyof UiText];

function text(key: string | undefined): string | null {
  const value = key ? ui()[key as TextKey] : undefined;
  return typeof value === 'string' ? value : null;
}

/** Fill every element marked data-i18n, data-i18n-placeholder or data-i18n-aria. */
export function applyPageText() {
  const t = ui();
  document.documentElement.lang = lang();
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    const value = text(el.dataset.i18n);
    if (value !== null) el.textContent = value;
  }
  for (const el of document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]')) {
    const value = text(el.dataset.i18nPlaceholder);
    if (value !== null) el.placeholder = value;
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n-aria]')) {
    const value = text(el.dataset.i18nAria);
    if (value !== null) el.setAttribute('aria-label', value);
  }
  const button = document.querySelector<HTMLButtonElement>('#lang');
  if (button) {
    button.textContent = t.switchTo;
    button.setAttribute('aria-label', t.switchLabel);
    button.lang = lang() === 'hi' ? 'en' : 'hi'; // the button is written in the other language
  }
}

/** The English / हिन्दी button; the choice goes in the link so a shared answer keeps it. */
export function setupLanguageSwitch() {
  document.querySelector<HTMLButtonElement>('#lang')?.addEventListener('click', () => {
    const next = lang() === 'hi' ? 'en' : 'hi';
    const url = new URL(location.href);
    if (next === 'hi') url.searchParams.set('lang', 'hi');
    else url.searchParams.delete('lang');
    history.replaceState(null, '', url);
    setLang(next);
  });
  document.addEventListener('langchange', applyPageText);
  applyPageText();
}
