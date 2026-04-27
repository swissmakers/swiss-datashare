import Document, { Head, Html, Main, NextScript } from "next/document";

const themeInitScript = `
(() => {
  try {
    const match = document.cookie.match(/(?:^|; )theme=([^;]+)/);
    const savedTheme = match ? decodeURIComponent(match[1]) : "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme === "dark" || (savedTheme === "system" && prefersDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  } catch (_) {}
})();
`;

export default class _Document extends Document {
  render() {
    return (
      <Html suppressHydrationWarning>
        <Head>
          <script
            dangerouslySetInnerHTML={{ __html: themeInitScript }}
          />
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" type="image/x-icon" href="/img/favicon.ico" />
          <link rel="apple-touch-icon" href="/img/icons/icon-192x192.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />

          <meta name="robots" content="noindex" />
          <meta name="theme-color" content="#2A5BD6" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
