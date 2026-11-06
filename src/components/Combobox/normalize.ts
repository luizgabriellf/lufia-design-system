/** Lower-cases and strips diacritics so "sao" finds "São". Internal: the default filter of `Combobox`. */
export function normalizeForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .trim();
}
