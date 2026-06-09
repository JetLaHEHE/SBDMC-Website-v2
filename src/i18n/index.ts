export function getStaticPaths(): { params: { lang: string } }[] {
  return LANGUAGES.map((l) => ({
    params: { lang: l.code },
  }));
}

export const LANGUAGES = [
  { code: "en", label: "English", native: "English", locale: "en_PH", dir: "ltr" },
  { code: "zh", label: "Chinese", native: "中文", locale: "zh_TW", dir: "ltr" },
  { code: "tl", label: "Tagalog", native: "Tagalog", locale: "tl_PH", dir: "ltr" },
  { code: "ja", label: "Japanese", native: "日本語", locale: "ja_JP", dir: "ltr" },
  { code: "ko", label: "Korean", native: "한국어", locale: "ko_KR", dir: "ltr" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

export function getLangFromParams(params: { lang?: string }): LangCode {
  const lang = params.lang || "en";
  return (LANGUAGES.some((l) => l.code === lang) ? lang : "en") as LangCode;
}

export function t<T extends Record<string, any>>(
  translations: Record<string, T>,
  lang: LangCode,
): T {
  return translations[lang] ?? translations["en"];
}

const allCodes = LANGUAGES.map((l) => l.code).join("|");

export function getHreflangs(
  currentPath: string,
  baseUrl: string,
): { lang: string; href: string }[] {
  const re = new RegExp(`^/(${allCodes})\\/?`);
  const path = currentPath.replace(re, "/");
  return [
    ...LANGUAGES.map((l) => ({
      lang: l.code,
      href: `${baseUrl}${getLangPrefix(l.code)}${path}`,
    })),
    { lang: "x-default", href: `${baseUrl}${path}` },
  ];
}

export function getLangPrefix(lang: LangCode): string {
  return `/${lang}`;
}
