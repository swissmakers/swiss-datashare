import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "Swiss DataShare",
  tagline:
    "Swiss DataShare is self-hosted file sharing platform and an alternative for WeTransfer.",
  favicon: "img/logo.png",

  url: "https://github.com/swissmakers",
  baseUrl: "/swiss-datashare/",
  organizationName: "swissmakers",
  projectName: "swiss-datashare",

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/swissmakers/swiss-datashare/edit/main/docs",
        },
        blog: false,
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/logo.png",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Swiss DataShare",
      logo: {
        alt: "Swiss DataShare Logo",
        src: "img/logo.png",
      },
      items: [
        {
          href: "https://github.com/swissmakers/swiss-datashare",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
