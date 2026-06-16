import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  site: "https://sbdmc.com",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh", "tl", "ja", "ko"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
      strategy: "prefix-other-locales",
    },
  },
  integrations: [
    sitemap({
      i18n: {
        locales: {
          en: "en-PH",
          zh: "zh-TW",
          tl: "tl-PH",
          ja: "ja-JP",
          ko: "ko-KR",
        },
        defaultLocale: "en",
      },
    }),
  ],
});
