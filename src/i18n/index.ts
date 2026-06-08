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

export function getStaticPaths(): { params: { lang?: string } }[] {
  return [
    { params: { lang: undefined } },
    { params: { lang: "zh" } },
    { params: { lang: "tl" } },
    { params: { lang: "ja" } },
    { params: { lang: "ko" } },
  ];
}

export function t<T extends Record<string, any>>(
  translations: Record<string, T>,
  lang: LangCode,
): T {
  return translations[lang] ?? translations["en"];
}

export function getHreflangs(
  currentPath: string,
  baseUrl: string,
): { lang: string; href: string }[] {
  const path = currentPath.replace(/^\/(zh|tl|ja|ko)\/?/, "/");
  return [
    { lang: "en", href: `${baseUrl}${path}` },
    { lang: "zh", href: `${baseUrl}/zh${path}` },
    { lang: "tl", href: `${baseUrl}/tl${path}` },
    { lang: "ja", href: `${baseUrl}/ja${path}` },
    { lang: "ko", href: `${baseUrl}/ko${path}` },
    { lang: "x-default", href: `${baseUrl}${path}` },
  ];
}

export function getLangPrefix(lang: LangCode): string {
  return lang === "en" ? "" : `/${lang}`;
}
