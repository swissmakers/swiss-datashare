import * as assert from "node:assert/strict";
import { getEmailCopy } from "../../src/email/i18n/messages";
import { normalizeEmailLocale } from "../../src/email/i18n/locales";
import { renderEmailTemplate } from "../../src/email/template/email-template.renderer";

function run() {
  assert.equal(normalizeEmailLocale("de"), "de-DE");
  assert.equal(normalizeEmailLocale("it-CH"), "it-IT");
  assert.equal(normalizeEmailLocale("unknown"), "en-US");

  const english = getEmailCopy("en-US");
  const german = getEmailCopy("de-DE");
  assert.notEqual(english.shareRecipients.subject, german.shareRecipients.subject);

  const rendered = renderEmailTemplate({
    preheader: "Preview text",
    title: "Email setup successful",
    introLines: ["Line one", "Line two"],
    actionLabel: "Open application",
    actionUrl: "https://example.test/app",
    securityNotice: "Security notice",
    branding: {
      appName: "Swiss DataShare",
      appUrl: "https://example.test",
      logoUrl: "https://example.test/img/logo.png",
      footerBrandText: "Powered by Swissmakers",
      footerBrandUrl: "https://swissmakers.ch",
      logoMaxWidthPx: 520,
      logoMaxHeightPx: 48,
    },
  });

  assert.match(rendered.html, /https:\/\/example\.test\/img\/logo\.png/);
  assert.match(rendered.html, /Powered by Swissmakers/);
  assert.match(rendered.text, /Open application: https:\/\/example\.test\/app/);

  const localizedValue = JSON.parse(
    JSON.stringify({
      "en-US": "EN text",
      "de-DE": "DE text",
      de: "DE base text",
    }),
  ) as Record<string, string>;
  assert.equal(localizedValue["de-DE"], "DE text");
}

run();
console.log("email-localization.smoke.ts: OK");
