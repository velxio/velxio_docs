// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// Official end-user documentation for Velxio (https://velxio.dev).
// Served in production under https://velxio.dev/docs/ — every asset URL is
// prefixed via `base`, mirroring how the blog ships at /blog/.
export default defineConfig({
  site: "https://velxio.dev",
  base: "/docs",
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Velxio Docs",
      description:
        "Official documentation for Velxio — the online electronics simulator. Learn to build circuits, write and run code on virtual boards, and use the AI assistant.",
      logo: { src: "./src/assets/velxio-logo.svg", alt: "Velxio" },
      favicon: "/favicon.svg",
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/velxio" },
        { icon: "seti:html", label: "velxio.dev", href: "https://velxio.dev" },
      ],
      customCss: ["./src/styles/custom.css"],
      /* The light/dark preference is shared with velxio.dev and the blog
         (one origin, one localStorage jar). These two overrides are stock
         Starlight with the storage key swapped — see the comments in each. */
      components: {
        ThemeProvider: "./src/components/ThemeProvider.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
      },
      defaultLocale: "root",
      // Same 9 locales as the blog. Untranslated pages fall back to
      // English automatically; the translate-* scripts fill them in.
      locales: {
        root: { label: "English", lang: "en" },
        es: { label: "Español", lang: "es" },
        "pt-br": { label: "Português do Brasil", lang: "pt-BR" },
        it: { label: "Italiano", lang: "it" },
        fr: { label: "Français", lang: "fr" },
        "zh-cn": { label: "简体中文", lang: "zh-CN" },
        de: { label: "Deutsch", lang: "de" },
        ja: { label: "日本語", lang: "ja" },
        ru: { label: "Русский", lang: "ru" },
      },
      editLink: { baseUrl: "https://github.com/velxio/velxio_docs/edit/main/" },
      sidebar: [
        {
          label: "Getting Started",
          translations: { es: "Empezar" },
          items: [{ autogenerate: { directory: "getting-started" } }],
        },
        {
          label: "Circuit Editor",
          translations: { es: "Editor de circuitos" },
          items: [{ autogenerate: { directory: "circuit-editor" } }],
        },
        {
          label: "Code & Run",
          translations: { es: "Programar y correr" },
          items: [{ autogenerate: { directory: "programming" } }],
        },
        {
          label: "Instruments",
          translations: { es: "Instrumentos" },
          items: [{ autogenerate: { directory: "instruments" } }],
        },
        {
          label: "Boards",
          translations: { es: "Placas" },
          items: [{ autogenerate: { directory: "boards" } }],
        },
        {
          label: "Parts Reference",
          translations: { es: "Referencia de componentes" },
          items: [{ autogenerate: { directory: "parts" } }],
          collapsed: true,
        },
        {
          label: "WiFi & IoT",
          translations: { es: "WiFi e IoT" },
          items: [{ autogenerate: { directory: "wifi-iot" } }],
        },
        {
          label: "Custom Chips",
          translations: { es: "Chips personalizados" },
          items: [{ autogenerate: { directory: "custom-chips" } }],
        },
        {
          label: "AI Assistant",
          translations: { es: "Asistente IA" },
          items: [{ autogenerate: { directory: "ai" } }],
        },
        {
          label: "Account & Plans",
          translations: { es: "Cuenta y planes" },
          items: [{ autogenerate: { directory: "account" } }],
        },
      ],
    }),
  ],
});
